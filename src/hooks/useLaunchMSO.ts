import { useCallback } from 'react';
import axios from 'axios';
import { useWallet } from '@/context/WalletContext';
import { MSO_ABI } from '@/hooks/abi/MSO_ABI';
import { getViemClient } from '@/utils/viemClient';
import { ethers } from 'ethers';
import { parseAbiItem } from 'viem';
import { splitSignature } from '@/utils/signature';

interface LaunchParams {
  syntheticTokenAmount: bigint;
  investmentTokenAmount: bigint;
  sqrtPriceX96: bigint;
  poolFee: string;
  priceRatio: string;
  tickerUpperValue: number;
  tickerLowerValue: number;
}

export function useLaunchMSO(msoAddress: string) {
  const { provider, account, chainId } = useWallet();

  const getSignedMessage = async (params: LaunchParams) => {
    try {
      const response = await axios.post('https://msoapi.ioinvestment.finance/sign-launch', {
        syntheticTokenAmount: params.syntheticTokenAmount.toString(),
        investmentTokenAmount: params.investmentTokenAmount.toString(),
        sqrtPriceX96: params.sqrtPriceX96.toString(),
        poolFee: params.poolFee,
        tickerUpperValue: params.tickerUpperValue,
        tickerLowerValue: params.tickerLowerValue
      });

      if (!response.data.signature) {
        throw new Error("Invalid signature received from server");
      }

      // Split the signature
      return splitSignature(response.data.signature);
    } catch (error) {
      console.error('Error getting signed message:', error);
      throw new Error('Failed to get signed message');
    }
  };

  const simulateLaunch = async (params: LaunchParams, signature: { r: string; s: string; v: number }) => {
    if (!chainId) throw new Error('Chain ID not found');
    if (!account) throw new Error('Account not found');
    
    const publicClient = getViemClient(chainId);

    try {
      console.log('Simulation params:', {
        address: msoAddress,
        params,
        signature,
        account
      });

      const result = await publicClient.simulateContract({
        address: msoAddress as `0x${string}`,
        abi: MSO_ABI,
        functionName: 'launchMSO',
        account: account as `0x${string}`,
        args: [
          params.syntheticTokenAmount,
          params.investmentTokenAmount,
          params.sqrtPriceX96,
          Number(params.poolFee),
          Number(params.priceRatio),
          Number(params.tickerUpperValue),
          Number(params.tickerLowerValue),
          signature.r as `0x${string}`,
          signature.s as `0x${string}`,
          signature.v
        ]
      });

      return result;
    } catch (error) {
      console.error('Simulation error:', error);
      throw new Error('Transaction simulation failed');
    }
  };

  const executeLaunch = async (params: LaunchParams, signature: { r: string; s: string; v: number }) => {
    if (!provider || !account) throw new Error('Wallet not connected');

    const signer = await provider.getSigner();
    const msoContract = new ethers.Contract(msoAddress, MSO_ABI, signer);

    const tx = await msoContract.launchMSO(
      params.syntheticTokenAmount,
      params.investmentTokenAmount,
      params.sqrtPriceX96,
      params.poolFee,
      params.priceRatio,
      params.tickerUpperValue,
      params.tickerLowerValue,
      signature.r,
      signature.s,
      signature.v
    );

    return tx.wait();
  };

  return { getSignedMessage, simulateLaunch, executeLaunch };
} 