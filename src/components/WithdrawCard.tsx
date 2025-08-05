import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/context/WalletContext";
import { MSO_ABI } from "@/hooks/abi/MSO_ABI";
import { Spinner } from "@/components/Spinner";
import { useQueryClient } from "@tanstack/react-query";
import { getViemClient } from "@/utils/viemClient";
import { formatDistanceToNow } from "date-fns";
import { useContractRead } from "wagmi";

interface WithdrawCardProps {
  msoAddress: string;
  tokenAddressSymbol?: string | null | undefined;
}

export const WithdrawCard = ({
  msoAddress,
  tokenAddressSymbol,
}: WithdrawCardProps) => {
  const { provider, account, chainId } = useWallet();
  const [withdrawPercentage, setWithdrawPercentage] = useState<number>(100);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);
  const queryClient = useQueryClient();
  const [launchExpiresAt, setLaunchExpiresAt] = useState<number>(0);

  const getLaunchExpiresAt = async () => {
    const publicClient = getViemClient(chainId as number);
    const block = await publicClient.readContract({
      address: msoAddress as `0x${string}`,
      abi: MSO_ABI,
      functionName: "withdrawAfterLaunchAt",
    });
    setLaunchExpiresAt(Number(block));
    return block;
  };

  useEffect(() => {
    getLaunchExpiresAt();
  }, [msoAddress, chainId]);

  // Update current timestamp periodically
  useEffect(() => {
    const publicClient = getViemClient(chainId as number);
    const updateCurrentTimestamp = async () => {
      if (provider) {
        const block = await provider.getBlockNumber();
        console.log(block, "blocktimestamp");
        if (block) {
          setCurrentTimestamp(Number(block));
        }
      }
    };

    // Update immediately
    updateCurrentTimestamp();

    // Update every 15 seconds
    const interval = setInterval(updateCurrentTimestamp, 15000);

    return () => clearInterval(interval);
  }, [provider]);

  // Calculate if withdrawal is allowed
  const canWithdraw = launchExpiresAt
    ? Number(launchExpiresAt) <= currentTimestamp
    : false;

  // Calculate time remaining
  const timeRemaining = launchExpiresAt
    ? Number(launchExpiresAt) - currentTimestamp
    : 0;

  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return "Withdrawal now available";

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return `Time until withdrawal: ${parts.join(" ")}`;
  };

  const handleWithdraw = async () => {
    if (!provider || !account || !msoAddress || !chainId) {
      setError("Please connect your wallet");
      return;
    }

    if (!canWithdraw) {
      setError("Withdrawal period has not started yet");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      // First simulate the transaction
      const publicClient = getViemClient(chainId);

      try {
        // Simulate the withdrawal make it uses the current
        await publicClient.simulateContract({
          address: msoAddress as `0x${string}`,
          abi: MSO_ABI,
          functionName: "withdraw",
          args: [withdrawPercentage],
          account: account as `0x${string}`,
        });
      } catch (simulationError: any) {
        console.error("Simulation error:", simulationError);
        // Extract the revert reason if available
        const revertReason =
          simulationError.cause?.reason || simulationError.message;
        throw new Error(`Transaction would fail: ${revertReason}`);
      }

      // If simulation succeeds, proceed with the actual transaction
      const signer = await provider.getSigner();
      const msoContract = new ethers.Contract(msoAddress, MSO_ABI, signer);

      const tx = await msoContract.withdraw(withdrawPercentage);
      setTxHash(tx.hash);

      await tx.wait();

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["investorDetails"] });
      queryClient.invalidateQueries({ queryKey: ["msoDetails"] });
      queryClient.invalidateQueries({ queryKey: ["poolPrices"] });

      // Reset form
      setWithdrawPercentage(100);
    } catch (err: any) {
      console.error("Withdrawal error:", err);
      setError(err.message || "Failed to withdraw liquidity");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50 rounded-xl shadow-sm border border-purple-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
            <svg
              className="h-5 w-5 text-purple-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Withdraw Liquidity
            </h2>
            <p className="text-sm text-gray-500">
              Remove your position from the pool
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Time Remaining Display */}
        <div className="bg-white rounded-lg p-4 border border-purple-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Withdrawal Status
            </span>
            <span
              className={`text-sm font-medium ${
                canWithdraw ? "text-green-600" : "text-orange-600"
              }`}
            >
              {formatTimeRemaining(timeRemaining)}
              {/* {launchExpiresAt} */}
            </span>
          </div>
          {!canWithdraw && (
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-500"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(
                      100,
                      (currentTimestamp / Number(launchExpiresAt)) * 100
                    )
                  )}%`,
                }}
              />
            </div>
          )}
        </div>

        {/* Percentage Selector Section */}
        <div className="bg-white rounded-lg p-4 border border-purple-100">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Withdrawal Amount
          </label>

          {/* Quick Select Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[25, 50, 75, 100].map((percentage) => (
              <button
                key={percentage}
                onClick={() => setWithdrawPercentage(percentage)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  withdrawPercentage === percentage
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                }`}
              >
                {percentage}%
              </button>
            ))}
          </div>

          {/* Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Percentage</span>
              <span className="text-sm font-medium text-purple-600">
                {withdrawPercentage}%
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={withdrawPercentage}
              onChange={(e) => setWithdrawPercentage(Number(e.target.value))}
              className="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Updated Withdraw Button */}
        <button
          onClick={handleWithdraw}
          disabled={isLoading || !account || !canWithdraw}
          className={`w-full py-4 px-6 rounded-lg text-sm font-semibold transition-all duration-200
            ${
              isLoading || !account || !canWithdraw
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Spinner className="h-4 w-4 mr-2" />
              <span>Processing Withdrawal...</span>
            </div>
          ) : !canWithdraw ? (
            "Withdrawal period has not started"
          ) : (
            `Withdraw ${withdrawPercentage}% of Liquidity`
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p
                  style={{ overflowWrap: "anywhere" }}
                  className="text-sm font-medium text-red-800"
                >
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Hash */}
        {txHash && (
          <div className="rounded-lg bg-green-50 border border-green-100 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Transaction Submitted
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <a
                    href={`https://polygonscan.com/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-green-600 hover:text-green-500"
                  >
                    <span>View on PolygonScan</span>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Information Note */}
        <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
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
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Withdrawing liquidity will remove your position from the pool.
                This would also collect any unclaimed fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
