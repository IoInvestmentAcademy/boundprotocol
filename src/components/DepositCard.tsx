import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/context/WalletContext";
import { ERC20_ABI } from "@/hooks/abi/ERC20_ABI";
import { IVault } from "@/hooks/abi/IVault";
import { TransactionModal } from "./TransactionModal";
import { Spinner } from "./Spinner";
import { TransactionModalDeposit } from "./TransactionModalDeposit";
import { parseAbi, formatUnits, parseUnits, encodeFunctionData } from "viem";
import { getViemClient } from "@/utils/viemClient";
import { MSO_ABI } from "@/hooks/abi/MSO_ABI";

interface DepositCardProps {
  msoAddress: string;
  denominationAsset: string;
  denominationAssetDecimals: number;
  minimumTokenShare: string;
  vaultTokenName: string;
  denominationAssetName: string | null;
  vaultAddress: string;
}

export function DepositCard({
  msoAddress,
  denominationAsset,
  denominationAssetDecimals,
  minimumTokenShare,
  vaultTokenName,
  denominationAssetName,
  vaultAddress,
}: DepositCardProps) {
  const { provider, account, chainId } = useWallet();
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState("0");
  const [allowance, setAllowance] = useState("0");
  const [isLoading, setIsLoading] = useState(true);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState<"approve" | "deposit">(
    "deposit"
  );
  const [isLoadingEnzymeBalance, setIsLoadingEnzymeBalance] = useState(true);
  const [enzymeTokenBalance, setEnzymeTokenBalance] = useState("0");
  const [vaultTokenSymbol, setVaultTokenSymbol] = useState("");

  const updateEnzymeBalance = async () => {
    if (!account || !provider || !vaultAddress) return;

    setIsLoadingEnzymeBalance(true);
    try {
      const vaultContract = new ethers.Contract(vaultAddress, IVault, provider);
      const balance = await vaultContract.balanceOf(account);
      const vaultTokenSymbol = await vaultContract.symbol();
      setEnzymeTokenBalance(formatUnits(balance, 18)); // Enzyme tokens have 18 decimals
      setVaultTokenSymbol(vaultTokenSymbol);
    } catch (error) {
      console.error("Error fetching enzyme balance:", error);
      setEnzymeTokenBalance("0");
    } finally {
      setIsLoadingEnzymeBalance(false);
    }
  };

  const [error, setError] = useState("");

  // Watch for allowance changes
  useEffect(() => {
    if (!account || !denominationAsset || !msoAddress || !chainId) return;
    updateEnzymeBalance();

    try {
      const publicClient = getViemClient(chainId);

      // Initial allowance check for mso
      const checkAllowance = async () => {
        try {
          const allowanceData = await publicClient.readContract({
            address: denominationAsset as `0x${string}`,
            abi: parseAbi(ERC20_ABI),
            functionName: "allowance",
            args: [account as `0x${string}`, msoAddress as `0x${string}`],
          });

          setAllowance(formatUnits(allowanceData, denominationAssetDecimals));
        } catch (error) {
          console.error("Error checking allowance:", error);
        }
      };

      // Watch for Approval events
      const unwatch = publicClient.watchContractEvent({
        address: denominationAsset as `0x${string}`,
        abi: parseAbi(ERC20_ABI),
        eventName: "Approval",
        args: {
          owner: account as `0x${string}`,
          spender: msoAddress as `0x${string}`,
        },
        onLogs: (logs) => {
          console.log("Approval event:", logs);
          checkAllowance();
        },
      });

      // Initial check
      checkAllowance();

      // Cleanup
      return () => {
        unwatch();
      };
    } catch (error) {
      console.error("Error setting up viem client:", error);
      setError("Unsupported network. Please use Ethereum or Polygon.");
    }
  }, [
    account,
    denominationAsset,
    msoAddress,
    chainId,
    denominationAssetDecimals,
  ]);

  // Load balance
  useEffect(() => {
    const loadBalance = async () => {
      if (!provider || !account || !denominationAsset) return;

      try {
        const tokenContract = new ethers.Contract(
          denominationAsset,
          ERC20_ABI,
          provider
        );
        const balanceWei = await tokenContract.balanceOf(account);
        setBalance(ethers.formatUnits(balanceWei, denominationAssetDecimals));
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading balance:", error);
        setError("Failed to load balance");
        setIsLoading(false);
      }
    };

    loadBalance();
  }, [provider, account, denominationAsset, denominationAssetDecimals]);

  const handleApprove = async (): Promise<void> => {
    if (!provider || !account) return;

    try {
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(
        denominationAsset,
        ERC20_ABI,
        signer
      );
      const amountWei = ethers.parseUnits(amount, denominationAssetDecimals);

      const tx = await tokenContract.approve(msoAddress, amountWei);
      await tx.wait();

      // Update allowance
      const newAllowance = await tokenContract.allowance(account, msoAddress);
      setAllowance(ethers.formatUnits(newAllowance, denominationAssetDecimals));
    } catch (error: any) {
      console.error("Approval error:", error);
      throw new Error(error.message);
    }
  };

  const handleDeposit = async (): Promise<void> => {
    if (!provider || !account || !chainId) return;

    try {
      const publicClient = getViemClient(chainId);
      const depositAmount = parseUnits(amount, denominationAssetDecimals);

      // Get the signer's nonce and gas estimate
      const [nonce, gasLimit] = await Promise.all([
        publicClient.getTransactionCount({ address: account as `0x${string}` }),
        publicClient.estimateContractGas({
          address: msoAddress as `0x${string}`,
          abi: MSO_ABI,
          functionName: "deposit",
          args: [depositAmount, BigInt(0)],
          account: account as `0x${string}`,
        }),
      ]);

      // Encode the function data
      const data = encodeFunctionData({
        abi: MSO_ABI,
        functionName: "deposit",
        args: [depositAmount, BigInt(0)],
      });

      // Prepare and send the transaction
      const signer = await provider.getSigner();
      const transaction = await signer.sendTransaction({
        to: msoAddress,
        data,
        nonce,
        gasLimit,
      });

      // Wait for transaction
      await transaction.wait();

      // Reset form
      setAmount("");

      // Refresh balance using viem with properly formatted ABI
      const newBalance = await publicClient.readContract({
        address: denominationAsset as `0x${string}`,
        abi: [
          {
            name: "balanceOf",
            type: "function",
            stateMutability: "view",
            inputs: [{ name: "account", type: "address" }],
            outputs: [{ name: "balance", type: "uint256" }],
          },
        ],
        functionName: "balanceOf",
        args: [account as `0x${string}`],
      });

      setBalance(formatUnits(newBalance, denominationAssetDecimals));
    } catch (error: any) {
      console.error("Deposit error:", error);
      throw new Error(error.message || "Failed to deposit");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!amount || isNaN(Number(amount))) {
      setError("Please enter a valid amount");
      return;
    }

    const amountNum = Number(amount);
    if (amountNum <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    if (amountNum > Number(balance)) {
      setError("Insufficient balance");
      return;
    }

    // Validate minimum amount
    if (Number(amount) < Number(minimumTokenShare)) {
      setError(
        `Minimum deposit amount is ${Number(
          minimumTokenShare
        ).toLocaleString()} ${vaultTokenName}`
      );
      return;
    }

    // Check if approval is needed
    if (Number(amount) > Number(allowance)) {
      setTransactionType("approve");
    } else {
      setTransactionType("deposit");
    }

    setShowTransactionModal(true);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Deposit {denominationAssetName?.toLocaleUpperCase()}
      </h3>

      <div className="mb-6 space-y-3">
        <div className="flex justify-between text-sm bg-gray-50 p-3 rounded-lg">
          <span className="text-gray-500">Your Balance:</span>
          <div className="flex items-center space-x-2">
            <span className="text-gray-900 font-medium">
              {Number(balance).toLocaleString()}
            </span>
            <span className="text-gray-500">{denominationAssetName}</span>
          </div>
        </div>
        <div className="flex justify-between text-sm bg-gray-50 p-3 rounded-lg">
          <span className="text-gray-500">Allowance:</span>
          <div className="flex items-center space-x-2">
            <span className="text-gray-900 font-medium">
              {Number(allowance).toLocaleString()}
            </span>
            <span className="text-gray-500">{denominationAssetName}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Amount to Deposit
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <input
              type="text"
              name="amount"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              className={`
                block w-full rounded-lg pr-12 
                border-2 border-gray-300 
                focus:ring-2 focus:ring-offset-2
                focus:outline-none focus:ring-blue-500 focus:border-blue-500
                py-3 px-4 text-lg
                transition-all duration-200
                ${amount ? "bg-blue-50 border-blue-200" : "bg-gray-50"}
                placeholder-gray-400
                text-black
              `}
              placeholder="0.00"
              aria-describedby="amount-currency"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <span className="text-gray-500 sm:text-sm" id="amount-currency">
                {denominationAssetName}
              </span>
            </div>
          </div>

          {/* Balance and Max button */}
          <div className="mt-2 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Balance: {Number(balance).toLocaleString()}{" "}
              {denominationAssetName?.toLocaleUpperCase()}
            </div>
            <button
              type="button"
              onClick={() => setAmount(balance)}
              className="text-sm text-blue-600 font-medium hover:text-blue-700 
                transition-colors duration-200 px-2 py-1 rounded
                hover:bg-blue-50"
            >
              MAX
            </button>
          </div>

          {/* Input Highlight Info */}
          {amount && (
            <div className="mt-2 flex items-center space-x-2">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-blue-600">
                You will deposit {Number(amount).toLocaleString()}{" "}
                {denominationAssetName?.toLocaleUpperCase()}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-2 flex items-center space-x-2">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <h3 className="text-sm font-medium text-gray-700 mb-2 mt-4">
            Minimum Vault Share Required:{" "}
            {Number(minimumTokenShare).toLocaleString()} {vaultTokenSymbol}
          </h3>

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
          <div className="mt-2 flex items-center space-x-2">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm text-blue-600">
              You must hold the required vault shares to add liquidity
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="submit"
            className="w-full flex justify-center items-center px-4 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!amount || isNaN(Number(amount)) || Number(amount) <= 0}
          >
            {Number(amount) > Number(allowance) ? (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Approve & Deposit
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Liquidity
              </>
            )}
          </button>

          <p className="text-xs text-center text-gray-500">
            {Number(amount) > Number(allowance)
              ? `You'll need to approve ${denominationAssetName?.toLocaleUpperCase()} spending before depositing`
              : `Provide ${denominationAssetName?.toLocaleUpperCase()} to seed the liquidity pool`}
          </p>
        </div>
      </form>

      {showTransactionModal && (
        <TransactionModalDeposit
          msoAddress={msoAddress}
          isOpen={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
          onConfirm={
            transactionType === "approve" ? handleApprove : handleDeposit
          }
          amount={amount}
          isApproval={transactionType === "approve"}
          balance={balance}
          allowance={allowance}
          chainId={chainId as number}
          denominationAssetName={denominationAssetName}
        />
      )}
    </div>
  );
}
