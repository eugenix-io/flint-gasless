import { calculateAllowance, getIsTransacting, setResponseJson } from "./injected";
import { disableBtn, enableButton, startPreloader } from "./jqueryUITransformer";

let currentToken = '', previousToken = '', i = 0;
const getTokenInAddress = (str) => {
  const newStr = str.split("?")[1];

  console.log(newStr, "newStr");

  const url = new URLSearchParams(newStr);

  return url.get("tokenInAddress");
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
      const tokenInAddress = getTokenInAddress(resource.url);
      currentToken = tokenInAddress;
      if (i == 0 || !(previousToken === currentToken)) {
        i +=1;
        previousToken = currentToken;
        startPreloader();
        calculateAllowance(tokenInAddress);
      }
      setResponseJson(undefined);
      if (!getIsTransacting()) {
        disableBtn();
      }
    }


    
    let response = await originalFetch(resource, config);


    
    if (response.url?.includes("https://api.uniswap.org/v1/quote")) {
      const responseJson = await response.json();
      setResponseJson(responseJson);
      if (!getIsTransacting()) {
        enableButton();
      }
    }
    return response;
  };
};
