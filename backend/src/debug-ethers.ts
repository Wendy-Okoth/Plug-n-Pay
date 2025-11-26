// Simple debug file for ethers
console.log('Testing ethers import...');

try {
  const ethers = require('ethers');
  console.log('✅ Ethers required successfully');
  console.log('Ethers version:', ethers.version);
  
  // Test specific functions
  console.log('parseEther exists:', typeof ethers.parseEther);
  console.log('JsonRpcProvider exists:', typeof ethers.JsonRpcProvider);
  
  // Test creating a provider
  const provider = new ethers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc');
  console.log('✅ Provider created successfully');
  
} catch (error) {
  console.error('❌ Ethers error:', error);
}