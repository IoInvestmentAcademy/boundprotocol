import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { MSO_ABI } from '@/hooks/abi/MSO_ABI';
import { useWallet } from '@/context/WalletContext';

interface VerificationResult {
  isVerified: boolean;
  tokenName?: string;
  tokenSymbol?: string;
  softCap?: string;
  owner?: string;
  denominationAsset?: string;
  launchWaitingPeriod?: string;
  error?: string;
  isLoading: boolean;
}

export function useMSOVerification(msoAddress: string | undefined) {
  const { provider } = useWallet();
  const [verificationResult, setVerificationResult] = useState<VerificationResult>({
    isVerified: false,
    isLoading: true
  });

  useEffect(() => {
    const verifyMSO = async () => {
      if (!provider || !msoAddress || !ethers.isAddress(msoAddress)) {
        setVerificationResult({
          isVerified: false,
          error: "Invalid MSO address",
          isLoading: false
        });
        return;
      }

      try {
        const msoContract = new ethers.Contract(msoAddress, MSO_ABI, provider);

        // Verify contract existence and interface
        const code = await provider.getCode(msoAddress);
        if (code === '0x') {
          throw new Error('No contract found at this address');
        }

        // Fetch contract details
        const [
          tokenName,
          tokenSymbol,
          softCap,
          owner,
          denominationAsset,
          launchWaitingPeriod
        ] = await Promise.all([
          msoContract.name(),
          msoContract.symbol(),
          msoContract.softCap(),
          msoContract.owner(),
          msoContract.denominationAsset(),
          msoContract.launchWaitingPeriod()
        ]);

        // Format values
        const formattedSoftCap = ethers.formatUnits(softCap, 6); // Assuming USDC decimals

        setVerificationResult({
          isVerified: true,
          tokenName,
          tokenSymbol,
          softCap: formattedSoftCap,
          owner,
          denominationAsset,
          launchWaitingPeriod: launchWaitingPeriod.toString(),
          isLoading: false
        });

      } catch (error: any) {
        setVerificationResult({
          isVerified: false,
          error: error.message || 'Failed to verify MSO contract',
          isLoading: false
        });
      }
    };

    verifyMSO();
  }, [provider, msoAddress]);

  return verificationResult;
} 