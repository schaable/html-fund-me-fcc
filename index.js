import { ethers } from './ethers-5.2.esm.min.js';
import { abi, contractAddress } from './constants.js';

const connectButton = document.getElementById('connectButton');
const fundButton = document.getElementById('fundButton');

connectButton.addEventListener('click', connect);
fundButton.addEventListener('click', fund);

async function connect() {
  if (typeof window.ethereum === 'undefined') {
    connectButton.innerHTML = 'Please install metamask';
    return;
  }

  await window.ethereum.request({ method: 'eth_requestAccounts' });
  connectButton.innerHTML = 'Connected';
}

async function fund() {
  const ethAmount = '0.04';
  if (typeof window.ethereum !== 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.fund({ value: ethers.utils.parseEther(ethAmount) });
      await listenForTransactionMine(transactionResponse, provider);
      console.log('Done');
    } catch (error) {
      console.log(error);
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(`Completed with ${transactionReceipt.confirmations}...`);
      resolve();
    });
  });
}
