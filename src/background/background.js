import browser from 'webextension-polyfill';

chrome.runtime.onMessage.addListener((res) => {
    // setM('asdasdasd' + JSON.stringify({ message: res }));

    browser.storage.local.set(res);
    // setM('set in storage' + JSON.stringify({ message: res }));
    // if (request.essential) {
    // }
    // browser.storage.local.set({
    //     message: 'asdasd nasdjk asdk asdkfjn ',
    // });
});
