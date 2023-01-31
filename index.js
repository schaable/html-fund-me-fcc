import { ethers } from './ethers-5.6.esm.min.js';
import { abi, contractAddress } from './constants.js';

const connectButton = document.getElementById('connectButton');
const fundButton = document.getElementById('fundButton');
const getBalanceButton = document.getElementById('getBalanceButton');
const withdrawButton = document.getElementById('withdrawButton');

connectButton.addEventListener('click', connect);
fundButton.addEventListener('click', fund);
getBalanceButton.addEventListener('click', getBalance);
withdrawButton.addEventListener('click', withdraw);

async function connect() {
  if (typeof window.ethereum === 'undefined') {
    connectButton.innerHTML = 'Please install Metamask';
    return;
  }

  await window.ethereum.request({ method: 'eth_requestAccounts' });
  connectButton.innerHTML = 'Connected';
}

async function fund() {
  const ethAmount = document.getElementById('ethAmount').value;
  if (typeof window.ethereum !== 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.fund({ value: ethers.utils.parseEther(ethAmount) });
      await listenForTransactionMine(transactionResponse, provider);
      console.log('Done');
    } catch (error) {
      console.log(`Failed with error: `, error);
    }
  }
}

async function getBalance() {
  if (typeof window.ethereum !== 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
  }
}

async function withdraw() {
  if (typeof window.ethereum !== 'undefined') {
    console.log('Withdrawing...');
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
      console.log('Done');
    } catch (error) {
      console.log(`Failed with error: `, error);
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} ${
          transactionReceipt.confirmations > 1 ? 'confirmations' : 'confirmation'
        }...`
      );
      resolve();
    });
  });
}
