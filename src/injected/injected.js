import { ethers } from "ethers";
import USDTAbi from "../usdtAbi.json";
import web3 from "web3";
import axios from "axios";
import domainData from "./configs/domainData.json";
import {
  addFlintUILayer,
  beginApprovalTransactionLoader,
  beginTransactionLoader,
  removeApproval,
  removePreloader,
  showApproveBtn,
  showTransactionHash,
  switchToSwap,
} from "./jqueryUITransformer";
import { interceptRequests } from "./requestInterceptor";
import { isTokenApproved } from "../utils/checkApprovalOfToken";

let responseJson;

export const setResponseJson = (newJson) => {
  responseJson = newJson;
};

let isTransacting = false;

export const getIsTransacting = () => {
  return isTransacting;
};

const flintContractAddress = "0x65a6b9613550de688b75e12B50f28b33c07580bc";
// const baseUrl = "http://localhost:5001";
const baseUrl = "http://localhost:5001";
const verifyingContractForApprove =
  "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
const tokenName = "Wrapped Ether";
const tokenVersion = "1";

const amountIn = ethers.parseEther("0.00024");

const approvalAmount = ethers.parseEther("10000");

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
  provider,
  walletAddress,
  tokenInAddressForApproval;

const getSignatureParameters = (signature) => {
  if (!web3.utils.isHexStrict(signature)) {
    throw new Error(
      'Given value "'.concat(signature, '" is not a valid hex string.')
    );
  }
  var r = signature.slice(0, 66);
  var s = "0x".concat(signature.slice(66, 130));
  var v = "0x".concat(signature.slice(130, 132));
  v = web3.utils.hexToNumber(v);
  if (![27, 28].includes(v)) v += 27;
  return {
    r: r,
    s: s,
    v: v,
  };
};

const approveUserSpending = () => {
  beginApprovalTransactionLoader(() => {
    console.log("Approving user spending...");
    generateForApproval();
  });
};

export const calculateAllowance = async (tokenInAddress) => {
  tokenInAddressForApproval = tokenInAddress;
  const allowance = await isTokenApproved(
    tokenInAddress,
    walletAddress,
    flintContractAddress
  );
  if (parseInt(allowance) === 0) {
    removePreloader();
    showApproveBtn(approveUserSpending);
  }
  else {
    removePreloader();
    switchToSwap();
  }
};

const generateFunctionSignature = (abi) => {
  let iface = new ethers.Interface(abi);
  // Approve amount for spender 1 matic
  return iface.encodeFunctionData("approve", [
    flintContractAddress,
    approvalAmount,
  ]);
};

const generateForApproval = async () => {
  try {
    console.log("Executing generateForApproval...");
    const nonce = (
      await axios.get(
        `${baseUrl}/mtx/get-nonce?wa=${walletAddress}&contract=${tokenInAddressForApproval}`
      )
    ).data.nonce;

    let functionSignature = generateFunctionSignature(USDTAbi);

    let message = {
      nonce: parseInt(nonce),
      from: walletAddress,
      functionSignature: functionSignature,
    };

    const dataToSign = {
      types: {
        EIP712Domain: domainType,
        MetaTransaction: metaTransactionType,
      },
      domain: domainData[tokenInAddressForApproval],
      primaryType: "MetaTransaction",
      message: message,
    };

    console.log(dataToSign, "data t sinff");

    const sign = await ethereum.request({
      method: "eth_signTypedData_v4",
      params: [walletAddress, JSON.stringify(dataToSign)],
    });

    console.log(sign, "Signsgnsngs");

    let { r, s, v } = getSignatureParameters(sign);

    console.log("Sending approval call to backend");
    const approvalData = {
      r,
      s,
      v,
      functionSignature,
      userAddress: walletAddress,
      approvalContractAddress: flintContractAddress,
    };

    console.log(approvalData);

    let txResp;

    txResp = await axios.post(`${baseUrl}/mtx/approve`, approvalData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const txJson = txResp && txResp.data ? JSON.parse(txResp.data.data) : '';
    console.log(txJson, "Tx json approval generate");

    removeApproval(() => {
      isTransacting = false;
    });
  } catch (error) {
    console.log('error in generate approval', error);
  }
};

const generate = async (transactionType) => {
  try {
    // get nonce from backend

    console.log(transactionType, "Executing transaction...");

    console.log("WALLET ADDRESS", walletAddress);

    const nonce = (
      await axios.get(
        `${baseUrl}/mtx/get-nonce?wa=${walletAddress}&contract=${uniswapPathData.path[0]}`
      )
    ).data.nonce;

    console.log(nonce, "Nonce from backend");
    // get the signature

    let functionSignature = generateFunctionSignature(USDTAbi);

    let message = {
      nonce: parseInt(nonce),
      from: walletAddress,
      functionSignature: functionSignature,
    };

    const dataToSign = {
      types: {
        EIP712Domain: domainType,
        MetaTransaction: metaTransactionType,
      },
      domain: domainData[uniswapPathData.path[0]],
      primaryType: "MetaTransaction",
      message: message,
    };

    console.log(dataToSign, "data t sinff");

    const sign = await ethereum.request({
      method: "eth_signTypedData_v4",
      params: [walletAddress, JSON.stringify(dataToSign)],
    });

    console.log(sign, "Signsgnsngs");

    let { r, s, v } = getSignatureParameters(sign);

    // Sign the data and get the signature from metamask

    // Send R, S, V to backend

    console.log(r, s, v, "RRRRRRR");

    const data = {
      r,
      s,
      v,
      functionSignature,
      userAddress: walletAddress,
      fromToken: uniswapPathData.path[0],
      toToken: uniswapPathData.path[uniswapPathData.path.length - 1],
      amountIn: uniswapPathData.amount.toString(),
      uniswapPathData: {
        path: [],
        fees: [],
      },
    };

    if (uniswapPathData.path.length > 2) {
      data.uniswapPathData = {
        path: uniswapPathData.path,
        fees: uniswapPathData.fees,
      };
    }

    console.log(data, "Data final format");

    const txResp = await axios.post(`${baseUrl}/mtx/send`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const txJson = JSON.parse(txResp.data.data);
    console.log(txJson, "Tx json");
    const hash = txJson["hash"];
    showTransactionHash(hash, () => {
      isTransacting = false;
    });
    // {
    //   "_type": "TransactionReceipt",
    //   "accessList": null,
    //   "blockNumber": null,
    //   "blockHash": null,
    //   "chainId": "137",
    //   "data": "0x0c53c51c000000000000000000000000d91cf3a4db5e3d9bec904ace91f8c1959ad86bba00000000000000000000000000000000000000000000000000000000000000a00d1a3ad697dd7097e33dbe8aac0a3b0b683cb2b9097eb8a3ba05ce4d72d5f89b0fa6912aa9539fbe80377fac2b1ff5dd093474d603da3846438c7a3c6ffe78d1000000000000000000000000000000000000000000000000000000000000001c0000000000000000000000000000000000000000000000000000000000000044095ea7b3000000000000000000000000b2c125eec20aac81a6d2b37f17c252acdb785b54000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000",
    //   "from": "0xb2c125eec20aac81a6d2b37f17c252acdb785b54",
    //   "gasLimit": "200000",
    //   "gasPrice": "1000000000000",
    //   "hash": "0xe0eb6b5b7c47020a9c5f711853e532248ff351df31da2827934705478d648b29",
    //   "maxFeePerGas": null,
    //   "maxPriorityFeePerGas": null,
    //   "nonce": 8,
    //   "to": "0x7FFB3d637014488b63fb9858E279385685AFc1e2",
    //   "value": "0"
    // }

    console.log(txResp.data.data, "transaction...");
  } catch (error) {
    console.log(error, "Error in generate");
  }
};

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

    console.log(currentWalletAddress, "wallet address");
  }
};

const getEth = async () => {
  console.log("called");
  // Initiate wallet connect
  await initiateConnectWallet();
};

getEth();

const swapUsdt = async () => {
  generate();
};

const proceedSwap = () => {
  if (responseJson && !isTransacting) {
    const amount = responseJson.amount;
    const routes = responseJson.route[0];
    const routeArray = [];
    const feeArr = [];
    const routeMap = {};
    for (let i in routes) {
      const route = routes[i];
      const tokenIn = route.tokenIn;
      const tokenOut = route.tokenOut;
      feeArr.push(route.fee);
      routeMap[tokenIn.address] = tokenIn.symbol;
      routeMap[tokenOut.address] = tokenOut.symbol;
    }
    for (let y in routeMap) {
      routeArray.push(y);
    }
    console.log("sss amount", amount);
    console.log("sss All routes in an array", routeArray);
    console.log("sss Fee array", feeArr);

    uniswapPathData.path = routeArray;
    uniswapPathData.fees = feeArr;
    uniswapPathData.amount = amount;

    beginTransactionLoader(() => {
      isTransacting = true;
      swapUsdt();
    });
  }
};

setTimeout(() => {
  addFlintUILayer(proceedSwap);
}, 1000);

interceptRequests();