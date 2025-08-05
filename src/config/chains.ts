export const SUPPORTED_CHAINS = [
  {
    id: 1,
    name: "Ethereum",
    icon: "🔷",
    currency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrl: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
  },
  {
    id: 137,
    name: "Polygon",
    icon: "💜",
    currency: {
      name: "Polygon",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrl: `https://polygon-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
  },
] as const;

export type ChainId = (typeof SUPPORTED_CHAINS)[number]["id"];
