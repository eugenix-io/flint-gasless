import { isTokenApproved, getNonce } from "../utils/ERC20Utils";
import ERC20Abi from "../abis/ERC20.json";
import $ from "jquery";
import { ethers } from "ethers";
import { signTokenApproval, signGaslessSwap } from "../utils/signature";
import {
  showSwapPopup,
  updatePriceValues,
  showRejectPopup,
  hideWaitingPopup,
  showTransactionSuccessPopup,
  hideRejectPopup,
  enableSwapButton,
  disableSwapButton,
  showApprove,
  hideApprove,
  showLoaderApprove,
  hideLoaderApprove,
} from "./jqueryUITransformer";
import axios from "axios";

let walletAddress;
let currentToken;
let swapState = {};
let tokens = {};
let latestQuoteId;

export const update = async ({ action, payload, uuid }) => {
  console.log("NEW ACTION IN BUTTON STATE - ", action, payload);
  switch (action) {
    //params - fromToken,
    case "NEW_QUOTE_REQUEST_INITIATED":
      latestQuoteId = uuid;
      //only if the user changes the token, check if we need an approval
      disableSwapButton();
      swapState = {};
      break;
    case "NEW_QUOTE_REQUEST_COMPLETED":
      if (latestQuoteId !== uuid) {
        return;
      }
      enableSwapButton();
      updatePriceValues();
      console.log("STARTING NEW QUOTE REQ", payload);
      const route = payload?.route[0];
      const tokenArray = [route[0].tokenIn.address, route[0].tokenOut.address];
      const feeArr = [route[0].fee];
      for (let i = 1; i < route.length; i++) {
        feeArr.push(route[i].fee);
        tokenArray.push(route[i].tokenOut.address);
      }
      console.log("THIS IS THE TOKEN ARRAY - ", tokenArray);
      if (tokenArray[0] != currentToken) {
        swapState = {};
        return;
      }
      swapState = {
        amountIn: payload.amount,
        routes: payload.route[0],
        fromToken: tokenArray[0],
        toToken: tokenArray[tokenArray.length - 1],
        tokenArray: tokenArray,
        feeArr: feeArr,
      };
      console.log("UPDATING SWAP STATE - ", swapState);
      //if it's in the approve state then the state will be updated by the approval logic
      break;
  }
};

export const setWalletAddress = (address) => {
  console.log("WALLET ADDRESS SET - ", address);
  walletAddress = address;
};

export const buttonClick = async () => {
  console.log("THIS SWAP STATW - ", swapState);
  if (swapState.fromToken) {
    showSwapPopup();
  }
  console.log("Button was clicked!!");
};

export const handleApproval = async () => {
  showLoaderApprove();
  try {
    await signTokenApproval({
      fromToken: currentToken,
      walletAddress,
    });
    hideLoaderApprove();
    hideApprove();
  } catch (err) {
    hideLoaderApprove();
    showApprove();
  }
};

export const handleSwap = async () => {
  try {
    const re = await signGaslessSwap({
      walletAddress,
      swapState,
    });
    const data = JSON.parse(re.data);
    const hash = data.hash;
    $("#fl-vw-plsc").attr("href", `https://polygonscan.com/tx/${hash}`);
    showTransactionSuccessPopup();
    hideWaitingPopup();
    hideRejectPopup();
  } catch (err) {
    console.error("FAILED IN HANDLING SWAP - ", err);
    showRejectPopup();
    hideWaitingPopup();
  }
};
export const handleTokenChange = async (fromTokenSymbol, amountIn) => {
  console.log("CALLING - ", fromTokenSymbol, amountIn);
  let fromToken = tokens[fromTokenSymbol];
  console.log("GOT ADDRESS - ", fromToken);
  currentToken = fromToken;
  showApprove();
  showLoaderApprove();
  const allowance = await isTokenApproved(fromToken, walletAddress);
  console.log("GOT THE ALLOWANCE - ", allowance);

  //TODO: fails if allowance > 0 but the user changes the amountIn later so that it's greater than allowance
  if (Number(allowance) >= Number(amountIn) && Number(allowance) != 0) {
    hideApprove();
    hideLoaderApprove();
    return;
  }
  console.log(
    "ALLOWANCE LESS THAN REQUIRED",
    amountIn,
    allowance,
    allowance >= amountIn
  );
  showApprove();
  hideLoaderApprove();
  return;
};

function updateConsoleLog() {
  var originalConsoleLog = console.log;
  console.log = function () {
    let args = [];
    args.push("[" + "FLINT_BUTTON" + "] ");
    // Note: arguments is part of the prototype
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    originalConsoleLog.apply(console, args);
  };
}

async function initTokens() {
  let result = await axios.get("https://tokens.uniswap.org");
  result.data.tokens.forEach((token) => {
    if (token.chainId == 137) {
      tokens[token.symbol] = token.address;
    } else if (
      token.extensions &&
      token.extensions.bridgeInfo &&
      token.extensions.bridgeInfo["137"]
    ) {
      tokens[token.symbol] = token.extensions.bridgeInfo["137"].tokenAddress;
    }
  });
}

updateConsoleLog();
initTokens();
