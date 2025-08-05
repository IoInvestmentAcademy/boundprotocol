import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Spinner } from "./Spinner";
import { parseAbi, encodeFunctionData, formatUnits } from "viem";
import { getViemClient } from "@/utils/viemClient";
import { MSO_ABI } from "@/hooks/abi/MSO_ABI";
import { useWallet } from "@/context/WalletContext";
import { ethers } from "ethers";

interface TransactionModalDepositProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  amount: string;
  isApproval: boolean;
  balance: string;
  allowance: string;
  msoAddress: string;
  chainId: number;
  denominationAssetName: string | null;
}

const decodeError = (error: any) => {
  if (!error) return "Unknown error";

  // Get the error data
  const errorData = error.data || error.error?.data;

  if (typeof errorData === "string" && errorData.startsWith("0x")) {
    try {
      // Remove the "0x" prefix and the function selector (first 8 characters after "0x")
      const hexString = errorData.slice(10);

      // Convert hex to string
      const decodedString = ethers.toUtf8String(
        "0x" + hexString.replace(/0+$/, "")
      );

      return decodedString;
    } catch (decodeError) {
      console.error("Error decoding:", decodeError);
    }
  }

  // If we can't decode the error, try to get the message
  if (error.message) {
    // Look for specific patterns in the error message
    const revertStringMatch = error.message.match(
      /reverted with reason string '(.+)'/
    );
    if (revertStringMatch) {
      return revertStringMatch[1];
    }

    // Look for custom error signatures
    const customErrorMatch = error.message.match(
      /reverted with custom error '(.+)'/
    );
    if (customErrorMatch) {
      return customErrorMatch[1];
    }
  }

  return error.message || "Transaction would fail";
};

export function TransactionModalDeposit({
  isOpen,
  onClose,
  onConfirm,
  amount,
  isApproval,
  balance,
  allowance,
  msoAddress,
  chainId,
  denominationAssetName,
}: TransactionModalDepositProps) {
  const { provider, account } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    success: boolean;
    error?: string;
  } | null>(null);

  const simulateDeposit = async () => {
    if (!account || isApproval || !amount) return;

    setIsSimulating(true);
    setError("");

    try {
      const publicClient = getViemClient(chainId);

      // Prepare the transaction data
      const depositAmount = ethers.parseUnits(amount, 6); // Assuming USDC decimals

      // Simulate the transaction
      const simulationResult = await publicClient.simulateContract({
        address: msoAddress as `0x${string}`,
        abi: MSO_ABI,
        functionName: "deposit",
        args: [depositAmount, BigInt(0)], // syntheticTokenAmount is 0
        account: account as `0x${string}`,
      });

      console.log("Simulation result:", simulationResult);
      setSimulationResult({ success: true });
      return true;
    } catch (err: any) {
      console.error("Simulation error:", err);

      // Extract error message from viem error
      let errorMessage = "Unknown error";

      if (err.shortMessage) {
        errorMessage = err.shortMessage;
      } else if (err.message) {
        // Try to clean up the error message
        errorMessage = err.message.replace(/^Error: /, "");
        // If it's a revert error, try to extract the reason
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
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err.message || "Transaction failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                    ? `Approve ${denominationAssetName?.toLocaleUpperCase()}`
                    : `Deposit ${denominationAssetName?.toLocaleUpperCase()}`}
                </Dialog.Title>

                {/* Transaction Details */}
                <div className="mt-4 space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Amount</span>
                      <span className="text-sm font-medium text-gray-900">
                        {Number(amount).toLocaleString()}{" "}
                        {denominationAssetName?.toLocaleUpperCase()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Balance</span>
                      <span className="text-sm font-medium text-gray-900">
                        {Number(balance).toLocaleString()}{" "}
                        {denominationAssetName?.toLocaleUpperCase()}
                      </span>
                    </div>

                    {isApproval && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          Current Allowance
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {Number(allowance).toLocaleString()}{" "}
                          {denominationAssetName?.toLocaleUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Gas Estimation Note */}
                  <p className="text-sm text-gray-500">
                    {isApproval
                      ? `Approving will allow the vault to use your ${denominationAssetName?.toLocaleUpperCase()}`
                      : `Depositing ${denominationAssetName?.toLocaleUpperCase()} will mint vault shares`}
                  </p>

                  {/* Simulation Status */}
                  {!isApproval && (
                    <div className="mt-4">
                      {isSimulating ? (
                        <div className="flex items-center text-gray-600">
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
                            Approve {denominationAssetName?.toLocaleUpperCase()}
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
                            Deposit {denominationAssetName?.toLocaleUpperCase()}
                          </>
                        )}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="w-full inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
