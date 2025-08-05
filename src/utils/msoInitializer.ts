import { ethers } from 'ethers';
import { IVault } from '@/hooks/abi/IVault';
import { MSO_ABI } from '@/hooks/abi/MSO_ABI';

interface MSOInitParams {
  vaultAddress: string;
  fundAddress: string;
  softCap: string;
  launchWaitingPeriod: number;
  tokenName: string;
  tokenSymbol: string;
}

export async function initializeMSO({
  vaultAddress,
  fundAddress,
  softCap,
  launchWaitingPeriod,
  tokenName,
  tokenSymbol
}: MSOInitParams) {
  try {
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    
    // Get vault contract and owner
    const vaultContract = new ethers.Contract(vaultAddress, IVault, provider);
    const vaultOwner = await vaultContract.getOwner();
    
    console.log("Vault Owner:", vaultOwner);

    // Set balance for vault owner before impersonating
    await provider.send("hardhat_setBalance", [
      vaultOwner,
      "0x1000000000000000000" // 1 ETH in hex
    ]);

    // Impersonate vault owner
    await provider.send("hardhat_impersonateAccount", [vaultOwner]);
    const vaultOwnerSigner = await provider.getSigner(vaultOwner);

    // Get the initializer contract
    const initAddress = "0x376Cff03f76fa4b7dC5a68869Ec62DEd339c0f34";

    
    return { success: true, msoAddress: initAddress };
  } catch (error) {
    console.error('Error initializing MSO:', error);
    return { success: false, error };
  }
} 