import { useState, useEffect } from "react";
import { SUPPORTED_CHAINS, ChainId } from "@/config/chains";
import { useVaultData } from "@/hooks/useVaultData";
import { ethers } from "ethers";
import { IERC20 } from "@/hooks/abi/IERC20";
// import { initializeMSO } from '@/utils/msoInitializer';
import { useVaultDeployments } from "@/hooks/useVaultDeployments";
import { IVault } from "@/hooks/abi/IVault";
import { MSO_ABI } from "@/hooks/abi/MSO_ABI";
import { useWallet } from "@/context/WalletContext";
import { vaultApi } from "@/lib/axios";
import { useToast } from "@/context/ToastContext";
import { splitSignature } from "@/utils/signature";
import { MSOInitializer } from "@/hooks/abi/MSOInitializer";
import { TransactionModal } from "./TransactionModal";
import { IComptrollerLib } from "@/hooks/abi/IComptrollerLib";

interface VaultFormProps {
  onSubmit: (
    vault: {
      vaultAddress: string;
      tokenName: string;
      tokenSymbol: string;
      softCap: string;
      launchWaitingPeriod: string;
      signature: {
        r: string;
        s: string;
        v: number;
      };
    },
    fund: any // Add the fund parameter
  ) => Promise<void>; // Make it async
  isLoading?: boolean;
}

interface MSOParams {
  tokenName: string;
  tokenSymbol: string;
  softCap: string;
  launchWaitingPeriod: string;
  minimumTokenShare: string;
}

const MSO_INITIALIZER_ADDRESS = process.env.NEXT_PUBLIC_INIT_ADDRESS as string;
const INVESTMENT_TOKEN_ADDRESS = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"; // USDC on Polygon

interface GasEstimate {
  gasLimit: bigint;
  gasPriceGwei: string;
  estimatedCost: string;
  nativeCurrency: string;
}

interface VaultFormData {
  vaultAddress: string;
  tokenName: string;
  tokenSymbol: string;
  softCap: string;
  launchWaitingPeriod: string;
  minimumTokenShare: string;
}

async function fetchVaultDenominationAsset(
  vaultAddress: string,
  provider: ethers.Provider
) {
  const vaultContract = new ethers.Contract(vaultAddress, IVault, provider);
  return await vaultContract.getDenominationAsset(); // or the correct method name
}

export function VaultForm({ onSubmit }: VaultFormProps) {
  const { account, provider, chainId } = useWallet();
  const { showError, showSuccess } = useToast();

  // a list of allowed tokens to all chain mainet, polygon, arbitrum, base, optimism, avalanche, fantom, gnosis, bsc, etc
  // there can multiple tokens for the same chain
  // the token address is the same for the same token in different chains
  // the token address is the same for the same token in different chains
  // the token address is the same for the same token in different chains
  // the token address is the same for the same token in different chains
  // the token address is the same for the same token in different chains
  // the token address is the same for the same token in different chains
  const allowedTokens = [
    {
      chainId: 1,
      tokenList: [
        {
          tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          tokenName: "USDC",
          tokenSymbol: "USDC",
        },
      ],
    },
    {
      chainId: 137,
      tokenList: [
        {
          tokenAddress: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
          tokenName: "USDC.e",
          tokenSymbol: "USDC.e",
        },
      ],
    },
    {
      chainId: 42161,
      tokenList: [],
    },
  ];

  const [selectedToken, setSelectedToken] = useState<any>(null);
  // Form fields
  const [vaultAddress, setVaultAddress] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [softCap, setSoftCap] = useState("");
  const [launchWaitingPeriod, setLaunchWaitingPeriod] = useState("");
  const [minimumTokenShare, setMinimumTokenShare] = useState("1"); // Default value

  // Form state
  const [isCheckingOwnership, setIsCheckingOwnership] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    status: "loading" | "success" | "error";
    message?: string;
  }>({ status: "loading" });
  const [transactionParams, setTransactionParams] = useState<any>(null);
  const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null);

  const [formData, setFormData] = useState<VaultFormData>({
    vaultAddress,
    tokenName,
    tokenSymbol,
    softCap,
    launchWaitingPeriod,
    minimumTokenShare,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof VaultFormData, string>>
  >({});

  const validateInputs = () => {
    // setLaunchWaitingPeriod(formData.launchWaitingPeriod);
    // setMinimumTokenShare(formData.minimumTokenShare);
    console.log(formData, "formData");
    console.log(
      tokenName,
      "tokenName",
      tokenSymbol,
      "tokenSymbol",
      softCap,
      "softCap",
      launchWaitingPeriod,
      "launchWaitingPeriod"
    );
    if (!tokenName || tokenName.length < 3) {
      showError("Token name must be at least 3 characters");
      return false;
    }
    console.log("first passed ");
    if (!tokenSymbol || tokenSymbol.length < 2) {
      showError("Token symbol must be at least 2 characters");
      return false;
    }
    console.log("second passed ");
    if (!softCap || Number(softCap) <= 0) {
      showError("Soft cap must be greater than 0");
      return false;
    }
    console.log("third passed ", launchWaitingPeriod);
    // it is days
    if (
      !launchWaitingPeriod ||
      Number(launchWaitingPeriod) < 1 ||
      isNaN(Number(launchWaitingPeriod))
    ) {
      // minimum 1 day
      showError("Launch waiting period must be at least 1 day");
      return false;
    }

    // or not a number
    if (
      !minimumTokenShare ||
      Number(minimumTokenShare) < 0 ||
      isNaN(Number(minimumTokenShare))
    ) {
      showError("Minimum token share must be greater than 0");
      return false;
    }
    console.log("fourth passed ");
    return true;
  };

  const checkVaultOwnership = async (address: string) => {
    if (!provider || !address || !account) return;

    setIsCheckingOwnership(true);
    setError("");

    try {
      if (!ethers.isAddress(address)) {
        setError("Invalid address format");
        setIsOwner(false);
        return;
      }

      const vaultContract = new ethers.Contract(address, IVault, provider);
      const vaultOwner = await vaultContract.getOwner();
      const accessorAddress = await vaultContract.getAccessor();

      setIsOwner(vaultOwner.toLowerCase() === account.toLowerCase());
      if (vaultOwner.toLowerCase() !== account.toLowerCase()) {
        setError("You are not the owner of this vault");
      }

      const accessorContract = new ethers.Contract(
        accessorAddress,
        IComptrollerLib,
        provider
      );

      // Get denomination asset
      const denominationAsset = await accessorContract.getDenominationAsset();
      const denominationAssetContract = new ethers.Contract(
        denominationAsset,
        IERC20,
        provider
      );
      const denominationAssetSymbol = await denominationAssetContract.symbol();
      const denominationAssetName = await denominationAssetContract.name();
      setSelectedToken({
        tokenAddress: denominationAsset,
        tokenSymbol: denominationAssetSymbol,
        tokenName: denominationAssetName,
      });

      console.log(
        selectedToken,
        "selectedToken1",
        denominationAssetSymbol,
        denominationAssetName
      );
    } catch (err) {
      setError("Invalid vault address or failed to check ownership");
      setIsOwner(false);
      console.log(err, "err");
    } finally {
      setIsCheckingOwnership(false);
    }
  };

  const checkPreConditions = async (params: any) => {
    if (!provider || !account) {
      throw new Error("Provider or account not available");
    }

    const signer = await provider.getSigner();
    const initializer = new ethers.Contract(
      MSO_INITIALIZER_ADDRESS,
      MSOInitializer,
      signer
    );

    // Check if MSO already exists for this vault
    const existingMSO = await initializer.vaultRegistry(params.vaultAddress);
    if (existingMSO !== ethers.ZeroAddress) {
      setSimulationResult({
        status: "error",
        message: "MSO already created for this vault",
      });
      return false;
      // throw new Error("MSO already created for this vault");
    }

    // Check vault ownership
    const vaultContract = new ethers.Contract(
      params.vaultAddress,
      IVault,
      provider
    );
    const owner = await vaultContract.getOwner();
    if (owner.toLowerCase() !== account.toLowerCase()) {
      setSimulationResult({
        status: "error",
        message: "Only owner can initialize",
      });
      return false;
      // throw new Error("Only owner can initialize");
    }

    // Check if investment token fee is set
    const [initFee, syncFee, totalFee] =
      await initializer.getInvestmentTokenFee(params.investmentToken);

    if (initFee === BigInt(0)) {
      setSimulationResult({
        status: "error",
        message: "Investment token fee not configured",
      });
      return false;
      // throw new Error("Investment token fee not configured");
    }

    // Check token allowance
    const tokenContract = new ethers.Contract(
      params.investmentToken,
      [
        "function allowance(address,address) view returns (uint256)",
        "function balanceOf(address) view returns (uint256)",
      ],
      provider
    );

    const allowance = await tokenContract.allowance(
      account,
      MSO_INITIALIZER_ADDRESS
    );
    if (allowance < initFee) {
      setSimulationResult({
        status: "error",
        message: `Insufficient allowance. Please approve at least ${ethers.formatUnits(
          initFee,
          6
        )} ${selectedToken ? selectedToken.tokenSymbol : null}`,
      });
      return false;
      // throw new Error(
      //   `Insufficient allowance. Please approve at least ${ethers.formatUnits(
      //     initFee,
      //     6
      //   )} USDC`
      // );
    }

    // Check token balance
    const balance = await tokenContract.balanceOf(account);
    if (balance < initFee) {
      setSimulationResult({
        status: "error",
        message: `Insufficient balance. You need ${ethers.formatUnits(
          initFee,
          6
        )} ${
          selectedToken ? selectedToken.tokenSymbol : null
        } for initialization fee`,
      });
      return false;
      // throw new Error(
      //   `Insufficient balance. You need ${ethers.formatUnits(
      //     initFee,
      //     6
      //   )} USDC for initialization fee`
      // );
    }

    return { initFee, syncFee, totalFee };
  };

  const simulateTransaction = async (params: any) => {
    if (!provider) {
      throw new Error("Provider not available");
    }

    try {
      // Check all pre-conditions first
      const fees = await checkPreConditions(params);
      console.log(fees, "fees");
      if (!fees) {
        return;
      }

      const signer = await provider.getSigner();
      const initializer = new ethers.Contract(
        MSO_INITIALIZER_ADDRESS,
        MSOInitializer,
        signer
      );

      console.log(params, "params");

      // Estimate gas
      const gasLimit = await initializer.initializeMSO.estimateGas(
        params.vaultAddress,
        params.investmentToken,
        params.softCap,
        params.launchWaitingPeriod,
        params.minimumTokenShare,
        params.tokenName,
        params.tokenSymbol,
        params.r,
        params.s,
        params.v
      );

      console.log(gasLimit, "gasLimit");

      // Get current gas price
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice ?? BigInt(0);

      // Calculate total cost in native currency (MATIC)
      const totalCost = gasLimit * gasPrice;

      // Format gas estimates
      setGasEstimate({
        gasLimit,
        gasPriceGwei: ethers.formatUnits(gasPrice, "gwei"),
        estimatedCost: ethers.formatEther(totalCost),
        nativeCurrency: "MATIC",
      });

      setSimulationResult({ status: "success" });
    } catch (error: any) {
      console.error("Simulation error details:", error);

      let errorMessage = "Unknown error";

      if (error.data) {
        try {
          const decodedError = ethers.toUtf8String(
            `0x${error.data.slice(138)}`
          );
          errorMessage = decodedError.replace(/\\u0000/g, "");
        } catch (e) {
          console.error("Error decoding data:", e);
        }
      }

      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        const revertStringMatch = error.message.match(
          /reverted with reason string '([^']+)'/
        );
        if (revertStringMatch) {
          errorMessage = revertStringMatch[1];
        } else if (error.message.includes("execution reverted:")) {
          errorMessage = error.message.split("execution reverted:")[1].trim();
        }
      }

      setSimulationResult({
        status: "error",
        message: errorMessage,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner || isSubmitting || !provider || !account || !chainId) return;

    setIsSubmitting(true);
    try {
      // Validate inputs
      // console.log(validateInputs(), "validateForm");
      if (!validateInputs()) {
        setIsSubmitting(false);
        return;
      }

      // get selected token decimals
      const selectedTokenContract = new ethers.Contract(
        selectedToken?.tokenAddress,
        IERC20,
        provider
      );
      const selectedTokenDecimals = await selectedTokenContract.decimals();

      // Convert values to BigInt strings exactly as they'll be used in the contract
      const softCapUsdc = ethers.parseUnits(softCap, selectedTokenDecimals); // format to usdc
      const launchWaitingPeriodBN = BigInt(
        Number(launchWaitingPeriod) * 24 * 60 * 60
      );

      const minimumTokenShareBN = BigInt(minimumTokenShare);

      // Get signature from server with exact parameter formats
      const signatureResponse = await vaultApi.post("/get-signature", {
        vaultAddress,
        vaultOwner: account,
        chainId,
        minimumTokenShare: minimumTokenShareBN.toString(),
        investmentToken: selectedToken?.tokenAddress,
        softCap: softCapUsdc.toString(),
        launchWaitingPeriod: launchWaitingPeriodBN.toString(),
        tokenName,
        tokenSymbol,
      });

      if (!signatureResponse.data.signature) {
        throw new Error("Invalid signature received from server");
      }

      // Split the signature
      const { r, s, v } = splitSignature(signatureResponse.data.signature);

      console.log(selectedToken, "selectedToken.tokenAddress");

      // Prepare transaction parameters with exact same values used in signature request
      const params = {
        vaultAddress,
        investmentToken: selectedToken.tokenAddress,
        softCap: softCapUsdc,
        launchWaitingPeriod: launchWaitingPeriodBN,
        minimumTokenShare: minimumTokenShareBN,
        tokenName,
        tokenSymbol,
        r,
        s,
        v,
      };

      // Create contract instance for simulation
      const signer = await provider.getSigner();
      const initializer = new ethers.Contract(
        MSO_INITIALIZER_ADDRESS,
        MSOInitializer,
        signer
      );

      setTransactionParams(params);
      setSimulationResult({ status: "loading" });
      setShowTransactionModal(true);

      // Simulate transaction
      await simulateTransaction(params);
    } catch (error: any) {
      console.error("Detailed error:", error); // For debugging
      let errorMessage = "Failed to prepare transaction";

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeTransaction = async () => {
    if (!transactionParams || !provider) return;

    try {
      const signer = await provider.getSigner();
      const initializer = new ethers.Contract(
        MSO_INITIALIZER_ADDRESS,
        MSOInitializer,
        signer
      );

      const tx = await initializer.initializeMSO(
        transactionParams.vaultAddress,
        transactionParams.investmentToken,
        transactionParams.softCap,
        transactionParams.launchWaitingPeriod,
        transactionParams.minimumTokenShare,
        transactionParams.tokenName,
        transactionParams.tokenSymbol,
        transactionParams.r,
        transactionParams.s,
        transactionParams.v
      );

      showSuccess("Transaction submitted. Waiting for confirmation...");

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        showSuccess("MSO successfully created!");
        setShowTransactionModal(false);
        // Reset form or redirect
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error: any) {
      showError(error?.message || "Transaction failed");
    }
  };

  // Check ownership when vault address changes
  useEffect(() => {
    if (vaultAddress && vaultAddress.length === 42) {
      checkVaultOwnership(vaultAddress);
    } else {
      setIsOwner(false);
      setError("");
    }
  }, [vaultAddress, account, provider]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof VaultFormData, string>> = {};

    // ... existing validations ...

    // Updated Minimum Token Share validation
    if (formData.minimumTokenShare === "") {
      newErrors.minimumTokenShare = "Minimum token share is required";
    } else if (isNaN(Number(formData.minimumTokenShare))) {
      newErrors.minimumTokenShare = "Must be a valid number";
    } else if (Number(formData.minimumTokenShare) < 0) {
      newErrors.minimumTokenShare = "Cannot be negative";
    } else if (Number(formData.minimumTokenShare) >= Number(formData.softCap)) {
      newErrors.minimumTokenShare = "Must be less than soft cap";
    }

    // Validate launchWaitingPeriod
    if (!formData.launchWaitingPeriod) {
      newErrors.launchWaitingPeriod = "Launch waiting period is required";
    } else if (isNaN(Number(formData.launchWaitingPeriod))) {
      newErrors.launchWaitingPeriod = "Must be a valid number";
    } else {
      const days = Number(formData.launchWaitingPeriod);
      if (days < 1) {
        newErrors.launchWaitingPeriod = "Must be at least 1 day";
      } else if (days > 30) {
        newErrors.launchWaitingPeriod = "Cannot exceed 30 days";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <>
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Vault Address Section */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Vault Address (0x...)
            </label>
            <div className="relative">
              <input
                type="text"
                value={vaultAddress}
                onChange={(e) => setVaultAddress(e.target.value)}
                style={{ color: "black" }}
                className={`block w-full rounded-md shadow-sm px-4 py-3 border ${
                  error
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : isOwner
                    ? "border-green-300 focus:border-green-500 focus:ring-green-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                } transition-colors`}
                placeholder="Enter your vault address your token will be linked to --- Ownership is required"
              />
              {isCheckingOwnership && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </p>
            )}
            {isOwner && (
              <p className="mt-2 text-sm text-green-600 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Vault ownership verified
              </p>
            )}
          </div>

          {/* MSO Configuration Section */}
          {isOwner && (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Launch Configuration
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Token Name
                  </label>
                  <input
                    style={{ color: "black" }}
                    type="text"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                    required
                    placeholder="Enter token name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ticker
                  </label>
                  <input
                    style={{ color: "black" }}
                    type="text"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                    required
                    placeholder="Enter token symbol"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LP Seed Liquidity
                  </label>
                  <input
                    style={{ color: "black" }}
                    type="number"
                    value={softCap}
                    onChange={(e) => setSoftCap(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                    required
                    min="0"
                    placeholder="Enter the minimum liquidity required to create the pool"
                  />
                </div>

                {/* create a new input to select the token that will be used to create the pool */}
                {/* only token in list is USDC inlcude the address of the token in the option as value */}
                {/* list is determined by the chainId from the list allowedTokens */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Liquidity Token
                  </label>
                  <input
                    style={{ color: "black" }}
                    type="text"
                    value={
                      selectedToken
                        ? `${selectedToken.tokenName} (${selectedToken.tokenSymbol})`
                        : "No token selected"
                    }
                    readOnly
                    className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-700 cursor-not-allowed"
                    tabIndex={-1}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="launchWaitingPeriod"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Liquidity Lock Period
                  </label>
                  <div className="mt-1 relative">
                    <div className="relative rounded-md shadow-sm">
                      <input
                        style={{ color: "black" }}
                        type="text"
                        name="launchWaitingPeriod"
                        id="launchWaitingPeriod"
                        value={launchWaitingPeriod}
                        onChange={(e) => setLaunchWaitingPeriod(e.target.value)}
                        className={`block w-full px-4 py-3 text-base rounded-lg border ${
                          errors.launchWaitingPeriod
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        } transition-colors duration-200`}
                        placeholder="0"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center">
                        <div className="flex items-center px-4 py-2 mr-1 bg-gray-100 rounded-md">
                          <span className="text-gray-600 text-sm font-medium">
                            Days
                          </span>
                        </div>
                      </div>
                    </div>
                    {errors.launchWaitingPeriod ? (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.launchWaitingPeriod}
                      </p>
                    ) : (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-500">
                          Number of days liquidity remains locked after the seed
                          liquidity is reached and after the LP is launched
                        </p>
                        <ul className="text-sm text-gray-500 list-disc list-inside pl-1 space-y-1">
                          <li>
                            Liquidity is locked for this period after seed
                            liquidity is raised
                          </li>
                          <li>
                            Investors can still deposit, but cannot withdraw
                            during this period
                          </li>
                          <li>
                            Once the LP is launched. the same lock period
                            applies again
                          </li>
                          <li>Duration must be between 1 and 30 days</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="minimumTokenShare"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Minimum Vault Share Requirement
                  </label>
                  <div className="mt-1 relative">
                    <div className="relative rounded-md shadow-sm">
                      {/* Must be positive integer */}
                      <input
                        style={{ color: "black" }}
                        type="text"
                        name="minimumTokenShare"
                        id="minimumTokenShare"
                        value={minimumTokenShare}
                        onChange={(e) => setMinimumTokenShare(e.target.value)}
                        className={`block w-full px-4 py-3 text-base rounded-lg border ${
                          errors.minimumTokenShare
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        } transition-colors duration-200`}
                        placeholder="0"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center">
                        <div className="flex items-center px-4 py-2 mr-1 bg-gray-100 rounded-md">
                          <span className="text-gray-600 text-sm font-medium">
                            Vault Shares
                          </span>
                        </div>
                      </div>
                    </div>
                    {errors.minimumTokenShare ? (
                      <p className="mt-2 text-sm text-red-600 mb-2">
                        {errors.minimumTokenShare}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500 mb-2">
                        Minimum number of vault shares required to deposit seed
                        liquidity (can be 0)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Initializing MSO...
                  </>
                ) : (
                  "Initialize MSO"
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        onConfirm={executeTransaction}
        title="Confirm Launch Initialization"
        details={[
          { label: "Vault Address", value: vaultAddress },
          { label: "Token Name", value: tokenName },
          { label: "Ticker", value: tokenSymbol },
          {
            label: "LP Seed Liquidity",
            value: `${softCap} ${
              selectedToken ? selectedToken.tokenSymbol : null
            }`,
          },
          {
            label: "Liquidity Lock Period",
            value: `${launchWaitingPeriod} ${
              Number(launchWaitingPeriod) === 1 ? "day" : "days"
            }`,
          },
          {
            label: "Minimum Vault Share Requirement",
            value: `${minimumTokenShare}`,
          },
          {
            label: "Liquidity Token",
            value: `${selectedToken ? selectedToken.tokenName : null}`,
          },
          ...(gasEstimate
            ? [
                {
                  label: "Estimated Gas Limit",
                  value: gasEstimate.gasLimit.toString(),
                },
                {
                  label: "Gas Price",
                  value: `${gasEstimate.gasPriceGwei} Gwei`,
                },
                {
                  label: "Estimated Cost",
                  value: `${gasEstimate.estimatedCost} ${gasEstimate.nativeCurrency}`,
                },
              ]
            : []),
        ]}
        simulationResult={simulationResult}
        gasEstimate={gasEstimate}
      />
    </>
  );
}
