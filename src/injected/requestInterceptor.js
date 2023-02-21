import { update } from "./flintButtonState";

const getTokenInAddress = (str) => {
  const newStr = str.split("?")[1];
  const url = new URLSearchParams(newStr);

  return { tokenInAddress: url.get("tokenInAddress"), amount: url.get("amount") };
};

export const interceptRequests = () => {
  const { fetch: originalFetch } = window;
  window.fetch = async (...args) => {
    let [resource, config] = args;
    if (
      (typeof resource === "object" &&
        resource.url?.includes("https://api.uniswap.org/v1/quote")) ||
      (typeof resource === "string" &&
        resource.includes("https://api.uniswap.org/v1/quote"))
    ) {
      const { tokenInAddress, amount } = getTokenInAddress(resource.url);
      console.log("GOING TO UPDATE STATE NOW!");
      update({
        action: 'NEW_QUOTE_REQUEST_INITIATED',
        payload: { fromToken: tokenInAddress, amountIn: amount }
      });
    }



    let response = await originalFetch(resource, config);



    if (response.url?.includes("https://api.uniswap.org/v1/quote")) {
      console.log("INSIDE QUOTE COMPLETD!!");
      const responseJson = await response.json();
      console.log("THIS IS THE RESPONSE FROM THE QUOTE REQUEST - ", responseJson);
      update({
        action: 'NEW_QUOTE_REQUEST_COMPLETED',
        payload: responseJson
      });
    }
    return response;
  };
};
