// Blockchain service for optional Web3 integration
// This is a demo implementation - in production you'd use actual contract ABIs

interface ContractConfig {
  address: string;
  abi: any[];
}

// Polygon Mumbai Testnet contract configuration
const CONTRACT_CONFIG: ContractConfig = {
  address: "0x7C9B3E6a5D7f5b4F7A6C2E8B3F9D2E7A8B5C4D1F", // Deployed FakeProductVerification.sol on Mumbai
  abi: [
    {
      "inputs": [{"name": "productId", "type": "string"}, {"name": "name", "type": "string"}],
      "name": "addProduct",
      "outputs": [],
      "type": "function"
    },
    {
      "inputs": [{"name": "productId", "type": "string"}],
      "name": "checkProduct",
      "outputs": [{"name": "", "type": "bool"}],
      "type": "function"
    },
    {
      "inputs": [{"name": "productId", "type": "string"}],
      "name": "markAsFake",
      "outputs": [],
      "type": "function"
    }
  ]
};

export async function isWeb3Available(): Promise<boolean> {
  return typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined';
}

export async function connectWallet(): Promise<string | null> {
  if (!await isWeb3Available()) {
    console.log('Web3 not available, using Supabase fallback');
    return null;
  }

  try {
    const { ethers, BrowserProvider } = await import('ethers');
    const provider = new BrowserProvider((window as any).ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    return await signer.getAddress();
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    return null;
  }
}

export async function getContract() {
  if (!await isWeb3Available()) {
    throw new Error('Web3 not available');
  }

  const { ethers, BrowserProvider, Contract } = await import('ethers');
  const provider = new BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  return new Contract(CONTRACT_CONFIG.address, CONTRACT_CONFIG.abi, signer);
}

export async function addProductToBlockchain(productId: string, name: string): Promise<boolean> {
  try {
    const contract = await getContract();
    const tx = await contract.addProduct(productId, name);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Blockchain addProduct failed:', error);
    return false;
  }
}

export async function checkProductOnBlockchain(productId: string): Promise<boolean | null> {
  try {
    const contract = await getContract();
    return await contract.checkProduct(productId);
  } catch (error) {
    console.error('Blockchain checkProduct failed:', error);
    return null;
  }
}

export async function markProductAsFakeOnBlockchain(productId: string): Promise<boolean> {
  try {
    const contract = await getContract();
    const tx = await contract.markAsFake(productId);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Blockchain markAsFake failed:', error);
    return false;
  }
}