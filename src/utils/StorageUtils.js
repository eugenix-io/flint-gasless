import browser from 'webextension-polyfill';

export const getWalletAddress = async () => {
    const res = await browser.storage.local.get('wallet');
    return res?.wallet;
};

export const getnewPendingTransaction = async () => {
    const res = await browser.storage.local.get('newPendingTransaction');
    return res?.newPendingTransaction;
};

export const removePendingTransaction = async () => {
    const res = await browser.storage.local.remove('newPendingTransaction');
    return res;
};
