import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useMSOExchange } from "@/hooks/useMSOExchange";
import { Spinner } from "./Spinner";
import { useWallet } from "@/context/WalletContext";
import { IERC20 } from "@/hooks/abi/IERC20";
import { MSOExchange_ABI } from "@/hooks/abi/MSOExchange_ABI";
import { getViemClient, getRpcUrl } from "@/utils/viemClient";
import { MSOExchangeAbi } from "@/hooks/abi/MSOExchangeAbi";
import { VaultDetailData } from "@/pages/index";

interface StakingCardProps {
  exchangeAddress: string;
  msoAddress: string;
  sBOUNDAddress: string;
  msoDetails: MsoDetails;
  vaultData: VaultDetailData;
}

interface MsoDetails {
  syncReserveA: string;
  vaultTokenBalance: string;
  denominationAssetBalance: string;
  denominationAssetName: string;
  msoTokenSymbol: string;
}

interface ExchangeInfo {
  amount: string;
  timestamp: number;
  isPending: boolean;
  isClaimed: boolean;
}

interface ExitQueueInfo {
  sBOUNDAmount: string;
  boundAmount: string;
  timestamp: number;
  isPending: boolean;
}

export function StakingCard({
  exchangeAddress,
  msoAddress,
  sBOUNDAddress,
  msoDetails,
  vaultData,
}: StakingCardProps) {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { chainId } = useWallet();
  const [error, setError] = useState<string | null>(null);
  const { account, provider: signerWallet } = useWallet();
  const [balances, setBalances] = useState({
    mso: "0",
    sBOUND: "0",
  });
  const [allowances, setAllowances] = useState({
    mso: "0",
    sBOUND: "0",
  });
  const [activeTab, setActiveTab] = useState<"stake" | "exit" | "processing">(
    "stake"
  );
  const [pendingExchanges, setPendingExchanges] = useState<ExchangeInfo[]>([]);
  const [timeLeft, setTimeLeft] = useState<{ [key: number]: string }>({});
  const [lockPeriods, setLockPeriods] = useState({
    minimumLockPeriod: 0,
    exitQueuePeriod: 0,
  });
  const [exitQueueInfo, setExitQueueInfo] = useState<ExitQueueInfo | null>(
    null
  );
  const [exitTimeLeft, setExitTimeLeft] = useState<string>("");

  const {
    currentRate,
    exchangeFee,
    exitQueue,
    isLoading,
    exchange,
    claimExchange,
    enterExitQueue,
    processExitQueue,
  } = useMSOExchange(exchangeAddress);

  const fetchBalancesAndAllowances = async () => {
    if (!account) return;

    const provider = new ethers.JsonRpcProvider(getRpcUrl(chainId as number));

    try {
      const msoContract = new ethers.Contract(msoAddress, IERC20, provider);
      const sBOUNDContract = new ethers.Contract(
        sBOUNDAddress,
        IERC20,
        provider
      );

      const [
        msoBalance,
        sBOUNDBalance,
        msoAllowance,
        sBOUNDAllowance,
        sBOUNDTotalSupply,
      ] = await Promise.all([
        msoContract.balanceOf(account),
        sBOUNDContract.balanceOf(account),
        msoContract.allowance(account, exchangeAddress),
        sBOUNDContract.allowance(account, exchangeAddress),
        sBOUNDContract.totalSupply(),
      ]);

      console.log(
        ethers.formatUnits(sBOUNDTotalSupply, 18),
        "sBOUNDTotalSupply"
      );

      setBalances({
        mso: ethers.formatUnits(msoBalance, 18),
        sBOUND: ethers.formatUnits(sBOUNDBalance, 18),
      });

      setAllowances({
        mso: ethers.formatUnits(msoAllowance, 18),
        sBOUND: ethers.formatUnits(sBOUNDAllowance, 18),
      });
    } catch (error) {
      console.error("Error fetching balances and allowances:", error);
    }
  };

  const fetchPendingExchanges = async () => {
    if (!account) return;
    const provider = new ethers.JsonRpcProvider(getRpcUrl(chainId as number));

    try {
      const exchangeContract = new ethers.Contract(
        exchangeAddress,
        MSOExchange_ABI,
        provider
      );
      const exchanges = await exchangeContract.getPendingExchanges(account);

      console.log(exchanges, "exchanges");

      // Convert ExchangeInfo structs to objects
      const formattedExchanges = exchanges.map((exchange: any) => ({
        amount: ethers.formatUnits(exchange.amount, 18),
        timestamp: Number(exchange.timestamp),
        isPending: exchange.isPending,
        isClaimed: exchange.isClaimed,
      }));

      console.log(formattedExchanges, "formattedExchanges");

      setPendingExchanges(formattedExchanges);
    } catch (error) {
      console.error("Error fetching pending exchanges:", error);
    }
  };

  const fetchLockPeriods = async () => {
    if (!account) return;
    const provider = new ethers.JsonRpcProvider(getRpcUrl(chainId as number));

    try {
      const exchangeContract = new ethers.Contract(
        exchangeAddress,
        MSOExchangeAbi,
        provider
      );

      const [minimumLockPeriod, exitQueuePeriod] = await Promise.all([
        exchangeContract.MINIMUM_LOCK_PERIOD(),
        exchangeContract.EXIT_QUEUE_PERIOD(),
      ]);

      setLockPeriods({
        minimumLockPeriod: Number(minimumLockPeriod),
        exitQueuePeriod: Number(exitQueuePeriod),
      });
    } catch (error) {
      console.error("Error fetching lock periods:", error);
    }
  };

  const fetchExitQueueInfo = async () => {
    if (!account) return;
    const provider = new ethers.JsonRpcProvider(getRpcUrl(chainId as number));

    try {
      const publicClient = getViemClient(chainId as number);
      const exitQueue = await publicClient.readContract({
        address: exchangeAddress as `0x${string}`,
        abi: MSOExchange_ABI,
        functionName: "exitQueues",
        args: [account as `0x${string}`],
      });

      // const exitQueue = await exchangeContract.exitQueues(account);

      console.log(exitQueue, "exitQueue");

      let pending = exitQueue[3];

      if (pending) {
        setExitQueueInfo({
          sBOUNDAmount: exitQueue[0].toString(),
          boundAmount: exitQueue[1].toString(),
          timestamp: Number(exitQueue[2]),
          isPending: pending,
        });
      } else {
        setExitQueueInfo(null);
      }
    } catch (error) {
      console.error("Error fetching exit queue info:", error);
    }
  };

  useEffect(() => {
    fetchBalancesAndAllowances();
    fetchPendingExchanges();
    fetchLockPeriods();
    fetchExitQueueInfo();
    const interval = setInterval(() => {
      fetchBalancesAndAllowances();
      fetchPendingExchanges();
      fetchLockPeriods();
      fetchExitQueueInfo();
    }, 30000);
    return () => clearInterval(interval);
  }, [chainId, account, msoAddress, sBOUNDAddress, exchangeAddress]);

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const newTimeLeft: { [key: number]: string } = {};

      pendingExchanges.forEach((exchange, index) => {
        if (exchange.isPending && !exchange.isClaimed) {
          const lockEndTime =
            exchange.timestamp + lockPeriods.minimumLockPeriod;
          const timeRemaining = lockEndTime - now;

          if (timeRemaining > 0) {
            const days = Math.floor(timeRemaining / (24 * 60 * 60));
            const hours = Math.floor(
              (timeRemaining % (24 * 60 * 60)) / (60 * 60)
            );
            const minutes = Math.floor((timeRemaining % (60 * 60)) / 60);
            newTimeLeft[index] = `${days}d ${hours}h ${minutes}m`;
          } else {
            newTimeLeft[index] = "Ready to claim";
          }
        }
      });

      setTimeLeft(newTimeLeft);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [pendingExchanges, lockPeriods.minimumLockPeriod]);

  useEffect(() => {
    const updateExitTimeLeft = () => {
      if (!exitQueueInfo || !exitQueueInfo.isPending) {
        setExitTimeLeft("");
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      const lockEndTime = exitQueueInfo.timestamp + lockPeriods.exitQueuePeriod;
      const timeRemaining = lockEndTime - now;

      if (timeRemaining > 0) {
        const days = Math.floor(timeRemaining / (24 * 60 * 60));
        const hours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((timeRemaining % (60 * 60)) / 60);
        setExitTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else {
        setExitTimeLeft("Ready to process");
      }
    };

    updateExitTimeLeft();
    const interval = setInterval(updateExitTimeLeft, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [exitQueueInfo, lockPeriods.exitQueuePeriod]);

  const handleApprove = async (tokenAddress: string, tokenSymbol: string) => {
    if (!account || !signerWallet) return;

    const signer = await signerWallet.getSigner();

    try {
      setIsSubmitting(true);
      setError(null);

      const tokenContract = new ethers.Contract(tokenAddress, IERC20, signer);

      // Approve with maximum amount
      const maxAmount = ethers.MaxUint256;
      const tx = await tokenContract.approve(exchangeAddress, maxAmount);
      await tx.wait();

      // Refresh allowances
      await fetchBalancesAndAllowances();
    } catch (error: any) {
      setError(`Failed to approve ${tokenSymbol}: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExchange = async () => {
    if (!amount) {
      setError("Please enter an amount");
      return;
    }

    const amountBN = ethers.parseUnits(amount, 18);
    const msoBalanceBN = ethers.parseUnits(balances.mso, 18);
    const msoAllowanceBN = ethers.parseUnits(allowances.mso, 18);

    if (amountBN > msoBalanceBN) {
      setError(`Insufficient ${msoDetails.msoTokenSymbol} balance`);
      return;
    }

    if (amountBN > msoAllowanceBN) {
      setError(
        `Please approve ${msoDetails.msoTokenSymbol} token spending first`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await exchange(amount);
      setAmount("");
      await fetchBalancesAndAllowances();
      await fetchPendingExchanges();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnterExitQueue = async () => {
    if (!amount) {
      setError("Please enter an amount");
      return;
    }

    const amountBN = ethers.parseUnits(amount, 18);
    const sBOUNDBalanceBN = ethers.parseUnits(balances.sBOUND, 18);
    const sBOUNDAllowanceBN = ethers.parseUnits(allowances.sBOUND, 18);

    if (amountBN > sBOUNDBalanceBN) {
      setError("Insufficient sBOUND balance");
      return;
    }

    if (amountBN > sBOUNDAllowanceBN) {
      setError("Please approve sBOUND token spending first");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await enterExitQueue(amount);
      setAmount("");
      await fetchBalancesAndAllowances();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMaxAmount = () => {
    if (activeTab === "stake") {
      setAmount(balances.mso);
    } else {
      setAmount(balances.sBOUND);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-center">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Token Balances</h2>

      {/* Token Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BNDT Card */}
        <div className="border-2 border-black rounded-xl p-4 relative">
          <div className="flex items-center space-x-2 mb-4">
            <img src="/BND.png" alt="BNDT" className="h-6 w-6" />
            <h3 className="text-lg font-semibold">BNDT</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Balance</p>
              <p className="text-lg font-semibold">
                {Number(balances.mso).toLocaleString(undefined, {
                  maximumFractionDigits: 6,
                })}{" "}
                {msoDetails.msoTokenSymbol}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Locked</p>
              <p className="text-lg font-semibold">
                {exitQueueInfo?.boundAmount
                  ? Number(
                      ethers.formatUnits(exitQueueInfo.boundAmount, 18)
                    ).toLocaleString(undefined, {
                      maximumFractionDigits: 6,
                    })
                  : Number(exitQueue).toLocaleString(undefined, {
                      maximumFractionDigits: 6,
                    })}{" "}
                {msoDetails.msoTokenSymbol}
              </p>
            </div>
          </div>
        </div>

        {/* sBNDT Card */}
        <div className="border-2 border-black rounded-xl p-4 relative">
          <div className="flex items-center space-x-2 mb-4">
            <img src="/sBNDT.png" alt="sBNDT" className="h-6 w-6" />
            <h3 className="text-lg font-semibold">sBNDT</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Balance</p>
              <p className="text-lg font-semibold">
                {Number(balances.sBOUND).toLocaleString(undefined, {
                  maximumFractionDigits: 6,
                })}{" "}
                sBOUND
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Locked</p>
              <p className="text-lg font-semibold">
                {Number(
                  pendingExchanges
                    .filter((ex) => ex.isPending && !ex.isClaimed)
                    .reduce((acc, ex) => acc + Number(ex.amount), 0)
                ).toLocaleString(undefined, {
                  maximumFractionDigits: 6,
                })}{" "}
                sBOUND
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        {/* Tab Navigation */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 font-semibold">
            Swap
          </h3>
          <nav className="flex space-x-4 bg-gray-50 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("stake")}
              className={`${
                activeTab === "stake"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              } flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200`}
            >
              BNDT to sBOUND
            </button>
            <button
              onClick={() => setActiveTab("processing")}
              className={`${
                activeTab === "processing"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              } flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 relative`}
            >
              Claim Queue
              {pendingExchanges.filter((ex) => ex.isPending && !ex.isClaimed)
                .length > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                  {
                    pendingExchanges.filter(
                      (ex) => ex.isPending && !ex.isClaimed
                    ).length
                  }
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("exit")}
              className={`${
                activeTab === "exit"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              } flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200`}
            >
              sBOUND to BNDT
            </button>
          </nav>
        </div>

        {/* Processing Exchanges Tab */}
        {activeTab === "processing" && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Processing Exchanges
              </h3>
              <span className="text-sm text-gray-500">
                {
                  pendingExchanges.filter((ex) => ex.isPending && !ex.isClaimed)
                    .length
                }{" "}
                Pending
              </span>
            </div>
            {pendingExchanges.length === 0 ? (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center">
                <div className="flex flex-col items-center">
                  <svg
                    className="h-12 w-12 text-gray-400 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-500">No pending exchanges found</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingExchanges.map((exchange, index) => (
                  <div
                    key={index}
                    className={`bg-gradient-to-br ${
                      exchange.isPending && !exchange.isClaimed
                        ? "from-blue-50 to-indigo-50"
                        : "from-gray-50 to-gray-100"
                    } rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              exchange.isPending && !exchange.isClaimed
                                ? "bg-blue-100"
                                : "bg-green-100"
                            }`}
                          >
                            <svg
                              className={`h-5 w-5 ${
                                exchange.isPending && !exchange.isClaimed
                                  ? "text-blue-600"
                                  : "text-green-600"
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {Number(exchange.amount).toLocaleString(
                                undefined,
                                {
                                  maximumFractionDigits: 6,
                                }
                              )}{" "}
                              sBOUND
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(
                                exchange.timestamp * 1000
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {exchange.isPending && !exchange.isClaimed && (
                          <div className="ml-13">
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                              <p className="text-sm font-medium text-blue-600">
                                {timeLeft[index] || "Calculating..."}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        {exchange.isPending && !exchange.isClaimed && (
                          <button
                            disabled={timeLeft[index] !== "Ready to claim"}
                            onClick={() => claimExchange(index)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50"
                          >
                            <svg
                              className="h-4 w-4 mr-2"
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
                            Claim Exchange
                          </button>
                        )}
                        {exchange.isClaimed && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                            <svg
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Claimed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stake Form */}
        {activeTab === "stake" && (
          <div className="mb-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 font-bold">
                Swap BNDT to sBOUND
              </h3>
              {Number(allowances.mso) === 0 && Number(balances.mso) > 0 && (
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 text-amber-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="ml-2 text-sm text-amber-700">
                        Please approve {msoDetails.msoTokenSymbol} token spending first
                      </span>
                    </div>
                    <button
                      onClick={() => handleApprove(msoAddress, msoDetails.msoTokenSymbol)}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 transition-all duration-200"
                    >
                      {isSubmitting ? <Spinner /> : `Approve ${msoDetails.msoTokenSymbol}`}
                    </button>
                  </div>
                </div>
              )}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter BNDT amount"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
                  />
                  <button
                    onClick={handleMaxAmount}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    MAX
                  </button>
                </div>
                <button
                  onClick={handleExchange}
                  disabled={
                    isSubmitting ||
                    Number(balances.mso) === 0 ||
                    Number(allowances.mso) === 0
                  }
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
                >
                  {isSubmitting ? <Spinner /> : "Swap"}
                </button>
              </div>
              {Number(balances.mso) === 0 && (
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-amber-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800">
                        No MSO Balance
                      </h3>
                      <div className="mt-2 text-sm text-amber-700">
                        <p>
                          You need {msoDetails.msoTokenSymbol} to stake. Please
                          acquire {msoDetails.msoTokenSymbol} tokens first.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Exit Queue Form */}
        {activeTab === "exit" && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Exit Queue
            </h3>
            {Number(balances.sBOUND) === 0 ? (
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-amber-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">
                      No sBOUND Balance
                    </h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <p>
                        You need sBOUND tokens to enter the exit queue. Please
                        stake {msoDetails.msoTokenSymbol} first to receive
                        sBOUND tokens.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {Number(allowances.sBOUND) === 0 && (
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg
                          className="h-5 w-5 text-amber-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="ml-2 text-sm text-amber-700">
                          Please approve sBOUND token spending first
                        </span>
                      </div>
                      <button
                        onClick={() => handleApprove(sBOUNDAddress, "sBOUND")}
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 transition-all duration-200"
                      >
                        {isSubmitting ? <Spinner /> : "Approve sBOUND"}
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter sBOUND amount"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
                    />
                    <button
                      onClick={handleMaxAmount}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      MAX
                    </button>
                  </div>
                  <button
                    onClick={handleEnterExitQueue}
                    disabled={isSubmitting || Number(allowances.sBOUND) === 0}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
                  >
                    {isSubmitting ? <Spinner /> : "Swap"}
                  </button>
                </div>
                {error && (
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-200">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
              </div>
            )}

            {exitQueueInfo && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <svg
                          className="h-5 w-5 text-emerald-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Exit Queue Status
                        </p>
                        <p className="text-sm text-gray-600">
                          {exitTimeLeft || "Calculating..."}
                        </p>
                      </div>
                    </div>
                    {exitTimeLeft === "Ready to process" && (
                      <button
                        onClick={processExitQueue}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                      >
                        Process Exit
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-emerald-100">
                    <div>
                      <p className="text-sm text-gray-600">sBOUND Amount</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {Number(
                          ethers.formatEther(exitQueueInfo.sBOUNDAmount)
                        ).toLocaleString(undefined, {
                          maximumFractionDigits: 6,
                        })}{" "}
                        sBOUND
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">You will receive</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {ethers.formatEther(exitQueueInfo.boundAmount)}{" "}
                        {msoDetails.msoTokenSymbol}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-emerald-100">
                    <p className="text-sm text-gray-600">Exit Period Ends</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(
                        exitQueueInfo.timestamp * 1000 +
                          lockPeriods.exitQueuePeriod * 1000
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <svg
                className="h-4 w-4"
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
              <span>A 0.50% fee is applied on each BOUND ↔ sBOUND swap</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <svg
                className="h-4 w-4"
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
              <span>7-day lock period applies to all exchanges</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
