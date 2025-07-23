// lib/blockchainService.ts
// Blockchain service for optional Web3 integration with Polygon Amoy testnet
// This is a demo implementation - in production you'd use actual contract ABIs

import { ethers } from "ethers"; // Ensure ethers is imported

interface ContractConfig {
  address: string;
  abi: any[];
}

// IMPORTANT: Replaced with your deployed contract address after deploying FakeProductVerification.sol on Amoy.
const CONTRACT_ADDRESS = "0x66111Ea7f29af5eD9530276f24F0057C68112886";

// IMPORTANT: Pasted the FULL ABI from Remix after deploying your contract.
const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_productId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			}
		],
		"name": "addProduct",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_productId",
				"type": "string"
			}
		],
		"name": "markAsFake",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "productId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "manufacturer",
				"type": "address"
			}
		],
		"name": "ProductAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "productId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isFake",
				"type": "bool"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "admin",
				"type": "address"
			}
		],
		"name": "ProductStatusUpdated",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "productExists",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "products",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "isFake",
				"type": "bool"
			},
			{
				"internalType": "address",
				"name": "manufacturer",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_productId",
				"type": "string"
			}
		],
		"name": "verifyProduct",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "isFake",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];


/**
 * @dev Checks if Web3 (MetaMask) is available in the browser.
 * @returns {Promise<boolean>} True if Web3 is available, false otherwise.
 */
export async function isWeb3Available(): Promise<boolean> {
  return typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined';
}

/**
 * @dev Connects to the user's MetaMask wallet and returns the connected account address.
 * @returns {Promise<string | null>} The connected account address or null if connection fails.
 */
export async function connectWallet(): Promise<string | null> {
  if (!await isWeb3Available()) {
    console.warn('⚠️ Web3 not available for wallet connection.');
    return null;
  }

  try {
    const { ethers, BrowserProvider } = await import('ethers');
    const provider = new BrowserProvider((window as any).ethereum);
    // Request account access if not already granted
    const accounts = await provider.send("eth_requestAccounts", []);
    if (accounts.length === 0) {
      console.warn('⚠️ No accounts found or user rejected connection.');
      return null;
    }
    const signer = await provider.getSigner();
    return await signer.getAddress();
  } catch (error) {
    console.error('❌ Failed to connect wallet:', error);
    // User might have rejected connection or other error occurred
    return null;
  }
}

/**
 * @dev Returns an ethers.js Contract instance connected to the deployed contract.
 * It attempts to get a provider and then a signer from it.
 * @returns {Promise<ethers.Contract | null>} The Contract instance or null if Web3 is not available or connection fails.
 */
export async function getContract(): Promise<ethers.Contract | null> {
  if (!await isWeb3Available()) {
    console.warn('⚠️ Web3 not available, cannot get contract instance.');
    return null;
  }

  try {
    const { ethers, BrowserProvider, Contract } = await import('ethers');
    const provider = new BrowserProvider((window as any).ethereum);
    // We don't call eth_requestAccounts here directly to allow silent fallback
    // The signer will prompt if a transaction is initiated and no account is connected.
    const signer = await provider.getSigner();
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  } catch (error) {
    console.error('❌ Error getting contract signer (MetaMask might not be connected):', error);
    return null;
  }
}

/**
 * @dev Adds a new product to the blockchain.
 * This function requires a MetaMask transaction.
 * @param {string} productId The unique ID of the product.
 * @param {string} name The name of the product.
 * @returns {Promise<ethers.ContractTransaction>} The transaction response.
 * @throws {Error} If MetaMask is not connected or transaction fails (e.g., user rejection).
 */
export async function addProductToBlockchain(productId: string, name: string): Promise<ethers.ContractTransaction> {
  const contract = await getContract();
  if (!contract) {
    throw new Error("MetaMask not connected or contract instance not available.");
  }
  try {
    const tx = await contract.addProduct(productId, name);
    console.log("✅ Blockchain transaction sent for addProduct:", tx.hash);
    await tx.wait(); // Wait for the transaction to be mined
    console.log("✅ Transaction confirmed:", tx.hash);
    return tx;
  } catch (error: any) {
    console.error("❌ Blockchain addProduct failed:", error);
    if (error.code === 4001) { // User rejected transaction
      throw new Error("Transaction rejected by user.");
    }
    throw new Error(`Failed to add product to blockchain: ${error.message || error}`);
  }
}

/**
 * @dev Checks the authenticity of a product on the blockchain.
 * This is a view function and does not require a transaction.
 * @param {string} productId The unique ID of the product.
 * @returns {Promise<{ name: string, is_fake: boolean } | null>} The product name and its fake status, or null if not found/error.
 * @throws {Error} If verification fails (excluding MetaMask not connected, which results in null).
 */
export async function checkProductOnBlockchain(productId: string): Promise<{ name: string, is_fake: boolean } | null> {
  const contract = await getContract();
  if (!contract) {
    // If contract is null, it means MetaMask is not connected,
    // which is a silent fallback scenario for verification.
    return null;
  }
  try {
    const [name, isFake] = await contract.verifyProduct(productId);
    console.log(`✅ Blockchain verification for ${productId}: Name: ${name}, Is Fake: ${isFake}`);
    return { name, is_fake: isFake };
  } catch (error: any) {
    console.error("❌ Blockchain verifyProduct failed:", error);
    // If the product doesn't exist on-chain, or other contract error
    // We return null to indicate it wasn't found on blockchain, triggering Supabase fallback.
    return null;
  }
}

/**
 * @dev Marks a product as fake on the blockchain.
 * This function requires a MetaMask transaction.
 * @param {string} productId The unique ID of the product to mark as fake.
 * @returns {Promise<ethers.ContractTransaction>} The transaction response.
 * @throws {Error} If MetaMask is not connected or transaction fails (e.g., user rejection).
 */
export async function markProductAsFakeOnBlockchain(productId: string): Promise<ethers.ContractTransaction> {
  const contract = await getContract();
  if (!contract) {
    throw new Error("MetaMask not connected or contract instance not available.");
  }
  try {
    const tx = await contract.markAsFake(productId);
    console.log("✅ Blockchain transaction sent for markAsFake:", tx.hash);
    await tx.wait(); // Wait for the transaction to be mined
    console.log("✅ Transaction confirmed:", tx.hash);
    return tx;
  } catch (error: any) {
    console.error("❌ Blockchain markAsFake failed:", error);
    if (error.code === 4001) { // User rejected transaction
      throw new Error("Transaction rejected by user.");
    }
    throw new Error(`Failed to mark product as fake on blockchain: ${error.message || error}`);
  }
}
