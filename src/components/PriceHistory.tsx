import { useEffect, useState } from "react";
import { createPublicClient, http, parseAbiItem } from "viem";
import { hardhat } from "viem/chains";
import { IUniswapV3Pool } from "../hooks/abi/IUniswapV3Pool";
import { ethers } from "ethers";
import { useSyncPrice } from "@/hooks/useSyncPrice";

interface PriceHistoryEntry {
  timestamp: string;
  token0Price: string;
  token1Price: string;
  token0Symbol: string;
  token1Symbol: string;
}

interface PriceHistoryProps {
  poolAddress: string;
  projectPrice: number;
  msoAddress: string;
  priceRatio: number;
}

export function PriceHistory({
  poolAddress,
  projectPrice,
  msoAddress,
  priceRatio,
}: PriceHistoryProps) {
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);
  const [tokenSymbols, setTokenSymbols] = useState({
    token0Symbol: "",
    token1Symbol: "",
  });
  const { syncPrice, isSyncing, syncError } = useSyncPrice();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const storedPriceHistory = localStorage.getItem(
      `priceHistory-${poolAddress}`
    );
    if (storedPriceHistory) {
      setPriceHistory(JSON.parse(storedPriceHistory));
    }
  }, [poolAddress]);

  const calculatePrice = async (sqrtPriceX96Data: bigint) => {
    const client = createPublicClient({
      chain: hardhat,
      transport: http("http://127.0.0.1:8545"),
    });

    try {
      // Get token addresses
      const [token0, token1] = await Promise.all([
        client.readContract({
          address: poolAddress as `0x${string}`,
          abi: IUniswapV3Pool,
          functionName: "token0",
        }),
        client.readContract({
          address: poolAddress as `0x${string}`,
          abi: IUniswapV3Pool,
          functionName: "token1",
        }),
      ]);

      // Get token symbols and decimals
      const [symbol0, symbol1, decimal0, decimal1] = await Promise.all([
        client.readContract({
          address: token0 as `0x${string}`,
          abi: [
            {
              name: "symbol",
              type: "function",
              stateMutability: "view",
              inputs: [],
              outputs: [{ type: "string" }],
            },
          ],
          functionName: "symbol",
        }),
        client.readContract({
          address: token1 as `0x${string}`,
          abi: [
            {
              name: "symbol",
              type: "function",
              stateMutability: "view",
              inputs: [],
              outputs: [{ type: "string" }],
            },
          ],
          functionName: "symbol",
        }),
        client.readContract({
          address: token0 as `0x${string}`,
          abi: [
            {
              name: "decimals",
              type: "function",
              stateMutability: "view",
              inputs: [],
              outputs: [{ type: "uint8" }],
            },
          ],
          functionName: "decimals",
        }),
        client.readContract({
          address: token1 as `0x${string}`,
          abi: [
            {
              name: "decimals",
              type: "function",
              stateMutability: "view",
              inputs: [],
              outputs: [{ type: "uint8" }],
            },
          ],
          functionName: "decimals",
        }),
      ]);

      setTokenSymbols({
        token0Symbol: symbol0 as string,
        token1Symbol: symbol1 as string,
      });

      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

      const pool = new ethers.Contract(poolAddress, IUniswapV3Pool, provider);

      const liquidity = await pool.liquidity();
      const Token0 = await pool.token0();

      const sqrtPriceX96 = BigInt(String(sqrtPriceX96Data) as string);

      // Calculate prices
      const priceToken0InToken1 =
        (Number(sqrtPriceX96) / 2 ** 96) ** 2 / 10 ** (decimal1 - decimal0);
      const priceToken1InToken0 = 1 / priceToken0InToken1;

      // console.log("Price of Token0 in Token1:", priceToken0InToken1);
      // console.log("Price of Token1 in Token0:", priceToken1InToken0);

      // Calculate token reserves
      const token0Reserve =
        (BigInt(liquidity) * BigInt(2 ** 96)) / BigInt(sqrtPriceX96);
      const token1Reserve =
        (BigInt(liquidity) * BigInt(sqrtPriceX96)) / BigInt(2 ** 96);

      console.log(token0Reserve, token1Reserve, "token reserves");

      return {
        token0Price: priceToken0InToken1.toFixed(Number(decimal1)),
        token1Price: priceToken1InToken0.toFixed(Number(decimal0)),
        token0Reserve: ethers.formatUnits(token0Reserve, decimal0),
        token1Reserve: ethers.formatUnits(token1Reserve, decimal1),
        Token0: Token0,
      };
    } catch (error) {
      console.error("Error calculating price:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!poolAddress) return;

    const client = createPublicClient({
      chain: hardhat,
      transport: http("http://127.0.0.1:8545"),
    });

    // Watch for Swap events
    const unwatch = client.watchContractEvent({
      address: poolAddress as `0x${string}`,
      abi: IUniswapV3Pool,
      eventName: "Swap",
      onLogs: async (logs) => {
        if (logs && logs.length > 0) {
          const latestLog = logs[logs.length - 1];
          const sqrtPriceX96 = latestLog?.args?.sqrtPriceX96;
          
          if (!sqrtPriceX96) {
            console.error('Missing sqrtPriceX96 from swap event');
            return;
          }

          const price = await calculatePrice(sqrtPriceX96);

          if (price) {
            const newEntry = {
              timestamp: new Date().toLocaleString(),
              ...price,
              ...tokenSymbols,
            };

            setPriceHistory((prev) => {
              const lastEntry = prev[0];
              if (
                lastEntry &&
                lastEntry.token0Price === newEntry.token0Price &&
                lastEntry.token1Price === newEntry.token1Price
              ) {
                return prev;
              }

              const updatedHistory = [newEntry, ...prev].slice(0, 50);
              localStorage.setItem(
                `priceHistory-${poolAddress}`,
                JSON.stringify(updatedHistory)
              );
              return updatedHistory;
            });

            const tokenMainPrice =
              msoAddress == price.Token0
                ? price.token0Price
                : price.token1Price;

            if (
              Math.abs(
                Number(projectPrice.toString()) - Number(tokenMainPrice)
              ) /
                Number(tokenMainPrice) >
              0.05
            ) {
              // await syncPrice({
              //   projectedPrice: projectPrice.toString(),
              //   msoAddress: msoAddress,
              //   token0Reserve: price.token0Reserve,
              //   token1Reserve: price.token1Reserve,
              //   Token0: price.Token0,
              //   priceRatio: priceRatio,
              // });
            }
          }
        }
      },
    });

    return () => {
      unwatch();
    };
  }, [poolAddress]);

  if (!priceHistory.length) return null;

  return (
    <div
      className={`mt-4 p-4 border rounded-lg bg-white shadow-sm ${
        isExpanded ? "w-full" : ""
      }`}
      style={{ transition: "width 0.3s ease-in-out" }}
    >
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="font-medium text-lg">
          Price History{" "}
          {isSyncing && (
            <span className="ml-2 bg-blue-500 text-white text-xs font-bold mr-3 px-2.5 py-0.5 rounded dark:bg-blue-500 dark:text-gray-900">
              Syncing
            </span>
          )}
        </h3>
        <button
          className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      </div>

      <div className="overflow-auto max-h-60">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                Time
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                {tokenSymbols.token0Symbol}/{tokenSymbols.token1Symbol}
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                {tokenSymbols.token1Symbol}/{tokenSymbols.token0Symbol}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {priceHistory.map((entry, index) => (
              <tr key={entry.timestamp}>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {entry.timestamp}
                </td>
                <td className="px-4 py-2 text-sm text-right font-medium">
                  {Number(entry.token0Price).toFixed(4)}
                </td>
                <td className="px-4 py-2 text-sm text-right font-medium">
                  {Number(entry.token1Price).toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
