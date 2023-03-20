import browser from 'webextension-polyfill';

export const getWalletAddress = async () => {
    const res = await browser.storage.local.get('essential');
    return res?.essential?.message;
};
