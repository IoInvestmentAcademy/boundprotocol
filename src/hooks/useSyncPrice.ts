import { useMutation } from '@tanstack/react-query';

export function useSyncPrice() {
  const syncPriceMutation = useMutation({
    mutationFn: async ({ 
      projectedPrice,
      token0Reserve,
      token1Reserve,
      msoAddress,
      Token0,
      priceRatio
    }: { 
      projectedPrice: string;
      token0Reserve: string;
      token1Reserve: string;
      msoAddress: string;
      Token0: string;
      priceRatio: number;
    }) => {
      const tokenReserve = msoAddress == Token0 ? token0Reserve : token1Reserve;
      const constant = Number(token0Reserve) * Number(token1Reserve);
      const newToken1Amount = Math.sqrt(constant / Number(projectedPrice));
      const syntheticTokenDifference = newToken1Amount - Number(tokenReserve);

      console.log(syntheticTokenDifference, newToken1Amount, "amount to sync");

      const response = await fetch('http://localhost:3012/sync/price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          Token0: Token0,
          priceRatioCurrent: priceRatio,   
          amountToSync: syntheticTokenDifference.toString()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Sync price failed');
      }
      
      return response.json();
    }
  });

  return {
    syncPrice: syncPriceMutation.mutate,
    isSyncing: syncPriceMutation.isPending,
    syncError: syncPriceMutation.error
  };
} 