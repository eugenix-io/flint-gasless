import { getIsTransacting, setResponseJson } from "./injected";
import { disableBtn, enableButton } from "./jqueryUITransformer";

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
}
