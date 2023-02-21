import { isTokenApproved, getNonce } from "../utils/ERC20Utils";
import ERC20Abi from "../abis/ERC20.json";
import $ from "jquery";
import { ethers } from "ethers";
import { signTokenApproval, signGaslessSwap } from "../utils/signature";
import {
  enableButton,
  showSwapPopup,
  disableBtn,
  updatePriceValues,
} from "./jqueryUITransformer";

let buttonState = "approve";
let approvalCompleted = {};
let walletAddress;
let currentToken;
let swapState = {};

export const update = async ({ action, payload }) => {
  console.log("NEW ACTION IN BUTTON STATE - ", action, payload);
  switch (action) {
    //params - fromToken,
    case "NEW_QUOTE_REQUEST_INITIATED":
      //only if the user changes the token, check if we need an approval
      if (currentToken == payload.fromToken) return;
      currentToken = payload.fromToken;
      swapState = {};
      changeButtonState("loading", payload.fromToken);
      await handleTokenChange(payload);
      break;
    case "NEW_QUOTE_REQUEST_COMPLETED":
      updatePriceValues();
      console.log("STARTING NEW QUOTE REQ", payload);
      const route = payload.route[0];
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
  walletAddress = address;
};

export const buttonClick = async () => {
  console.log("[CHECK THIS] [TRIGGERING BUTTON CLICK");
  if (buttonState == "loading") {
    return;
  } else if (buttonState == "approve") {
    console.log("[CHECK THIS] TRIGGERING HANDLE APPROVAL");
    handleApproval();
  } else if (buttonState == "swap") {
    console.log("[CHECK THIS] TRIGGERING HANDLE SWAP");
    if (swapState) {
      showSwapPopup();
    }
    // handleSwap();
  }
  console.log("Button was clicked!!");
};

const handleTokenChange = async (payload) => {
  if (approvalCompleted[payload.fromToken]) {
    changeButtonState("swap", payload.fromToken);
    return;
  }
  console.log("APPROVAL NOT COMPLETED!");
  const allowance = await isTokenApproved(payload.fromToken, walletAddress);
  if (allowance >= payload.amountIn) {
    changeButtonState("swap", payload.fromToken);
    return;
  }
  console.log("ALLOWANCE LESS THAN REQUIRED", allowance);
  changeButtonState("approve", payload.fromToken);
  return;
};

const handleApproval = async () => {
  changeButtonState("loading", currentToken);
  try {
    await signTokenApproval({
      fromToken: currentToken,
      walletAddress,
    });
    changeButtonState("swap", currentToken);
  } catch (err) {
    changeButtonState("approve", currentToken);
  }
};

export const handleSwap = async () => {
  changeButtonState("loading", currentToken);
  try {
    await signGaslessSwap({
      walletAddress,
      swapState,
    });
  } catch (err) {
    console.error("FAILED IN HANDLING SWAP - ", err);
  }
  changeButtonState("swap", currentToken);
};

const changeButtonState = (newState, fromToken) => {
  console.log("[CHECK THIS] CHANGING BUTTON STATE - ", newState, fromToken);
  //if the user changes the token while something was processing, ignore the stale updates
  if (fromToken != currentToken) {
    console.log("REJECTED BUTTON STATE - ", newState, fromToken);
    return;
  }
  switch (newState) {
    case "approve":
      removePreloader();
      enableButton();
      $("#flint-swap").html("Approve");
      buttonState = "approve";
      break;
    case "swap":
      removePreloader();
      enableButton();
      $("#flint-swap").html("Swap");
      buttonState = "swap";
      break;
    case "loading":
      buttonState = "loading";
      disableBtn();
      showLoader();
  }
};

const showLoader = () => {
  $("#flint-swap").html("");
  $("#flint-swap").toggleClass("button--loading");
};

const removePreloader = () => {
  if (buttonState == "swap") {
    $("#flint-swap").html("Swap");
  } else if (buttonState == "swap") {
    $("#flint-swap").html("Approve");
  }
  $("#flint-swap").toggleClass("button--loading");
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

updateConsoleLog();
