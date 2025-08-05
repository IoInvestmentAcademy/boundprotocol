import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { MSOExchange_ABI } from "@/hooks/abi/MSOExchange_ABI";
import { useWallet } from "@/context/WalletContext";
import { MSOExchangeAbi } from "./abi/MSOExchangeAbi";
import { getRpcUrl } from "@/utils/viemClient";
interface ExchangeInfo {
  amount: string;
  timestamp: number;
  isPending: boolean;
  isClaimed: boolean;
}

interface ExitQueue {
  sBOUNDAmount: string;
  boundAmount: string;
  timestamp: number;
  isPending: boolean;
}

interface MSOExchangeState {
  currentRate: string;
  exchangeFee: string;
  pendingExchanges: ExchangeInfo[];
  exitQueue: ExitQueue | null;
  isLoading: boolean;
  error: string | null;
}

export function useMSOExchange(exchangeAddress: string) {
  const { chainId, account, provider: walletProvider } = useWallet();
  const [state, setState] = useState<MSOExchangeState>({
    currentRate: "0",
    exchangeFee: "0",
    pendingExchanges: [],
    exitQueue: null,
    isLoading: true,
    error: null,
  });

  const fetchExchangeData = async () => {
    if (!chainId) return;
    const provider = new ethers.JsonRpcProvider(getRpcUrl(chainId as number));
    // console.log(exchangeAddress, "exchangeAddress");
    // console.log(provider, "provider");
    // console.log(account, "account");
    if (!provider || !account || !exchangeAddress) return;

    try {
      const exchangeContract = new ethers.Contract(
        exchangeAddress,
        MSOExchangeAbi,
        provider
      );

      const [currentRate, exchangeFee, pendingExchanges, exitQueue] =
        await Promise.all([
          exchangeContract.currentRate(),
          exchangeContract.exchangeFee(),
          exchangeContract.getPendingExchanges(account),
          exchangeContract.exitQueues(account),
        ]);

      console.log(
        currentRate,
        "currentRate",
        exchangeFee,
        pendingExchanges,
        exitQueue
      );

      setState({
        currentRate: ethers.formatUnits(currentRate, 18),
        exchangeFee: ethers.formatUnits(exchangeFee, 4), // Fee is in basis points
        pendingExchanges: pendingExchanges.map((exchange: any) => ({
          amount: ethers.formatUnits(exchange.amount, 18),
          timestamp: Number(exchange.timestamp),
          isPending: exchange.isPending,
          isClaimed: exchange.isClaimed,
        })),
        exitQueue: exitQueue.isPending
          ? {
              sBOUNDAmount: ethers.formatUnits(exitQueue.sBOUNDAmount, 18),
              boundAmount: ethers.formatUnits(exitQueue.boundAmount, 18),
              timestamp: Number(exitQueue.timestamp),
              isPending: exitQueue.isPending,
            }
          : null,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
    }
  };

  const exchange = async (amount: string) => {
    const provider = walletProvider;
    if (!provider || !account || !exchangeAddress)
      throw new Error("Provider or account not found");

    const signer = await provider.getSigner();
    const exchangeContract = new ethers.Contract(
      exchangeAddress,
      MSOExchange_ABI,
      signer
    );

    const amountWei = ethers.parseUnits(amount, 18);
    const tx = await exchangeContract.exchange(amountWei);
    await tx.wait();
    await fetchExchangeData();
  };

  const claimExchange = async (exchangeId: number) => {
    const provider = walletProvider;
    if (!provider || !account || !exchangeAddress)
      throw new Error("Provider or account not found");

    const signer = await provider.getSigner();
    const exchangeContract = new ethers.Contract(
      exchangeAddress,
      MSOExchange_ABI,
      signer
    );

    const tx = await exchangeContract.claimExchange(exchangeId);
    await tx.wait();
    await fetchExchangeData();
  };

  const enterExitQueue = async (amount: string) => {
    const provider = walletProvider;
    if (!provider || !account || !exchangeAddress)
      throw new Error("Provider or account not found");

    const signer = await provider.getSigner();
    const exchangeContract = new ethers.Contract(
      exchangeAddress,
      MSOExchange_ABI,
      signer
    );

    const amountWei = ethers.parseUnits(amount, 18);
    const tx = await exchangeContract.enterExitQueue(amountWei);
    await tx.wait();
    await fetchExchangeData();
  };

  const processExitQueue = async () => {
    const provider = walletProvider;
    if (!provider || !account || !exchangeAddress)
      throw new Error("Provider or account not found");

    const signer = await provider.getSigner();
    const exchangeContract = new ethers.Contract(
      exchangeAddress,
      MSOExchange_ABI,
      signer
    );

    const tx = await exchangeContract.processExitQueue();
    await tx.wait();
    await fetchExchangeData();
  };

  useEffect(() => {
    fetchExchangeData();
    const interval = setInterval(fetchExchangeData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [chainId, account, exchangeAddress]);

  return {
    ...state,
    exchange,
    claimExchange,
    enterExitQueue,
    processExitQueue,
    refetch: fetchExchangeData,
  };
}
