import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";

import { createPublicClient, erc20Abi, http } from "viem";
import { mainnet, polygon, bsc, hardhat } from "viem/chains";

// Define the Hardhat network configuration
const hardhatConfig = {
  id: 31337,
  name: "Hardhat",
  network: "hardhat",
  rpcUrls: ["http://127.0.0.1:8545/"],
};

export function getRpcUrlForChain(chainId: number): string {
  switch (chainId) {
    case 1:
      return `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`;
    case 137:
      return `https://polygon-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`;
    case 56:
      return `https://bsc-dataseed.binance.org/`;
    case 31337:
      return "http://127.0.0.1:8545/";
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
}

// Create a function to return the appropriate public client based on the chain ID
export function getClientForChain(chainId: number) {
  switch (chainId) {
    case 1:
      return createPublicClient({
        chain: mainnet,
        transport: http(
          `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`
        ),
      });
    case 137:
      return createPublicClient({
        chain: polygon,
        transport: http(
          `https://polygon-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`
        ),
      });
    case 56:
      return createPublicClient({
        chain: bsc,
        transport: http(`https://bsc-dataseed.binance.org/`),
      });
    case 31337:
      return createPublicClient({
        chain: hardhat,
        transport: http(hardhatConfig.rpcUrls[0]),
      });
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
}

export function getFundAddress(chainId: number) {
  switch (chainId) {
    case 1:
      return "0x490e64e0690b4aa481fb02255aed3d052bad7bf1";
    case 137:
      return "0xcdf038dd3b66506d2e5378aee185b2f0084b7a33";
    case 56:
      return "";
    case 8453:
      return "0xb6257a6c3aef640a7d09e3dd009a29308d2a321a";
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
}

export const abiFund = [
  {
    inputs: [{ internalType: "address", name: "_vaultProxy", type: "address" }],
    name: "calcNetShareValue",
    outputs: [
      { internalType: "address", name: "denominationAsset_", type: "address" },
      { internalType: "uint256", name: "netShareValue_", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export function useVaultPrice(
  vaultAddress: string | undefined | null,
  depositToken: string | undefined | null,
  chainId: number | undefined | null
) {
  const {
    data: vaultPrice,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["vaultPrice", chainId, vaultAddress, depositToken],
    queryFn: async () => {
      if (!chainId) {
        throw new Error("Chain ID is required");
      }
      const fundAddress = getFundAddress(chainId);

      console.log(
        fundAddress,
        "fundAddress",
        chainId,
        vaultAddress,
        depositToken
      );

      if (!fundAddress) {
        throw new Error("Invalid fund address");
      }

      const client = getClientForChain(chainId);

      const result = await client.simulateContract({
        address: fundAddress as `0x${string}`,
        abi: abiFund,
        functionName: "calcNetShareValue",
        args: [vaultAddress],
      });

      const [tokenAddress, netShareValue] = result.result as [string, bigint];

      console.log(result, "result", depositToken);

      const depositTokenDecimals = await client.readContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "decimals",
      });

      console.log(tokenAddress, netShareValue, "tokenAddress, netShareValue");

      return ethers.formatUnits(netShareValue, Number(depositTokenDecimals));
    },
    enabled: !!vaultAddress && !!chainId && !!depositToken, // if chainId is not set, don't fetch
    refetchInterval: 60000, // Refetch every 60 seconds (1 minute)
    refetchIntervalInBackground: true, // Optional: continue fetching even when the window is in background
    staleTime: 55000, // Consider data stale after 55 seconds
    // cacheTime: 120000, // Keep data in cache for 2 minutes
    // make sure when the vaultaddress changes, the query is refetched
  });

  return { vaultPrice, isLoading, error };
}
