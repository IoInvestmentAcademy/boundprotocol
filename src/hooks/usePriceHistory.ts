import { useQuery } from "@tanstack/react-query";

interface PriceHistoryData {
  time: number;
  lpPrice: number;
  vaultPrice: string;
}

interface PriceHistoryResponse {
  success: boolean;
  data: PriceHistoryData[];
  metadata: {
    eventId: string;
    lpAddress: string;
    vaultAddress: string;
    msoAddress: string;
    chainId: number;
  };
}

export const usePriceHistory = (msoAddress: string) => {
  return useQuery<PriceHistoryResponse>({
    queryKey: ["priceHistory", msoAddress],
    queryFn: async () => {
      const response = await fetch(
        `https://msoapi.ioinvestment.finance/price-history/${msoAddress}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
