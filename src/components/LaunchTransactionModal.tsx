import { Dialog } from "@headlessui/react";
import { Spinner } from "./Spinner";
import { useState } from "react";
import { useLaunchMSO } from "@/hooks/useLaunchMSO";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
interface LaunchTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  computedValues: {
    syntheticTokenAmount: bigint;
    investmentTokenAmount: bigint;
    sqrtPriceX96: bigint;
    poolFee: string;
    tickerUpperValue: number;
    tickerLowerValue: number;
    priceRatio: string;
  };
  msoAddress: string;
  denominationAsset: string;
  denominationAssetDecimals: number;
  msoSymbol: string;
  denominationAssetSymbol: string;
}

export function LaunchTransactionModal({
  isOpen,
  onClose,
  computedValues,
  msoAddress,
  denominationAsset,
  denominationAssetDecimals,
  msoSymbol,
  denominationAssetSymbol,
}: LaunchTransactionModalProps) {
  const [step, setStep] = useState<
    "confirm" | "signing" | "simulating" | "launching"
  >("confirm");
  const [error, setError] = useState<string | null>(null);
  const { getSignedMessage, simulateLaunch, executeLaunch } =
    useLaunchMSO(msoAddress);

  const { chain } = useAccount();

  const handleConfirm = async () => {
    try {
      if (Number(computedValues.poolFee) === 0.01) {
        computedValues.poolFee = "100";
      } else if (Number(computedValues.poolFee) === 0.05) {
        computedValues.poolFee = "500";
      }

      setError(null);

      // Get signed message
      setStep("signing");
      const signature = await getSignedMessage(computedValues);

      // Simulate transaction
      setStep("simulating");
      await simulateLaunch(computedValues, signature);

      // Execute transaction
      setStep("launching");
      await executeLaunch(computedValues, signature);

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setStep("confirm");
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-xl">
          <Dialog.Title className="text-xl font-semibold text-gray-900 mb-4">
            Launch Liquidity Pool
          </Dialog.Title>

          {error && (
            <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {step === "confirm" && (
              <>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-medium text-gray-900">
                    Confirm Parameters
                  </h3>
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <span className="text-gray-500">
                        Synthetic Token to Be Minted:
                      </span>
                      <div className="font-mono text-black">
                        {Number(
                          formatUnits(
                            computedValues.syntheticTokenAmount as bigint,
                            18
                          )
                        ).toFixed(2)}{" "}
                        {msoSymbol}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">
                        Available Liquidity:
                      </span>
                      <div className="font-mono text-black">
                        <span>
                          {Number(
                            formatUnits(
                              computedValues.investmentTokenAmount as bigint,
                              denominationAssetDecimals
                            )
                          ).toFixed(2)}{" "}
                          {denominationAssetSymbol}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Pool Fee:</span>
                      <div className="font-mono text-black">
                        {computedValues.poolFee === "100" ? "0.01%" : "0.05%"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Price Ratio:</span>
                      <div className="font-mono text-black flex items-center gap-2">
                        {computedValues.priceRatio}x
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleConfirm}
                  className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 
                    transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  Confirm Launch
                </button>
              </>
            )}

            {step === "signing" && (
              <div className="text-center py-4">
                <Spinner className="h-8 w-8 mx-auto mb-4" />
                <p className="text-gray-600">Getting signature...</p>
              </div>
            )}

            {step === "simulating" && (
              <div className="text-center py-4">
                <Spinner className="h-8 w-8 mx-auto mb-4" />
                <p className="text-gray-600">Simulating transaction...</p>
              </div>
            )}

            {step === "launching" && (
              <div className="text-center py-4">
                <Spinner className="h-8 w-8 mx-auto mb-4" />
                <p className="text-gray-600">Launching pool...</p>
                <p className="text-sm text-gray-500 mt-2">
                  Please confirm the transaction in your wallet
                </p>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
