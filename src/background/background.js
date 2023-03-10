import browser from 'webextension-polyfill';

function matchUrl(url) {
    var re = new RegExp('https://app.uniswap.org/*');
    if (
        url &&
        url.startsWith('https://app.uniswap.org/#/swap') &&
        !url.includes('inputCurrency')
    ) {
        var newUrl = url.replace(
            re,
            'https://app.uniswap.org/#/swap?inputCurrency=0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
        );
        if (url != newUrl) {
            return newUrl;
        }
    }
}

browser.tabs.onUpdated.addListener(function (tabId, change, _tab) {
    console.log('inside tabls loading', change);
    if (change.status == 'loading') {
        var newUrl = matchUrl(change.url);
        if (newUrl) {
            console.log('[notice] matching with tabs event');
            console.log('[notice] matched: ' + change.url);
            console.log('[notice] redirecting to: ' + newUrl);
            browser.tabs.update(tabId, { url: newUrl });
        }
    }
});
