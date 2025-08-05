import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Spinner } from "./Spinner";
import { getViemClient } from "@/utils/viemClient";
import { MSO_ABI } from "@/hooks/abi/MSO_ABI";
import { useWallet } from "@/context/WalletContext";
import { ethers } from "ethers";
import { useToast } from "@/context/ToastContext";

interface PostLaunchTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  depositAmount: string;
  syntheticTokenAmount: string;
  isApproval: boolean;
  balance: string;
  allowance: string;
  msoAddress: string;
  chainId: number;
  tokenSymbol: string;
  vaultTokenName: string;
  denominationAssetDecimals: number;
  token1Price: number | string;
  vaultTokenSymbol: string;
  lpTokenSymbol: string | null | undefined;
}

export function PostLaunchTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  depositAmount,
  syntheticTokenAmount,
  isApproval,
  balance,
  allowance,
  msoAddress,
  chainId,
  tokenSymbol,
  vaultTokenName,
  denominationAssetDecimals,
  token1Price,
  vaultTokenSymbol,
  lpTokenSymbol,
}: PostLaunchTransactionModalProps) {
  const { provider, account } = useWallet();
  const {
    addToast,
    removeToast,
    toasts,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    success: boolean;
    error?: string;
    depositAmountBigInt?: bigint;
    syntheticTokenAmountBigInt?: bigint;
  } | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const simulateDeposit = async () => {
    if (!account || isApproval || !depositAmount || !syntheticTokenAmount)
      return;

    setIsSimulating(true);
    setError("");

    try {
      const publicClient = getViemClient(chainId);

      // Prepare the transaction data
      const depositAmountBigInt = ethers.parseUnits(
        depositAmount,
        denominationAssetDecimals
      );
      const syntheticTokenAmountBigInt = ethers.parseUnits(
        syntheticTokenAmount,
        18
      ); // MSO decimals

      // Simulate the transaction
      const simulationResult = await publicClient.simulateContract({
        address: msoAddress as `0x${string}`,
        abi: MSO_ABI,
        functionName: "deposit",
        args: [depositAmountBigInt, syntheticTokenAmountBigInt],
        account: account as `0x${string}`,
      });

      console.log("Post-launch deposit simulation result:", simulationResult);
      setSimulationResult({
        success: true,
        depositAmountBigInt,
        syntheticTokenAmountBigInt,
      });
      return true;
    } catch (err: any) {
      console.error("Post-launch deposit simulation error:", err);

      // Extract and format error message
      let errorMessage = "Unknown error";

      if (err.shortMessage) {
        errorMessage = err.shortMessage;
      } else if (err.message) {
        // Clean up the error message
        errorMessage = err.message.replace(/^Error: /, "");
        const revertMatch = errorMessage.match(
          /reverted with reason string '(.+)'/
        );
        if (revertMatch) {
          errorMessage = revertMatch[1];
        }
      }

      setSimulationResult({
        success: false,
        error: `Transaction would fail: ${errorMessage}`,
      });
      return false;
    } finally {
      setIsSimulating(false);
    }
  };

  // Run simulation when modal opens for deposit
  useEffect(() => {
    if (isOpen && !isApproval) {
      simulateDeposit();
    }
  }, [isOpen, isApproval]);

  const executeDeposit = async () => {
    if (
      !provider ||
      !account ||
      !simulationResult?.success ||
      !simulationResult.depositAmountBigInt ||
      !simulationResult.syntheticTokenAmountBigInt
    ) {
      throw new Error("Cannot execute deposit: missing required data");
    }

    const signer = await provider.getSigner();
    const msoContract = new ethers.Contract(msoAddress, MSO_ABI, signer);

    // Execute the deposit transaction
    const tx = await msoContract.deposit(
      simulationResult.depositAmountBigInt,
      simulationResult.syntheticTokenAmountBigInt
    );

    // Return transaction hash
    setTxHash(tx.hash);
    return tx;
  };

  const handleConfirm = async () => {
    if (!isApproval) {
      // For deposits, check simulation result first
      if (!simulationResult?.success) {
        setError("Cannot proceed with failed simulation");
        return;
      }
    }

    setIsProcessing(true);
    setError("");
    try {
      if (isApproval) {
        // Let parent component handle approval
        await onSuccess?.();
      } else {
        // Handle deposit directly
        const tx = await executeDeposit();

        // Wait for transaction to be mined
        addToast("Transaction Submitted", "info");

        const receipt = await tx.wait();

        showSuccess(`Successfully deposited ${depositAmount} ${tokenSymbol}`);

        // Call success callback
        onSuccess?.();
      }

      onClose();
    } catch (err: any) {
      console.error("Transaction error:", err);
      const errorMessage = err.message || "Transaction failed";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={!isProcessing ? onClose : () => {}}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {isApproval
                    ? `Approve ${tokenSymbol}`
                    : "Post-Launch Deposit"}
                </Dialog.Title>

                {/* Transaction Details */}
                <div className="mt-4 space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Deposit Amount
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {Number(depositAmount).toLocaleString()} {tokenSymbol}
                      </span>
                    </div>

                    {!isApproval && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          Minted Synthetic Token
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {Number(syntheticTokenAmount).toLocaleString()}{" "}
                          {lpTokenSymbol}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {lpTokenSymbol} Price
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {Number(token1Price).toLocaleString()} {tokenSymbol}
                      </span>
                    </div>

                    {isApproval && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          Current Allowance
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {Number(allowance).toLocaleString()} {tokenSymbol}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Simulation Status */}
                  {!isApproval && (
                    <div className="mt-4">
                      {isSimulating ? (
                        <div className="flex items-center justify-center text-gray-600 p-3 bg-gray-50 rounded-lg">
                          <Spinner className="w-4 h-4 mr-2" />
                          <span>Simulating transaction...</span>
                        </div>
                      ) : (
                        simulationResult && (
                          <div
                            className={`p-3 rounded-lg ${
                              simulationResult.success
                                ? "bg-green-50"
                                : "bg-red-50"
                            }`}
                          >
                            <p
                              className={`text-sm ${
                                simulationResult.success
                                  ? "text-green-700"
                                  : "text-red-600"
                              }`}
                            >
                              {simulationResult.success
                                ? "Transaction simulation successful"
                                : simulationResult.error}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* Transaction Hash */}
                  {txHash && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700 font-medium mb-1">
                        Transaction Submitted
                      </p>
                      <div className="flex items-center">
                        <a
                          href={`https://${
                            chainId === 5 ? "goerli." : ""
                          }etherscan.io/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline truncate"
                        >
                          {txHash}
                        </a>
                        <button
                          onClick={() => navigator.clipboard.writeText(txHash)}
                          className="ml-2 p-1 text-blue-500 hover:text-blue-700"
                          title="Copy to clipboard"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="mt-6 space-y-2">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    onClick={handleConfirm}
                    disabled={
                      isProcessing ||
                      (!isApproval &&
                        (!simulationResult?.success || isSimulating))
                    }
                  >
                    {isProcessing ? (
                      <>
                        <Spinner className="w-4 h-4 mr-2" />
                        {isApproval ? "Approving..." : "Depositing..."}
                      </>
                    ) : (
                      <>
                        {isApproval ? (
                          <>
                            <svg
                              className="w-4 h-4 mr-2"
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
                            Approve {tokenSymbol}
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4 mr-2"
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
                            Confirm Deposit
                          </>
                        )}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="w-full inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    onClick={onClose}
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
