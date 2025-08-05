import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { IUniswapV3Pool } from "@/hooks/abi/IUniswapV3Pool";
import { erc20Abi } from "viem";
import { MSO_ABI } from "@/hooks/abi/MSO_ABI";
import { getRpcUrl, getViemClient } from "@/utils/viemClient";
import { getFundAddress } from "@/hooks/useVaultPrice";

interface PoolPricesProps {
  poolAddress: string;
  msoAddress: string;
  chainId: number;
  enabled?: boolean;
}

interface PriceData {
  token0Price: string;
  token1Price: string;
  token0Reserve: string;
  token1Reserve: string;
  token0Symbol: string;
  token1Symbol: string;
  tokenAddressSymbol: string;
  token0: string;
  token1: string;
}

export const usePoolPrices = ({
  poolAddress,
  msoAddress,
  chainId,
  enabled = true,
}: PoolPricesProps) => {
  return useQuery<PriceData>({
    queryKey: ["poolPrices", poolAddress, chainId, msoAddress],
    queryFn: async () => {
      const provider = new ethers.JsonRpcProvider(getRpcUrl(chainId));
      // Get the fund address for the current chain
      const fundAddress = getFundAddress(chainId);
      if (!fundAddress) {
        throw new Error("Invalid fund address");
      }

      const publicClient = getViemClient(chainId);

      // Get pool tokens
      const [token0, token1] = await Promise.all([
        publicClient.readContract({
          address: poolAddress as `0x${string}`,
          abi: IUniswapV3Pool,
          functionName: "token0",
        }),
        publicClient.readContract({
          address: poolAddress as `0x${string}`,
          abi: IUniswapV3Pool,
          functionName: "token1",
        }),
      ]);

      // Create token contracts
      const token0Contract = new ethers.Contract(token0, erc20Abi, provider);
      const token1Contract = new ethers.Contract(token1, erc20Abi, provider);

      // Get token details and price ratio
      const [decimal0, decimal1, token0Symbol, token1Symbol, priceRatio] =
        await Promise.all([
          publicClient.readContract({
            address: token0 as `0x${string}`,
            abi: erc20Abi,
            functionName: "decimals",
          }),
          publicClient.readContract({
            address: token1 as `0x${string}`,
            abi: erc20Abi,
            functionName: "decimals",
          }),
          token0Contract.symbol(),
          token1Contract.symbol(),
          publicClient.readContract({
            address: msoAddress as `0x${string}`,
            abi: MSO_ABI,
            functionName: "priceRatio",
          }),
        ]);

      // Create pool contract and get slot0 and liquidity
      const pool = new ethers.Contract(poolAddress, IUniswapV3Pool, provider);
      const [slot0Data, liquidity] = await Promise.all([
        pool.slot0(),
        pool.liquidity(),
      ]);

      const { sqrtPriceX96 } = slot0Data;

      // Calculate prices
      const priceToken0InToken1 =
        (Number(sqrtPriceX96) / 2 ** 96) ** 2 / 10 ** (decimal1 - decimal0);
      const priceToken1InToken0 = 1 / priceToken0InToken1;

      // Calculate reserves
      const token0Reserve =
        (BigInt(liquidity) * BigInt(2 ** 96)) / BigInt(sqrtPriceX96);
      const token1Reserve =
        (BigInt(liquidity) * BigInt(sqrtPriceX96)) / BigInt(2 ** 96);

      console.log(
        priceToken0InToken1,
        priceToken1InToken0,
        "priceToken0InToken1, priceToken1InToken0"
      );

      return {
        token0Price: priceToken0InToken1.toFixed(decimal1),
        token1Price: priceToken1InToken0.toFixed(decimal0),
        token0Reserve: ethers.formatUnits(token0Reserve, decimal0),
        token1Reserve: ethers.formatUnits(token1Reserve, decimal1),
        token0Symbol,
        token1Symbol,
        tokenAddressSymbol: token0Symbol,
        token0,
        token1,
      };
    },
    enabled: enabled && !!poolAddress && !!chainId,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
    retry: 2,
  });
};
