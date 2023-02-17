import { ethers } from "ethers";
import USDTAbi from "./usdtAbi.json";
import web3 from "web3";
import axios from "axios";
import $ from "jquery";
import domainData from "./domainData.json";

let responseJson;
let parent;
let parentFlint;

let isTransacting = false;

const flintContractAddress = "0x65a6b9613550de688b75e12B50f28b33c07580bc";
// const baseUrl = "http://localhost:5001";
const baseUrl = "https://mtx.flint.money";
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
  walletAddress;

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

const generateFunctionSignature = (abi) => {
  let iface = new ethers.Interface(abi);
  // Approve amount for spender 1 matic
  return iface.encodeFunctionData("approve", [
    flintContractAddress,
    approvalAmount,
  ]);
};

const generate = async () => {
  try {
    // get nonce from backend

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

    $("#flint-swap").html('Swap')
    $("#flint-swap").toggleClass('button--loading')
    isTransacting = false
    enableButton()
    parent.parent().append(`<a class="fn-lk-sc" target="_blank" href="https://polygonscan.com/tx/${hash}"><p style="margin: 0 5px 0 0; color: rgb(130, 71, 229);">Check transaction status on Polygon Scan</p>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px" fill="rgb(130, 71, 229)">
  <path d="M 5 3 C 3.9069372 3 3 3.9069372 3 5 L 3 19 C 3 20.093063 3.9069372 21 5 21 L 19 21 C 20.093063 21 21 20.093063 21 19 L 21 12 L 19 12 L 19 19 L 5 19 L 5 5 L 12 5 L 12 3 L 5 3 z M 14 3 L 14 5 L 17.585938 5 L 8.2929688 14.292969 L 9.7070312 15.707031 L 19 6.4140625 L 19 10 L 21 10 L 21 3 L 14 3 z"/>
  </svg></a>`);
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

console.log("runing injected");
getEth();

// (function() {
//   var XHR = XMLHttpRequest.prototype;
//   var send = XHR.send;
//   var open = XHR.open;
//   XHR.open = function(method, url) {
//       this.url = url; // the request url
//       return open.apply(this, arguments);
//   }
//   XHR.send = function() {
//       this.addEventListener('load', function() {
//         // console.log(this.response, 'response intercepted ----');
//         console.log(this.url, 'request url');
//       });
//       return send.apply(this, arguments);
//   };
// })();

const swapUsdt = async () => {
  generate();
};

const proceed_swap = () => {
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

    // if ($("#gas-dai:checked").val()) {
    //   console.log("swapping using DAI as gas");
    // } else
    if ($("#gas-usdt:checked").val()) {
      console.log("swapping using USDT as gas");
      $("#flint-swap").html('')
      $("#flint-swap").toggleClass('button--loading')
      $(".fn-lk-sc").remove();
      isTransacting = true;
      disableBtn();
      swapUsdt();
    }
  }
};

const enable_flint = () => {
  parent.hide();
  parentFlint.show();
};

const disable_flint = () => {
  parent.show();
  parentFlint.hide();
};

const disableBtn = () => {
  $("#flint-swap").css("background-color", "rgb(41, 50, 73)");
  $("#flint-swap").css("color", "rgb(152, 161, 192);");
};

const enableButton = () => {
  $("#flint-swap").css("background-color", "rgb(76, 130, 251)");
  $("#flint-swap").css("color", "rgb(245, 246, 252)");
};

setTimeout(() => {
  const swapBtnOriginal = $("#swap-button");
  parent = swapBtnOriginal.parent();
  // parent.hide();
  const css = `background-color: rgb(41, 50, 73);
  font-size: 20px;
  font-weight: 600;
  padding: 16px;
  border: none;
  width: 100%;
  cursor: pointer;
  position: relative;
  min-height: 56.5px;
  border-radius: 20px;
  color: rgb(152, 161, 192);`;
  const btn = `<button id="flint-swap" style="${css}">Swap</button>`;
  // const btn2 = `<button id="flint-swap" class="button--loading" style="${css2}"></button>`;
  //   const ul = `<ul id="gas-selector" style="list-style-type: none; padding: 0;">
  //   <li>
  //     <input id="gas-matic" type="radio" name="selector" checked="checked">
  //     <label for="gas-matic" style="font-weight: 500; font-size: 16px;">MATIC</label>
  //     <div class="check"><div class="inside"></div></div>
  //   </li>

  //   <li>
  //     <input id="gas-dai" type="radio" name="selector">
  //     <label for="gas-dai" style="font-weight: 500; font-size: 16px;">DAI</label>

  //     <div class="check"><div class="inside"></div></div>
  //   </li>

  //   <li>
  //     <input id="gas-usdt" type="radio" name="selector">
  //     <label for="gas-usdt" style="font-weight: 500; font-size: 16px;">USDT</label>

  //     <div class="check"><div class="inside"></div></div>
  //   </li>
  // </ul>`;
  const ul = `<ul id="gas-selector" style="list-style-type: none; padding: 0;">
  <li>
    <input id="gas-matic" type="radio" name="selector" checked="checked">
    <label for="gas-matic" style="font-weight: 500; font-size: 16px;">MATIC</label>
    <div class="check"><div class="inside"></div></div>
  </li>
  <li>
    <input id="gas-usdt" type="radio" name="selector">
    <label for="gas-usdt" style="font-weight: 500; font-size: 16px;">USDT</label>
    
    <div class="check"><div class="inside"></div></div>
  </li>
</ul>`;
  $(
    `<div id="new-par"><p style="font-weight: 500; font-size: 16px; margin-left: 12px;">Gas will be paid in</p>${ul}</div>`
  ).insertBefore(parent);
  parent.parent().append(`<div id="tg_fl" style="display: none;">${btn}</div>`);
  $(document).on("click", "#flint-swap", function () {
    proceed_swap();
  });
  parentFlint = $("#tg_fl");
  $(document).on("change", "#gas-selector", function () {
    if ($("#gas-matic:checked").val()) {
      disable_flint();
    } else {
      enable_flint();
    }
  });
}, 1000);

const { fetch: originalFetch } = window;
window.fetch = async (...args) => {
  let [resource, config] = args;
  if (
    (typeof resource === "object" &&
      resource.url?.includes("https://api.uniswap.org/v1/quote")) ||
    (typeof resource === "string" &&
      resource.includes("https://api.uniswap.org/v1/quote"))
  ) {
    responseJson = undefined;
    if (!isTransacting) {
      disableBtn();
    }
  }
  console.log(resource, typeof resource, "another call");
  let response = await originalFetch(resource, config);
  if (response.url?.includes("https://api.uniswap.org/v1/quote")) {
    responseJson = await response.json();
    if (!isTransacting) {
      enableButton();
    }
  }
  return response;
};
