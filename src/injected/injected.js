import { ethers } from "ethers";
import USDTAbi from "../usdtAbi.json";
import axios from "axios";
import domainData from "./configs/domainData.json";
import {
  addFlintUILayer,
} from "./jqueryUITransformer";
import { interceptRequests } from "./requestInterceptor";
import { setWalletAddress, buttonClick } from "./flintButtonState";

let responseJson;

export const setResponseJson = (newJson) => {
  responseJson = newJson;
};

let isTransacting = false;
let isCalculatingApproval = false;

const baseUrl = "http://localhost:5001";

// Uniswap path data
let uniswapPathData = {
  path: [],
  fees: [],
  amount: 0,
};

const domainType = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "verifyingContract", type: "address" },
  { name: "salt", type: "bytes32" },
];

const metaTransactionType = [
  { name: "nonce", type: "uint256" },
  { name: "from", type: "address" },
  { name: "functionSignature", type: "bytes" },
];

let signer = null,
  walletAddress;

const initiateConnectWallet = async () => {
  console.log("Runnuing iniititaitse", window.ethereum);
  if (window.ethereum === null) {
    // If MetaMask is not installed, we use the default provider,
    // which is backed by a variety of third-party services (such
    // as INFURA). They do not have private keys installed so are
    // only have read-only access
    console.log("MetaMask not installed; using read-only defaults");
    // provider = ethers.getDefaultProvider();
  } else {
    console.log("ch 1");
    const provider = new ethers.BrowserProvider(window.ethereum);
    console.log("ch 2", provider);
    signer = await provider.getSigner();
    console.log("ch 3", signer);
    console.log(signer.address, "Sginerfer");
    const currentWalletAddress = signer.address;
    walletAddress = currentWalletAddress;
    setWalletAddress(walletAddress);

    console.log(currentWalletAddress, "wallet address");
  }
};

const getEth = async () => {
  console.log("called");
  // Initiate wallet connect
  await initiateConnectWallet();
};

getEth();

const attachUI = (i) => {
  console.log("INSIDE ATTACH UI");
  if (i <= 100) {
    console.log("THIS IS I - ", i);
    setTimeout(() => {
      const len = addFlintUILayer(buttonClick);
      if (len === 0) {
        attachUI(i + 1);
      }
    }, 50);
  }
};

attachUI(0);

interceptRequests();
