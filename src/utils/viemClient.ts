import { createPublicClient, http, Chain, webSocket, PublicClient } from "viem";
import { mainnet, polygon } from "viem/chains";

const INFURA_API_KEY = process.env.NEXT_PUBLIC_INFURA_API_KEY;
console.log(INFURA_API_KEY, "INFURA_API_KEY");

const InfuraApiKey = process.env.NEXT_PUBLIC_INFURA_API_KEY;
const AlchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
// make the endpoint dynamic based on the chain

const baseChain: Chain = {
  id: 8453,
  name: "Base",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [`https://base-mainnet.infura.io/v3/${InfuraApiKey}` as string],
    },
    public: {
      http: [`https://base-mainnet.infura.io/v3/${InfuraApiKey}` as string],
    },
  },
} as const;

const getEndpointInfura = (chainId: number) => {
  switch (chainId) {
    case 1:
      return `https://mainnet.infura.io/v3/${InfuraApiKey}`;
    case 137:
      return `https://polygon-mainnet.infura.io/v3/${InfuraApiKey}`;
    case 56:
      return `https://bsc-dataseed.binance.org/`;
    case 8453:
      return `https://base-mainnet.infura.io/v3/${InfuraApiKey}`;
    case 31337:
      return `http://127.0.0.1:8545/`;
  }
};

const getEndpointAlchemy = (chainId: number) => {
  switch (chainId) {
    case 1:
      return `https://eth-mainnet.g.alchemy.com/v2/${AlchemyApiKey}`;
    case 137:
      return `https://polygon-mainnet.g.alchemy.com/v2/${AlchemyApiKey}`;
    case 56:
      return `https://bsc-mainnet.g.alchemy.com/v2/${AlchemyApiKey}`;
    case 8453:
      return `https://base-mainnet.g.alchemy.com/v2/${AlchemyApiKey}`;
    case 31337:
      return `http://127.0.0.1:8545/`;
  }
};

const getWebSocketEndpointAlchemy = (chainId: number) => {
  switch (chainId) {
    case 1:
      return `wss://eth-mainnet.g.alchemy.com/v2/${AlchemyApiKey}`;
    case 137:
      return `wss://polygon-mainnet.g.alchemy.com/v2/${AlchemyApiKey}`;
    case 56:
      return `wss://bsc-mainnet.g.alchemy.com/v2/${AlchemyApiKey}`;
    case 8453:
      return `wss://base-mainnet.g.alchemy.com/v2/${AlchemyApiKey}`;
    case 31337:
      return `ws://127.0.0.1:8545/`;
  }
};

const getWebSocketEndpointInfura = (chainId: number) => {
  switch (chainId) {
    case 1:
      return `wss://mainnet.infura.io/ws/v3/${InfuraApiKey}`;
    case 137:
      return `wss://polygon-mainnet.infura.io/ws/v3/${InfuraApiKey}`;
    case 56:
      return `wss://bsc-dataseed.binance.org/ws`;
    case 8453:
      return `wss://base-mainnet.infura.io/ws/v3/${InfuraApiKey}`;
    case 31337:
      return `ws://127.0.0.1:8545/`;
  }
};

// function to get rpc url by chain id
export function getRpcUrl(chainId: number) {
  console.log(chainId, "chainIddddddddddddd");
  switch (chainId) {
    case 1:
      return getEndpointInfura(chainId);
    case 137:
      return getEndpointInfura(chainId);
    case 8453:
      return getEndpointInfura(chainId);
    case 31337:
      return "http://127.0.0.1:8545";
    default:
      throw new Error("Unsupported chain");
  }
}

export function getViemClient(chainId: number, useWebSocket: boolean = true) {
  let chain: Chain;
  let rpcUrl: string;
  let useWss: boolean;
  let wssUrl: string;

  switch (chainId) {
    case 1: // Ethereum Mainnet
      chain = mainnet;
      rpcUrl = getEndpointInfura(chainId) as string;
      useWss = useWebSocket;
      wssUrl = getWebSocketEndpointAlchemy(chainId) as string;
      break;
    case 137: // Polygon Mainnet
      chain = polygon;
      rpcUrl = getEndpointInfura(chainId) as string;
      useWss = useWebSocket;
      wssUrl = getWebSocketEndpointAlchemy(chainId) as string;
      break;
    case 8453:
      chain = baseChain;
      rpcUrl = getEndpointInfura(chainId) as string;
      useWss = useWebSocket;
      wssUrl = getWebSocketEndpointAlchemy(chainId) as string;
      break;
    case 31337:
      chain = baseChain;
      rpcUrl = "http://127.0.0.1:8545";
      useWss = useWebSocket;
      wssUrl = "ws://127.0.0.1:8545";
      break;
    default:
      throw new Error("Unsupported chain");
  }

  return createPublicClient({
    chain,
    transport: useWebSocket ? webSocket(wssUrl) : http(rpcUrl),
  });
}
