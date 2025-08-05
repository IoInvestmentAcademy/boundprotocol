import { useState, useEffect } from "react";
import { useVaultPrice } from "@/hooks/useVaultPrice";
import { Spinner } from "./Spinner";
import { VaultDeployment } from "@/types/vault";
import { formatUnits, parseUnits } from "viem";
import { getViemClient } from "@/utils/viemClient";
import { MSO_ABI } from "@/hooks/abi/MSO_ABI";
import { ethers } from "ethers";
import { LaunchTransactionModal } from "./LaunchTransactionModal";
import { ERC20_ABI } from "@/hooks/abi/ERC20_ABI";
import { IERC20 } from "@/hooks/abi/IERC20";
import { useAccount } from "wagmi";
interface LaunchPoolFormProps {
  vault: VaultDeployment;
  chainId: number;
  denominationAssetName: string | null;
}

interface LaunchParams {
  priceRatio: string;
  poolFee: string;
  syntheticTokenAmount: bigint;
  investmentTokenAmount: bigint;
  sqrtPriceX96: bigint;
  tickerUpperValue: number;
  tickerLowerValue: number;
}

export function LaunchPoolFormStable({
  vault,
  chainId,
  denominationAssetName,
}: LaunchPoolFormProps) {
  const { chain } = useAccount();
  const [priceRatio, setPriceRatio] = useState("1");
  const [poolFee, setPoolFee] = useState("");
  const [computedValues, setComputedValues] =
    useState<Partial<LaunchParams> | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [balanceA, setBalanceA] = useState<bigint | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [denominationAssetSymbol, setDenominationAssetSymbol] = useState("");
  const [msoSymbol, setMsoSymbol] = useState("");

  const [vaultPrice, setVaultPrice] = useState<number | null>(1);

  console.log(vault.vault.address, "vault from launch pool form");

  // Fetch balanceA from MSO contract
  useEffect(() => {
    const fetchBalanceA = async () => {
      if (!vault.vault.address || !chainId) return;

      try {
        setIsLoadingBalance(true);
        const publicClient = getViemClient(chainId);

        const balance = await publicClient.readContract({
          address: vault.mso.address as `0x${string}`,
          abi: MSO_ABI,
          functionName: "balanceA",
        });

        setBalanceA(balance as bigint);

        const symbol = await publicClient.readContract({
          address: vault.denominationAsset as `0x${string}`,
          abi: IERC20,
          functionName: "symbol",
        });

        setDenominationAssetSymbol(symbol as string);

        const msoSymbol = await publicClient.readContract({
          address: vault.mso.address as `0x${string}`,
          abi: MSO_ABI,
          functionName: "symbol",
        });

        setMsoSymbol(msoSymbol as string);
      } catch (error) {
        console.error("Error fetching balanceA:", error);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchBalanceA();
  }, [vault.vault.address, chainId]);

  // Calculate all required values when inputs change
  useEffect(() => {
    if (!vaultPrice || !priceRatio || !poolFee || !balanceA) return;

    // if (Number(poolFee) === 0.01) {
    //   setPoolFee("100");
    // } else if (Number(poolFee) === 0.05) {
    //   setPoolFee("500");
    // }

    try {
      // Constants
      const tickUpper = 887220;
      const tickLower = -887220;
      const tickSpacing = getTickSpacingForFee(Number(poolFee));

      const decimalA = vault.denominationAssetDecimals;
      const decimalB = 18;

      //   console.error(poolFee, decimalB, decimalA);

      const tickerUpperValue = adjustTickToSpacing(tickUpper, tickSpacing);
      const tickerLowerValue = adjustTickToSpacing(tickLower, tickSpacing);

      // Determine token order dynamically
      //   console.log("0x3c499c542cef5e3811e1192ce70d8cc03d5c3359" < vault.mso.address, "token0");
      const token0 =
        vault.denominationAsset < vault.mso.address
          ? vault.denominationAsset
          : vault.mso.address;
      const token1 =
        vault.denominationAsset < vault.mso.address
          ? vault.mso.address
          : vault.denominationAsset;

      const { lpPrice: lpPrice, inverseLPPrice: inversLpprice } =
        calculateLPPrice(Number(vaultPrice), Number(priceRatio));

      //   console.log(lpPrice, inversLpprice,"price of token");

      const price0 = lpPrice;

      // Convert balanceA to number for calculations
      const balanceAFormatted = Number(formatUnits(balanceA, decimalA));

      // Calculate synthetic token amount
      const SyntheticTokenQ = balanceAFormatted / price0;

      const investmentTokenAmount = balanceA;

      const price1 = Number(SyntheticTokenQ) / balanceAFormatted;

      const price = token0 === vault.denominationAsset ? price1 : price0;

      //   console.log(price0, price1, "price of token", token0, token1, vault.denominationAsset, vault.mso.address);

      const decimal0 = token0 === vault.denominationAsset ? decimalA : decimalB;
      const decimal1 = token1 === vault.denominationAsset ? decimalA : decimalB;

      const sqrtPriceX96 = calculateSqrtPriceX96(price, decimal0, decimal1);

      // Prepare values
      const values: LaunchParams = {
        priceRatio,
        poolFee,
        syntheticTokenAmount: parseUnits(SyntheticTokenQ.toString(), 18),
        investmentTokenAmount,
        sqrtPriceX96,
        tickerUpperValue: adjustTickToSpacing(tickUpper, tickSpacing),
        tickerLowerValue: adjustTickToSpacing(tickLower, tickSpacing),
      };

      console.log(values, "computed values");

      setComputedValues(values);
    } catch (error) {
      console.error("Error computing values:", error);
      setComputedValues(null);
    }
  }, [vaultPrice, priceRatio, poolFee, balanceA, vault]);

  // Helper functions
  function calculateSqrtPriceX96(
    price: number,
    decimal0: number,
    decimal1: number
  ): bigint {
    const adjustedPrice = price * 10 ** (decimal1 - decimal0);
    const sqrtPrice = Math.sqrt(adjustedPrice);
    return BigInt(Math.floor(sqrtPrice * 2 ** 96));
  }

  function adjustTickToSpacing(tick: number, tickSpacing: number): number {
    if (tick < 0) {
      return -Math.floor(-tick / tickSpacing) * tickSpacing;
    }
    return Math.floor(tick / tickSpacing) * tickSpacing;
  }

  function getTickSpacingForFee(fee: number): number {
    if (fee === 0.01) return 1;
    if (fee === 0.05) return 10;
    throw new Error("Unsupported fee tier");
  }

  // Helper function to calculate LP price
  function calculateLPPrice(vaultPrice: number, ratio: number) {
    if (ratio <= 0) {
      throw new Error("Ratio must be greater than zero.");
    }

    // Calculate LP price and inverse price
    const lpPrice = vaultPrice / ratio; // Price of the token in stablecoin
    const inverseLPPrice = vaultPrice * ratio; // Price of stablecoin in tokens

    return {
      lpPrice,
      inverseLPPrice,
    };
  }

  const handleLaunchClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    setShowLaunchModal(true);
  };

  return (
    <>
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg p-6 border border-purple-100">
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            Launch Liquidity Pool
          </h2>
        </div>

        <form className="space-y-6">
          {/* Vault Price Display */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price To Match
            </label>
            <div className="relative">
              <div className="flex items-center h-12 px-4 border rounded-lg bg-blue-50 text-blue-700 font-medium">
                {vaultPrice}
                {/* {vault.vault.depositTokenSymbol} */}
              </div>
            </div>
          </div>

          {/* Price Ratio Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Synthetic Token Price Ratio
              <span className="ml-2 text-xs text-gray-500">
                (Set the token’s launch price relative to the vault share. Peg
                enforced by the system after launch)
              </span>
            </label>
            <select
              value={priceRatio}
              disabled={true}
              onChange={(e) => setPriceRatio(e.target.value)}
              className="block w-full h-12 pl-4 pr-10 py-2 text-black border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 rounded-lg transition-colors duration-200"
            >
              <option value="" disabled>
                Select Price Ratio
              </option>
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1} className="py-2">
                  {i + 1}x Price Ratio{" "}
                  <span
                    style={{ fontSize: "10px", color: "gray" }}
                    className="text-xs text-gray-500"
                  >
                    (1 vault share = {i + 1} synthetic tokens)
                  </span>
                </option>
              ))}
            </select>
          </div>

          {/* Pool Fee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pool Fee
              <span className="ml-2 text-xs text-gray-500">
                (Transaction fee percentage)
              </span>
            </label>
            <select
              value={poolFee}
              onChange={(e) => setPoolFee(e.target.value)}
              className="block w-full h-12 pl-4 pr-10 py-2 text-black border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 rounded-lg transition-colors duration-200"
            >
              <option value="" disabled>
                Select Pool Fee
              </option>
              <option value="0.01">0.01% - Best for stable pairs</option>
              <option value="0.05">0.05% - Best for volatile pairs</option>
            </select>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Liquidity Token
            </label>
            <div className="relative">
              <div className="flex items-center h-12 px-4 border rounded-lg bg-blue-50 text-blue-700 font-medium">
                {denominationAssetSymbol} {vault.denominationAsset}
              </div>
            </div>
          </div>

          {/* Balance A Display */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Liquidity
            </label>
            <div className="relative">
              {isLoadingBalance ? (
                <div className="flex items-center space-x-3 h-12 px-4 border rounded-lg bg-gray-50">
                  <Spinner />
                  <span className="text-gray-500">Loading balance...</span>
                </div>
              ) : (
                <div className="flex items-center h-12 px-4 border rounded-lg bg-blue-50 text-blue-700 font-medium">
                  {balanceA
                    ? formatUnits(balanceA, vault.denominationAssetDecimals)
                    : "0"}{" "}
                  {denominationAssetSymbol}
                </div>
              )}
            </div>
          </div>

          {/* Computed Values Display */}
          {computedValues && (
            <div className="mt-6 space-y-4 bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-medium text-gray-900">Computed Parameters</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-gray-500">
                    Synthetic Tokens to Be Minted
                  </label>
                  <div className="font-mono text-gray-900">
                    {Number(
                      formatUnits(
                        computedValues.syntheticTokenAmount as bigint,
                        18
                      )
                    ).toFixed(6)}{" "}
                    {msoSymbol}
                  </div>
                </div>
                <div>
                  <label className="text-gray-500">Available Liquidity</label>
                  <div className="font-mono text-gray-900 flex items-center gap-2">
                    {formatUnits(
                      computedValues.investmentTokenAmount as bigint,
                      vault.denominationAssetDecimals
                    )}
                    <img
                      src={`https://app.enzyme.finance/asset/${chain?.name.toLowerCase()}/${vault.denominationAsset.toLowerCase()}/icon?size=40`}
                      alt="denomination asset"
                      className="w-5 h-5"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-500">Price Sqrt X96</label>
                  <div className="font-mono text-gray-900">
                    {computedValues.sqrtPriceX96
                      ? computedValues.sqrtPriceX96.toString()
                      : "0"}
                  </div>
                </div>
                <div>
                  <label className="text-gray-500">Tick Range</label>
                  <div className="font-mono text-gray-900">
                    {computedValues.tickerLowerValue} to{" "}
                    {computedValues.tickerUpperValue}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Launch Button */}
          <button
            type="button"
            onClick={handleLaunchClick}
            disabled={!computedValues}
            className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg"
          >
            Launch Pool
          </button>

          {showLaunchModal && computedValues && (
            <LaunchTransactionModal
              isOpen={showLaunchModal}
              onClose={() => setShowLaunchModal(false)}
              computedValues={computedValues as LaunchParams}
              msoAddress={vault.mso.address}
              denominationAsset={vault.denominationAsset}
              denominationAssetDecimals={vault.denominationAssetDecimals}
              msoSymbol={msoSymbol}
              denominationAssetSymbol={denominationAssetSymbol}
            />
          )}
        </form>
      </div>
    </>
  );
}
