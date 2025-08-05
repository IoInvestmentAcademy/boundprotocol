interface LPInfo {
  address: string | null;
  decimals: number | null;
  token0: string | null;
  token1: string | null;
  token0Decimals: number | null;
  token1Decimals: number | null;
}

export interface PriceData {
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

interface VaultInfo {
  address: string;
  decimals: number;
}

interface MSOInfo {
  address: string;
  decimals: number;
}

export interface VaultDeployment {
  id: string;
  chainId: number;
  lp: LPInfo;
  vault: VaultInfo;
  mso: MSOInfo;
  denominationAsset: string;
  denominationAssetDecimals: number;
  accessor: string;
  launched: boolean;
  isPrivate: boolean;
  active: boolean;
}
