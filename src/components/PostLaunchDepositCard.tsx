import { useState, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import { ethers } from "ethers";
import { parseUnits, formatUnits } from "viem";
import { useVaultDeployments } from "@/hooks/useVaultDeployments";
import { useToast } from "@/context/ToastContext";
import {
  getClientForChain,
  getFundAddress,
  getRpcUrlForChain,
} from "@/hooks/useVaultPrice";
import { abiFund } from "@/hooks/useVaultPrice";
import { IUniswapV3Pool } from "../hooks/abi/IUniswapV3Pool";
import { MSO_ABI } from "../hooks/abi/MSO_ABI";
import { ERC20_ABI } from "../hooks/abi/ERC20_ABI";
import { erc20Abi } from "viem";
import { SUPPORTED_NETWORKS } from "@/components/Navbar";
import { PriceData } from "@/types/vault";
import { PostLaunchTransactionModal } from "./PostLaunchTransactionModal";
import { IVault } from "@/hooks/abi/IVault";

interface PostLaunchDepositCardProps {
  denominationAsset: string;
  denominationAssetDecimals: number;
  minimumTokenShare: string;
  vaultTokenName: string;
  msoAddress: string;
  poolAddress: string;
  vaultAddress: string;
  tokenAddressSymbol: string;
  vaultTokenSymbol: string;
  priceData: PriceData;
  vaultPrice: string | null | undefined;
  denominationAssetName: string | null | undefined;
  chainId: number | null | undefined;
}

export function PostLaunchDepositCard({
  denominationAsset,
  denominationAssetDecimals,
  minimumTokenShare,
  vaultTokenName,
  msoAddress,
  poolAddress,
  vaultAddress,
  vaultTokenSymbol,
  tokenAddressSymbol,
  priceData,
  vaultPrice,
  denominationAssetName,
  chainId,
}: PostLaunchDepositCardProps) {
  const [depositAmount, setDepositAmount] = useState("");
  const { depositAfterLaunch, isDepositingAfterLaunch } = useVaultDeployments(chainId as number);
  const { showError } = useToast();
  const { provider, account } = useWallet();
  const currentNetwork = chainId
    ? SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS]
    : null;
  const [balance, setBalance] = useState<string>("0");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [allowance, setAllowance] = useState<string>("0");
  const [isApproving, setIsApproving] = useState(false);
  const [isCheckingAllowance, setIsCheckingAllowance] = useState(false);
  const [calculatedSyntheticAmount, setCalculatedSyntheticAmount] = useState<
    string | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApprovalModal, setIsApprovalModal] = useState(false);
  const [enzymeTokenBalance, setEnzymeTokenBalance] = useState<string>("0");
  const [isLoadingEnzymeBalance, setIsLoadingEnzymeBalance] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const checkAllowance = async () => {
    if (!account || !provider || !chainId) return;

    setIsCheckingAllowance(true);
    try {
      const tokenContract = new ethers.Contract(
        denominationAsset,
        ERC20_ABI,
        provider
      );
      const currentAllowance = await tokenContract.allowance(
        account,
        msoAddress
      );
      setAllowance(formatUnits(currentAllowance, denominationAssetDecimals));
    } catch (error) {
      console.error("Error checking allowance:", error);
      setAllowance("0");
    } finally {
      setIsCheckingAllowance(false);
    }
  };

  const handleApprove = async () => {
    if (!account || !provider) return;

    setIsApproving(true);
    try {
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(
        denominationAsset,
        ERC20_ABI,
        signer
      );
      const tx = await tokenContract.approve(msoAddress, ethers.MaxUint256);
      await tx.wait();
      await checkAllowance(); // Update allowance after approval
    } catch (error: any) {
      showError(error.message || "Failed to approve token");
    } finally {
      setIsApproving(false);
    }
  };

  const calculateSyntheticTokenAmount = async (depositAmount: string) => {
    if (!provider || !priceData) return null;

    try {
      const msoContract = new ethers.Contract(msoAddress, MSO_ABI, provider);

      const token1Price =
        denominationAsset === priceData.token1
          ? priceData.token1Price
          : priceData.token0Price;

      let syntheticTokenAmountt = Number(depositAmount) * Number(token1Price);
      let syntheticTokenAmount = parseUnits(
        syntheticTokenAmountt.toString(),
        18
      );

      return syntheticTokenAmount;
    } catch (error) {
      console.error("Error calculating synthetic token amount:", error);
      return null;
    }
  };

  const handleConfirmDeposit = async () => {
    if (!depositAmount || !priceData) return;

    try {
      // Calculate synthetic token amount
      const syntheticTokenAmount = await calculateSyntheticTokenAmount(
        depositAmount
      );
      if (!syntheticTokenAmount) {
        throw new Error("Failed to calculate synthetic token amount");
      }

      await depositAfterLaunch({
        msoAddress,
        amount: parseUnits(depositAmount, denominationAssetDecimals),
        syntheticTokenAmount,
      });

      // Reset form and update balances
      setDepositAmount("");
      updateBalance();
      checkAllowance();

      // Close modal
      setIsModalOpen(false);
    } catch (error: any) {
      showError(error.message || "Failed to deposit");
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || !priceData) return;

    // Check if user has enough enzyme tokens
    if (Number(minimumTokenShare) > Number(enzymeTokenBalance)) {
      showError("You need to have Enzyme Vault tokens to deposit");
      return;
    }

    // Check if we need approval first
    if (Number(allowance) < Number(depositAmount)) {
      setIsApprovalModal(true);
      setIsModalOpen(true);
      return;
    }

    // Open deposit modal
    setIsApprovalModal(false);
    setIsModalOpen(true);
  };

  const updateBalance = async () => {
    if (!account || !provider || !chainId) return;

    setIsLoadingBalance(true);
    try {
      const tokenContract = new ethers.Contract(
        denominationAsset,
        ERC20_ABI,
        provider
      );
      const balance = await tokenContract.balanceOf(account);
      setBalance(formatUnits(balance, denominationAssetDecimals));
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance("0");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const updateEnzymeBalance = async () => {
    if (!account || !provider || !vaultAddress) return;

    setIsLoadingEnzymeBalance(true);
    try {
      const vaultContract = new ethers.Contract(vaultAddress, IVault, provider);
      const balance = await vaultContract.balanceOf(account);
      setEnzymeTokenBalance(formatUnits(balance, 18)); // Enzyme tokens have 18 decimals
    } catch (error) {
      console.error("Error fetching enzyme balance:", error);
      setEnzymeTokenBalance("0");
    } finally {
      setIsLoadingEnzymeBalance(false);
    }
  };

  useEffect(() => {
    updateBalance();
    checkAllowance();
    updateEnzymeBalance();

    if (provider && account && denominationAsset) {
      const tokenContract = new ethers.Contract(
        denominationAsset,
        ERC20_ABI,
        provider
      );
      const filterFrom = tokenContract.filters.Transfer(account, null);
      const filterTo = tokenContract.filters.Transfer(null, account);
      const filterApproval = tokenContract.filters.Approval(
        account,
        msoAddress
      );

      const handleTransfer = () => {
        updateBalance();
      };

      const handleApproval = () => {
        checkAllowance();
      };

      tokenContract.on(filterFrom, handleTransfer);
      tokenContract.on(filterTo, handleTransfer);
      tokenContract.on(filterApproval, handleApproval);

      // Add enzyme vault token transfer listener
      const vaultContract = new ethers.Contract(vaultAddress, IVault, provider);
      const filterVaultFrom = vaultContract.filters.Transfer(account, null);
      const filterVaultTo = vaultContract.filters.Transfer(null, account);

      const handleVaultTransfer = () => {
        updateEnzymeBalance();
      };

      vaultContract.on(filterVaultFrom, handleVaultTransfer);
      vaultContract.on(filterVaultTo, handleVaultTransfer);

      return () => {
        tokenContract.off(filterFrom, handleTransfer);
        tokenContract.off(filterTo, handleTransfer);
        tokenContract.off(filterApproval, handleApproval);
        vaultContract.off(filterVaultFrom, handleVaultTransfer);
        vaultContract.off(filterVaultTo, handleVaultTransfer);
      };
    }
  }, [account, provider, denominationAsset, chainId, msoAddress, vaultAddress]);

  useEffect(() => {
    const updateCalculation = async () => {
      if (depositAmount && priceData) {
        const syntheticAmount = await calculateSyntheticTokenAmount(
          depositAmount
        );
        if (syntheticAmount) {
          setCalculatedSyntheticAmount(ethers.formatUnits(syntheticAmount, 18));
        }
      } else {
        setCalculatedSyntheticAmount(null);
      }
    };

    updateCalculation();
  }, [depositAmount, priceData]);

  const handleMaxClick = () => {
    setDepositAmount(balance);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header Section - Now Clickable */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-500 bg-opacity-10 rounded-full flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                {priceData && (
                  <h2 className="text-lg font-semibold text-gray-900">
                    {priceData.token0 == denominationAsset
                      ? denominationAssetName
                      : priceData.token0Symbol}{" "}
                    /{" "}
                    {priceData.token0 == denominationAsset
                      ? priceData.token1Symbol
                      : denominationAssetName}
                  </h2>
                )}
                <p className="text-sm text-gray-500">Liquidity Pool</p>
              </div>
            </div>

            {/* Add Expand/Collapse Icon */}
            <div className="flex items-center">
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                  isExpanded ? "transform rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Main Content - Now Collapsible */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-6 space-y-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div>
                <div className="rounded-xl border border-gray-200 p-4 mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-semibold">
                      Your Balance:
                    </span>
                    <span className="font-medium text-gray-900 font-semibold">
                      {isLoadingBalance ? (
                        <span className="inline-flex items-center">
                          <svg
                            className="animate-spin h-4 w-4 mr-1"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Loading...
                        </span>
                      ) : (
                        `${Number(balance).toLocaleString(undefined, {
                          maximumFractionDigits: 6,
                        })} ${denominationAssetName}`
                      )}
                    </span>
                  </div>
                </div>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <input
                    style={{
                      color: "black",
                    }}
                    type="number"
                    value={depositAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Don't allow depositing more than balance
                      if (Number(value) > Number(balance)) {
                        setDepositAmount(balance);
                      } else {
                        setDepositAmount(value);
                      }
                    }}
                    className="block w-full pl-4 pr-20 py-3 text-lg border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    disabled={isDepositingAfterLaunch}
                    max={balance}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <button
                      type="button"
                      onClick={handleMaxClick}
                      disabled={
                        isDepositingAfterLaunch || Number(balance) === 0
                      }
                      className="inline-flex items-center px-3 py-1 mr-3 border border-gray-200 text-sm rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      MAX
                    </button>
                  </div>
                </div>
              </div>

              {/* Price Information */}
              {depositAmount && calculatedSyntheticAmount && (
                <div className="rounded-xl border border-indigo-300 bg-gradient-to-r from-indigo-50 to-blue-50 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-indigo-700">
                      Creating Position
                    </span>
                  </div>

                  <div className="pt-4 ">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-indigo-600 font-semibold">
                        Input Amount
                      </span>
                      <span className="font-medium font-semibold text-lg  text-indigo-700">
                        {Number(depositAmount).toLocaleString()}{" "}
                        {denominationAssetName}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 pb-4 border-b border-indigo-300">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-indigo-600 font-semibold">
                        Match Token
                      </span>
                      <span className="font-medium font-semibold text-lg text-indigo-700">
                        {Number(calculatedSyntheticAmount).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 6,
                          }
                        )}{" "}
                        {priceData.token0 == denominationAsset
                          ? priceData.token1Symbol
                          : denominationAssetName}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-indigo-600 font-semibold text-lg">
                    <div className="flex items-center space-x-1">
                      <svg
                        className="h-6 w-6 text-indigo-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {"  "}
                      <span className="ml-2"> Creating Position</span>
                    </div>
                  </h3>

                  <div className="text-xs text-gray-500 flex items-center space-x-1 mt-4">
                    <span>
                      Depositing {denominationAssetName} triggers the minting of{" "}
                      {priceData.token0 == denominationAsset
                        ? priceData.token1Symbol
                        : denominationAssetName}{" "}
                      by the system to match your contribution for liquidity
                      provision at the current market price
                    </span>
                  </div>

                  <h3 className="text-indigo-600 font-semibold text-lg">
                    <div className="flex items-center space-x-1">
                      <svg
                        className="h-6 w-6 text-indigo-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {"  "}
                      <span className="ml-2">LP Token</span>
                    </div>
                  </h3>

                  <div className="text-xs text-gray-500 flex items-center space-x-1">
                    <span>
                      LP tokens are securely held by the system for security
                      purposes. Liquidity can be withdrawn through the original
                      wallet, subject to the pool’s withdrawal restrictions
                    </span>
                  </div>
                </div>
              )}

              {/* Enzyme Price Info if available */}
              {vaultPrice && (
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-semibold">
                      {priceData.token0 == denominationAsset
                        ? priceData.token1Symbol
                        : priceData.token0Symbol}{" "}
                      Price:
                    </span>
                    <span className="font-medium text-gray-900 font-semibold">
                      {Number(
                        denominationAsset === priceData.token1
                          ? priceData.token0Price
                          : priceData.token1Price
                      ).toFixed(6)}{" "}
                      {denominationAssetName}
                    </span>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-700">
                <span className="font-semibold">
                  <span className="text-gray-700">
                    Minimum Vault Share Required:{" "}
                    {Number(minimumTokenShare).toLocaleString()}{" "}
                    {vaultTokenSymbol}
                  </span>
                </span>
              </p>

              {/* Add Enzyme Balance Display */}
              <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-blue-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-indigo-600">
                    Vault Share Holdings
                  </span>
                  <span className="text-sm text-indigo-700">
                    {isLoadingEnzymeBalance ? (
                      <span className="inline-flex items-center">
                        <svg
                          className="animate-spin h-4 w-4 mr-1"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Loading...
                      </span>
                    ) : (
                      `${Number(enzymeTokenBalance).toLocaleString(undefined, {
                        maximumFractionDigits: 6,
                      })} ${vaultTokenSymbol}`
                    )}{" "}
                  </span>
                </div>

                {Number(minimumTokenShare) > Number(enzymeTokenBalance) && (
                  <div className="mt-3 flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span className="text-sm">
                      You need to have Enzyme Vault tokens to deposit. Please
                      acquire some tokens first.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="text-xs text-gray-500 space-y-1">
              <p className="flex items-center space-x-1">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  You must hold the required vault shares to add liquidity
                </span>
              </p>

              <p className="flex items-center space-x-1">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Transaction may take a few minutes to process</span>
              </p>
            </div>

            {/* Approval Section */}
            {depositAmount && Number(depositAmount) > Number(allowance) && (
              <div className="space-y-3">
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-700">
                      Current Approval Limit:
                    </span>
                    <span className="font-medium text-yellow-800">
                      {isCheckingAllowance ? (
                        <span className="inline-flex items-center">
                          <svg
                            className="animate-spin h-4 w-4 mr-1"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Checking...
                        </span>
                      ) : (
                        `${Number(allowance).toLocaleString(undefined, {
                          maximumFractionDigits: 6,
                        })} ${tokenAddressSymbol}`
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-base font-medium text-white bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                >
                  {isApproving ? (
                    <span className="flex items-center space-x-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
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
                      <span>Approving...</span>
                    </span>
                  ) : (
                    "Approve Token Spending"
                  )}
                </button>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleDeposit}
              disabled={
                !account ||
                !depositAmount ||
                isDepositingAfterLaunch ||
                Number(depositAmount) > Number(balance) ||
                Number(depositAmount) > Number(allowance) ||
                Number(depositAmount) <= 0 ||
                Number(minimumTokenShare) > Number(enzymeTokenBalance)
              }
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              {isDepositingAfterLaunch ? (
                <span className="flex items-center space-x-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                  <span>Processing Deposit...</span>
                </span>
              ) : Number(minimumTokenShare) > Number(enzymeTokenBalance) ? (
                "Enzyme Vault Tokens Required"
              ) : Number(depositAmount) > Number(balance) ? (
                "Insufficient Balance"
              ) : Number(depositAmount) > Number(allowance) ? (
                "Approval Required"
              ) : (
                "+ Add Liquidity"
              )}
            </button>
          </div>
        </div>

        {/* Quick Summary - Shown when collapsed */}
        <div
          className={`px-6 py-4 border-t border-gray-200 transition-all duration-300 ${
            isExpanded ? "hidden" : "block"
          }`}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="text-sm">
              <span className="text-gray-500">Your Balance:</span>
              <span className="ml-2 font-medium text-gray-900">
                {isLoadingBalance ? (
                  <span className="inline-flex items-center">
                    <svg
                      className="animate-spin h-4 w-4 mr-1"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Loading...
                  </span>
                ) : (
                  `${Number(balance).toLocaleString(undefined, {
                    maximumFractionDigits: 6,
                  })} ${tokenAddressSymbol}`
                )}
              </span>
            </div>
            <div className="text-sm text-right">
              <span className="text-gray-500">Enzyme Balance:</span>
              <span className="ml-2 font-medium text-gray-900">
                {isLoadingEnzymeBalance ? (
                  <span className="inline-flex items-center">
                    <svg
                      className="animate-spin h-4 w-4 mr-1"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Loading...
                  </span>
                ) : (
                  `${Number(enzymeTokenBalance).toLocaleString(undefined, {
                    maximumFractionDigits: 6,
                  })} ${vaultTokenName}`
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <PostLaunchTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={
          isApprovalModal
            ? checkAllowance
            : () => {
                setDepositAmount("");
                updateBalance();
              }
        }
        depositAmount={depositAmount}
        syntheticTokenAmount={calculatedSyntheticAmount || "0"}
        isApproval={isApprovalModal}
        balance={balance}
        allowance={allowance}
        msoAddress={msoAddress}
        chainId={chainId as number}
        tokenSymbol={tokenAddressSymbol}
        vaultTokenName={vaultTokenName}
        denominationAssetDecimals={denominationAssetDecimals}
        token1Price={
          denominationAsset === priceData.token1
            ? priceData.token0Price
            : priceData.token1Price
        }
        vaultTokenSymbol={vaultTokenSymbol}
        lpTokenSymbol={
          priceData.token0 == denominationAsset
            ? priceData.token1Symbol
            : denominationAssetName
        }
      />
    </>
  );
}
