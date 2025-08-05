import { useMemo, useState } from "react";
import { Card, Title, AreaChart, Select, SelectItem } from "@tremor/react";
import { usePriceHistory } from "@/hooks/usePriceHistory";
import { Spinner } from "./Spinner";

interface PriceChartsProps {
  msoAddress: string;
  priceRatio: number;
}

type ChartView = "both" | "lp" | "vault";

export const PriceCharts = ({ msoAddress, priceRatio }: PriceChartsProps) => {
  const [selectedView, setSelectedView] = useState<ChartView>("both");
  const [isScaled, setIsScaled] = useState(true);
  const { data, isLoading, error } = usePriceHistory(msoAddress);

  const formattedData = useMemo(() => {
    if (!data?.data) return [];
    return data.data
      .filter((item) => item.lpPrice !== null)
      .map((item) => {
        const lpPrice = Number(item.lpPrice);
        const scaledLpPrice = lpPrice * priceRatio;
        const vaultPrice = Number(item.vaultPrice);
        const displayedLpPrice = isScaled ? scaledLpPrice : lpPrice;
        const priceDiff = ((scaledLpPrice - vaultPrice) / vaultPrice) * 100;

        return {
          date: new Date(item.time).toLocaleString(),
          BNDT: displayedLpPrice.toFixed(6),
          sBNDT: vaultPrice.toFixed(6),
          "Price Difference": `${priceDiff.toFixed(2)}%`,
        };
      });
  }, [data, priceRatio, isScaled]);

  const getCategories = () => {
    switch (selectedView) {
      case "lp":
        return ["BNDT"];
      case "vault":
        return ["sBNDT"];
      default:
        return ["BNDT", "sBNDT"];
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Error loading price history
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <Title className="text-xl font-semibold text-gray-900">
              Price History Comparison
            </Title>
            <div className="flex items-center space-x-4">
              {/* <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Scale LP Price</span>
                <button
                  onClick={() => setIsScaled(!isScaled)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full
                    transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                    ${isScaled ? "bg-indigo-600" : "bg-gray-200"}
                  `}
                >
                  <span
                    className={`
                      ${isScaled ? "translate-x-6" : "translate-x-1"}
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    `}
                  />
                </button>
              </div> */}
              <div className="w-48">
                <Select
                  value={selectedView}
                  onValueChange={(value) => setSelectedView(value as ChartView)}
                  className="mt-2"
                >
                  <SelectItem value="both">Both Prices</SelectItem>
                  <SelectItem value="lp">BNDT Only</SelectItem>
                  <SelectItem value="vault">sBNDT Only</SelectItem>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <AreaChart
            className="h-[400px] mt-4"
            data={formattedData}
            index="date"
            categories={getCategories()}
            colors={["indigo", "purple"]}
            valueFormatter={(number) => `$${number}`}
            showLegend={true}
            showGridLines={true}
            showYAxis={true}
            showXAxis={true}
            curveType="monotone"
            customTooltip={({ payload }) => {
              if (!payload?.[0]?.payload) return null;
              const data = payload[0].payload;
              return (
                <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500">{data.date}</div>
                  {payload.map((entry: any, index: number) => (
                    <div
                      key={index}
                      className="text-sm font-medium"
                      style={{ color: entry.color }}
                    >
                      {entry.name}: ${entry.value}
                      {entry.name === "LP Price" && (
                        <div className="text-xs text-gray-500">
                          {/* {isScaled ? (
                            <>Raw Price: ${data["Raw LP Price"]}</>
                          ) : (
                            <>Scaled Price: ${data["Scaled LP Price"]}</>
                          )} */}
                        </div>
                      )}
                    </div>
                  ))}
                  {selectedView === "both" && (
                    <div className="text-sm font-medium text-gray-700 mt-1">
                      Difference: {data["Price Difference"]}
                    </div>
                  )}
                </div>
              );
            }}
          />
        </div>
      </Card>
    </div>
  );
};
