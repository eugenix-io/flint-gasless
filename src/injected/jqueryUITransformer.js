import $ from 'jquery';
import chooseTokenBlock from './html/chooseTokenBlock.html';
import chooseDifferentTokenBlock from './html/chooseDifferentToken.html';
import swapCheckPopup from './html/swapCheckPopup.html';
import transactionWaiting from './html/transactionWaiting.html';
import flintButtonWrapper from './html/flintButtonWrapper.html';
import signatureRejectPopup from './html/signatureRejectPopup.html';
import transactionSuccessPopup from './html/transactionSuccessPopup.html';
import {
    handleApproval,
    handleSwap,
    handleTokenChange,
    getGaslessApprovalSupported,
    getWalletAddress,
    getTokenAddressFromSymbol,
} from './flintButtonState';
import chainIdLogo from '../injected/configs/chainIdLogo.json';
import { getCurrenyNetwork } from './store/store';
import { getSignificantDigits } from '../utils/commonFunctions';
import axios from 'axios';
import { identifyUser, trackEvent } from '../utils/SegmentUtils';
import { getQuoteValues } from './requestInterceptor';

let parent;
let parentFlint;

let currencySelector1;
let currencySelector2;

let fromCurrency;
let toCurrency;
let fromImgSrc;
let toImgSrc;
let fromInput;
let toInput;
let finalToTokenPrice;

let dd2;

let gasInToToken = 0;
let theme = 'light';

let currentTransactionHash = '-';

let isCurrentTokenApproved = false;

export const setTransactionHash = (hash) => {
    trackEvent('TRANSACTION_SUCCESS', {
        chainId: getCurrenyNetwork(),
        hash,
    });
    currentTransactionHash = hash;
    $('#gp-tohid').fadeIn();
    $('#gaspay-success-popup-copy')
        .html(`To view your transaction, <a id="fl-vw-plsc" target="_blank" style="text-decoration: none; font-weight: 600" href="${hash}">
    click here.</a><br>Something exciting is brewing just for you,<br>
    share your email to unlock it`);
    $('fl-vw-plsc')
        .off()
        .on({
            click: () => {
                trackEvent('TWITTER_SHARE_CLICK', {
                    chainId: getCurrenyNetwork(),
                });
            },
        });
};

const swapButtons = ['flint-swap-conf', 'flint-swap'];

function validateEmail(email) {
    const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

export const setGasInToToken = (gas) => {
    if (gas) {
        gasInToToken = gas;
    }
    setToTokenFinalPrice();
};

export const setGasInFromToken = (
    gas,
    fromPrice,
    approvalFeesUsd,
    approvalFeesToken,
    gasFeesParamsEth
) => {
    console.log('setGasInFromToken $$$', gas,
    fromPrice,
    approvalFeesUsd,
    approvalFeesToken);
    if (gas) {
        gas = getSignificantDigits(gas);
        fromPrice = getSignificantDigits(fromPrice);
        let gasHTML = '<div></div>';

        if (isCurrentTokenApproved) {
            // For SWAP gas fees for Gaspay 
            if (getCurrenyNetwork() === 1) {
                gasHTML = `Fees: <b>${getSignificantDigits(gasFeesParamsEth.fromAmountEqGasFees)} ${fromCurrency}</b> ($${getSignificantDigits(gasFeesParamsEth.gasFeeInUsd)})`;
            } else {
                // TODO Put 0 fees check for arb
                gasHTML = `Fees: <b>${gas} ${fromCurrency}</b> ($${fromPrice})`;
            }
        // TODO Put arb check for 0 gas fee
        } else if (getCurrenyNetwork() == 137) {
            gasHTML = '<b>Approval is gasless</b>';
        } else if (getCurrenyNetwork() == 42161 || getCurrenyNetwork() == 1) {
            //Approval fees in $ARB is
            gasHTML = `Fees: <b>${getSignificantDigits(
                approvalFeesToken
            )} ${fromCurrency}</b> ($${getSignificantDigits(approvalFeesUsd)})`;
        }
        $('#fl-gs-cnt-bx').show(100);
        $('#fl-gs-cnt-bx').children('div').children('p').html(gasHTML);
    } else {
        $('#fl-gs-cnt-bx').hide(100);
    }
};

const setToTokenFinalPrice = () => {
    if (toInput.val()) {
        const inpValue = Number(toInput.val());
        let finalPrice = Number(inpValue - gasInToToken);
        if (finalPrice > 0.0001) {
            finalPrice = finalPrice.toFixed(4);
        }
        finalToTokenPrice = finalPrice;
        $('#fl-to-amt').html(finalPrice);
    }
};

const updateThemeForFlintUI = (backgroundColor) => {
    if (backgroundColor === 'rgb(13, 17, 28)') {
        theme = 'dark';
        // dark theme
        $('#diffTokBanner').css('background-color', '#131A2A');
        $('#flint-master-container').css('background-color', '#131A2A');
        $('.fl-ck-bx-n').css('background-color', 'rgb(41, 50, 73)');
        $('#diffTokLogo').attr(
            'src',
            'https://dnj9s9rkg1f49.cloudfront.net/gasly.svg'
        );
        $('#tick-bg-color').attr('fill', '#00C689');
        $('#tick-bg-color-native').attr('fill', '#00C689');
        $('#fees-logo').attr(
            'src',
            'https://dnj9s9rkg1f49.cloudfront.net/gasly.svg'
        );
        $('.fl-pop-cnt').css('background-color', backgroundColor);
        $('.fl-pop-cnt').css('border-color', backgroundColor);
        $('#swapConfTo').css('background-color', '#131A2A');
        $('#swapConfFrom').css('background-color', '#131A2A');
        $('#swapConfFrom').css('border', '1px solid rgb(41, 50, 73)');
        $('#swapConfTo').css('border', '1px solid rgb(41, 50, 73)');
        $('#swapConfArrow').attr('stroke', '#5D6785');
        $('#swapConfArrCn').css('border', '4px solid rgb(13, 17, 28)');
        $('#swapConfArrCn').css('background-color', 'rgb(41, 50, 73)');

        $('#txnsSuccessPath2').attr('fill', '#5981F3');
        $('#txnsSuccessPath1').attr('fill', '#5981F3');
        $('#txnSuccessCont').css('background-color', backgroundColor);
        $('#txSuccessClose').css('background-color', 'rgb(76, 130, 251)');

        $('#txnPendingCont').css('background-color', backgroundColor);
        $('#txnPendingPath').attr('stroke', '#2172E5');
        $('#txnWaitingText').css('color', 'rgb(152, 161, 192)');
    } else {
        //rgb(255, 255, 255)
        // light theme
        theme = 'light';
        $('#diffTokBanner').css('background-color', '#F5F6FB');
        $('#flint-master-container').css(
            'background-color',
            'rgb(245, 246, 252)'
        );
        $('.fl-ck-bx-n').css('background-color', 'rgb(232, 236, 251)');
        $('#diffTokLogo').attr(
            'src',
            'https://dnj9s9rkg1f49.cloudfront.net/gasly-light-theme.svg'
        );
        $('#tick-bg-color').attr('fill', '#000');
        $('#tick-bg-color-native').attr('fill', '#000');
        $('#fees-logo').attr(
            'src',
            'https://dnj9s9rkg1f49.cloudfront.net/gasly-light-theme.svg'
        );

        $('.fl-pop-cnt').css('background-color', '#fff');
        $('.fl-pop-cnt').css('border-color', 'rgb(255, 255, 255)');
        $('#swapConfTo').css('background-color', '#F5F6FB');
        $('#swapConfFrom').css('background-color', '#F5F6FB');
        $('#swapConfFrom').css('border', 'none');
        $('#swapConfTo').css('border', 'none');
        $('#swapConfArrow').attr('stroke', '#000');
        $('#swapConfArrCn').css('border', '4px solid white');
        $('#swapConfArrCn').css('background-color', '#F5F6FB');
        //FA108E pink color

        $('#txnsSuccessPath2').attr('fill', '#FA108E');
        $('#txnsSuccessPath1').attr('fill', '#FA108E');

        $('#txnSuccessCont').css('background-color', '#F5F6FB');
        $('#txSuccessClose').css('background-color', '#FA108E');

        $('#txnPendingCont').css('background-color', '#F5F6FB');
        $('#txnPendingPath').attr('stroke', '#FA108E');
        $('#txnWaitingText').css('color', '#FA108E');
    }
};

export const disableSwapButton = () => {
    swapButtons.forEach((btn) => {
        if (theme === 'light') {
            $(`#${btn}`).css('background-color', 'rgb(245, 246, 252)');
            $(`#${btn}`).css('color', 'rgb(119, 128, 160)');
        } else {
            $(`#${btn}`).css('background-color', 'rgb(19, 26, 42)');
            $(`#${btn}`).css('color', 'rgb(152, 161, 192)');
        }
        $(`#${btn}`).css('cursor', 'default');
        $(`#${btn}`).css('pointer-events', 'none');
    });
};

export const addLoaderButton = () => {
    $(`#flint-swap`).html('');
    $(`#flint-swap`).addClass('button--loading');
};

export const hideLoaderButton = () => {
    $(`#flint-swap`).html('Swap');
    $(`#flint-swap`).removeClass('button--loading');
};

export const enableSwapButton = () => {
    // Check for theme

    const main = $('#swap-page');

    const backgroundColor = main.css('background-color');

    if (backgroundColor === 'rgb(13, 17, 28)') {
        // dark theme
        theme = 'dark';
    }

    const target = dd2
        .children('div:nth-child(3)')
        ?.children('div:first-child');
    target?.on({
        DOMSubtreeModified: () => {
            $('#fl-cr-exch-rate').html(target.html());
        },
    });
    swapButtons.forEach((btn) => {
        if (theme === 'light') {
            //FA108E
            $(`#${btn}`).css('background-color', '#FA108E');
        } else {
            $(`#${btn}`).css('background-color', 'rgb(76, 130, 251)');
        }
        $(`#${btn}`).css('color', 'rgb(245, 246, 252)');
        $(`#${btn}`).css('cursor', 'pointer');
        $(`#${btn}`).css('pointer-events', 'auto');
    });
    setTimeout(() => {
        if (fromInput.val()) {
            $('#fl-from-amt').html(fromInput.val());
        }
        setToTokenFinalPrice();
    }, 200);
};

export const showApprove = () => {
    $('#flint-approve').show();
    $('#flint-swap').hide();
    isCurrentTokenApproved = false;
};

export const hideApprove = () => {
    $('#flint-approve').hide();
    $('#flint-swap').show();
    isCurrentTokenApproved = true;
};

export const showLoaderApprove = () => {
    $('#flint-approve').html('');
    $('#flint-approve').addClass('button--loading');
    if (theme === 'light') {
        $('#flint-approve').css('background-color', 'rgb(245, 246, 252)');
        $('#flint-approve').css('color', 'rgb(119, 128, 160)');
    } else {
        $('#flint-approve').css('background-color', 'rgb(41, 50, 73)');
        $('#flint-approve').css('color', 'rgb(152, 161, 192);');
    }
};

export const hideLoaderApprove = () => {
    $('#flint-approve').html(
        getGaslessApprovalSupported() ? 'Approve' : 'Approve (gas needed)'
    );
    $('#flint-approve').removeClass('button--loading');
    $('#flint-approve').css('background-color', 'rgb(76, 130, 251)');
    $('#flint-approve').css('color', 'rgb(245, 246, 252)');
};

export const showTransactionSuccessPopup = () => {
    $('#flppbxtrasuc').fadeIn(200);
    setTimeout(() => {
        $('#gas-pay-email-collect').trigger('focus');
    }, 300);
};

export const hideTransactionSuccessPopup = () => {
    $('#flppbxtrasuc').fadeOut(200);
};

export const showRejectPopup = () => {
    $('#flppbxsigrj').fadeIn(200);
};

export const hideRejectPopup = () => {
    $('#flppbxsigrj').fadeOut(200);
};

export const showWaitingPopup = () => {
    $('#flppbxwtg').fadeIn(200);
};

export const hideWaitingPopup = () => {
    $('#flppbxwtg').fadeOut(200);
};

export const showSwapPopup = () => {
    $('#flppbx').fadeIn(200);
};

export const hideSwapPopup = () => {
    $('#flppbx').fadeOut(200);
};

export const switchToSwap = () => {
    $('#flint-approve').hide();
    $('#flint-swap').show();
};

export const hideConnectWalletButton = () => {
    $('#connected_buttons').show();
    $('#flint-connect-wallet').hide();
};

export const showConnectWalletButton = () => {
    $('#connected_buttons').hide();
    $('#flint-connect-wallet').show();
};

export const disableService = (message) => {
    select_dapp_for_swap();
    $('#fl-gas-sl2').addClass('disabled');
    // $('#flint-error-message').show();
    $('#diffTokBanner').show();
    $('#flint-error-message').html(message);
};

export const enableService = () => {
    select_flint_for_swap();
    $('#fl-gas-sl2').removeClass('disabled');
    // $('#flint-error-message').hide();
    $('#diffTokBanner').hide();
};

export const setNativeTokenNameAndLogo = () => {
    console.log(
        'CHANGING NATIVE TOKEN LOGO AND NAME!',
        chainIdLogo[getCurrenyNetwork()].image,
        chainIdLogo[getCurrenyNetwork()].name,
        getCurrenyNetwork()
    );
    $('#fl-native-token-im').attr(
        'src',
        chainIdLogo[getCurrenyNetwork()].image
    );
    $('#fl-native-token').html(chainIdLogo[getCurrenyNetwork()].name);
};

const enable_flint = () => {
    parent.hide();
    parentFlint.show();
};

const disable_flint = () => {
    parent.show();
    parentFlint.hide();
};

const select_flint_for_swap = () => {
    enable_flint();
    $('#fl-ck-a1').hide();
    $('#fl-ck-ina1').show();
    $('#fl-ck-a2').show();
    $('#fl-ck-ina2').hide();
};

const select_dapp_for_swap = () => {
    disable_flint();
    $('#fl-ck-a1').show();
    $('#fl-ck-ina1').hide();
    $('#fl-ck-a2').hide();
    $('#fl-ck-ina2').show();
};

const insertPopupHtml = () => {
    $('body').append(swapCheckPopup);
    $('body').append(transactionWaiting);
    $('body').append(signatureRejectPopup);
    $('body').append(transactionSuccessPopup);
    $('.fl-pop-bk')
        .off()
        .on('click', function () {
            $(this).fadeOut(100);
        });
    $('.fl-pop-cnt')
        .off()
        .on('click', function (e) {
            e.stopPropagation();
        });
    $('.fl-p-cl')
        .off()
        .on('click', function (e) {
            $('.fl-pop-bk').fadeOut(100);
        });
};

// insertGasTokenBlock is initialized when injecting

const insertGasTokenBlock = () => {
    const main = $('#swap-page');
    if (main && main.length > 0) {
        fromInput = main.children('input:first-child');
        toInput = main.children('input:nth-child(2)');
        // currencySelector1 is from token div
        currencySelector1 = main
            .children('div:nth-child(2)')
            ?.children('div:first-child')
            ?.children('div:first-child')
            ?.children('div:first-child')
            ?.children('div:first-child')
            ?.children('button');
        fromInput = currencySelector1.parent().children('input');
        // on() -> onChange value of element
        // off() -> clear all listeners assigned before on the element
        fromInput.off().on({
            keyup: () => {
                if (!fromInput.val()) {
                    disableSwapButton();
                } else {
                    // Insert this value to popup that comes after we press swap button
                    $('#fl-from-amt').html(fromInput.val());
                }
                triggerQuote();
            },
            // in some cases keyup or change doesn't trigger
            // so putting this to handle all cases
            change: () => {
                if (!fromInput.val()) {
                    disableSwapButton();
                } else {
                    $('#fl-from-amt').html(fromInput.val());
                }
                triggerQuote();
            },
        });

        // Setting the from currency symbol here...
        fromCurrency = currencySelector1
            .children('span')
            ?.children('div')
            ?.children('span')
            ?.html();
        
        // Setting the from currency image for popup here...
        fromImgSrc = currencySelector1.find('img').attr('src');
        setTimeout(() => {
            fromImgSrc = currencySelector1.find('img').attr('src');
            $('#fl-from-token-im').attr('src', fromImgSrc);
            $('#fl-from-token').html(fromCurrency);
            $('#fl-from-im').attr('src', fromImgSrc);
            $('#fl-from-crr').html(fromCurrency);
        }, 200);

        // Attatching listeners when from token is changed
        // DOMSubtreeModified helps to check whether HTML has been changed or not

        currencySelector1?.off().on({
            DOMSubtreeModified: (e) => {
                fromCurrency = currencySelector1
                    .children('span')
                    ?.children('div')
                    ?.children('span')
                    ?.html();
                console.log('THIS IS THE FROM CURRENCY - ', fromCurrency);
                trackEvent('FROM_TOKEN_SELECT', {
                    chainId: getCurrenyNetwork(),
                    token: fromCurrency,
                });
                fromImgSrc = currencySelector1.find('img').attr('src');
                setTimeout(() => {
                    fromImgSrc = currencySelector1.find('img').attr('src');
                    $('#fl-from-token-im').attr('src', fromImgSrc);
                    $('#fl-from-token').html(fromCurrency);
                    $('#fl-from-im').attr('src', fromImgSrc);
                    $('#fl-from-crr').html(fromCurrency);
                    handleTokenChange(fromCurrency, fromInput.val());
                    activeSwap();
                    triggerQuote();
                }, 200);
            },
        });

        // To token operations...

        currencySelector2 = main
            .children('div:nth-child(3)')
            ?.children('div:first-child')
            ?.children('div:first-child')
            ?.children('div:first-child')
            ?.children('div:first-child')
            ?.children('div:first-child')
            ?.children('button');
        toInput = currencySelector2.parent().children('input');
        toInput.off().on('input', function () {
            setToTokenFinalPrice();
            triggerQuote(false);
            // alert($(this).val());
        });
        toInput.off().on({
            change: () => {
                setToTokenFinalPrice();
                triggerQuote(false);
            },
            keyup: () => {
                triggerQuote(false);
            },
        });
        currencySelector2?.off()?.on({
            DOMSubtreeModified: (e) => {
                toCurrency = currencySelector2
                    .children('span')
                    ?.children('div')
                    ?.children('span')
                    ?.html();
                setTimeout(() => {
                    toImgSrc = currencySelector2.find('img').attr('src');
                    $('#fl-to-im').attr('src', toImgSrc);
                    $('#fl-to-crr').html(toCurrency);
                    triggerQuote();
                }, 200);
                trackEvent('TO_TOKEN_SELECT', {
                    chainId: getCurrenyNetwork(),
                    token: toCurrency,
                });
            },
        });

        // swap arrow between from & to token
        // set listeners for popup from token change

        main.children('div:nth-child(3)')
            ?.children('div:first-child')
            ?.off()
            ?.on({
                DOMSubtreeModified: (e) => {
                    setTimeout(() => {
                        if (fromInput.val()) {
                            $('#fl-from-amt').html(fromInput.val());
                        }
                        setToTokenFinalPrice();
                    }, 200);
                },
            });

        const dd = main.children('div:nth-child(3)');
        if (dd && dd.length > 0) {
            dd2 = dd.children('div:first-child');
            dd2.children('div:first-child').css('border-bottom', 'none');
            dd2.css('border-radius', '12px');
            dd2.css('overflow', 'hidden');
            dd2.append(chooseTokenBlock);
            dd2.append(chooseDifferentTokenBlock);

            $('#fl-gas-sl2')
                .off()
                .on('click', () => {
                    select_flint_for_swap();
                });

            $('#fl-gas-sl')
                .off()
                .on('click', () => {
                    select_dapp_for_swap();
                });

            // if (fromCurrency === 'MATIC') {
            //     disableService();
            // }
        }

        $('#gas-pay-email-collect')
            ?.off()
            ?.on({
                change: () => {
                    const email = $('#gas-pay-email-collect').val();
                    if (validateEmail(email)) {
                        $('#emsubmit').css(
                            'background-color',
                            'rgb(76, 130, 251)'
                        );
                    } else {
                        $('#emsubmit').css(
                            'background-color',
                            'rgb(41, 50, 73)'
                        );
                    }
                },
                keyup: () => {
                    const email = $('#gas-pay-email-collect').val();
                    if (validateEmail(email)) {
                        $('#emsubmit').css(
                            'background-color',
                            'rgb(76, 130, 251)'
                        );
                    } else {
                        $('#emsubmit').css(
                            'background-color',
                            'rgb(41, 50, 73)'
                        );
                    }
                },
            });

        $('#gaspay-email-submit')
            .off()
            .on({
                submit: async (e) => {
                    e.preventDefault();
                    const email = $('#gas-pay-email-collect').val();
                    if (validateEmail(email)) {
                        trackEvent('EMAIL_SUBMIT', {
                            chainId: getCurrenyNetwork(),
                            email,
                        });
                        identifyUser(email, getWalletAddress());
                        $('#emsubmit').html('');
                        $('#emsubmit').addClass('button--loading');
                        axios
                            .post(
                                'https://api.airtable.com/v0/appvxjSOULMpTiniW/Table%201',
                                {
                                    records: [
                                        {
                                            fields: {
                                                email: email,
                                                wallet: await getWalletAddress(),
                                                hash: currentTransactionHash,
                                            },
                                        },
                                    ],
                                },
                                {
                                    headers: {
                                        Authorization:
                                            'Bearer keyJnhiCWmdKSZWOE',
                                    },
                                }
                            )
                            .then((res) => {
                                $('#emsubmit').html('Submit');
                                $('#emsubmit').removeClass('button--loading');
                                $('#gaspay-tweet').fadeIn(200);
                                $('#gaspay-email-submit').fadeOut(200);
                                $('#gaspay-success-popup-copy').html(
                                    'Did you enjoy what you just experienced?<br><br>Help us spread the word by sharing it with your friends and community who might also love it'
                                );
                                $('#gp-tohid').fadeOut(100);
                            });
                    }
                },
            });
    }
};

setInterval(() => {
    const main = $('#swap-page');

    const backgroundColor = main.css('background-color');

    updateThemeForFlintUI(backgroundColor);
}, 500);

export const addFlintUILayer = (callback) => {
    const swapBtnOriginal = $('#swap-button');
    parent = swapBtnOriginal.parent();

    if (swapBtnOriginal.length > 0) {
        insertPopupHtml();
        insertGasTokenBlock();
    }

    parent.parent().append(flintButtonWrapper);

    $('#flint-swap')
        .off()
        .on('click', function () {
            callback();
        });
    $('#flint-swap-conf')
        .off()
        .on('click', function () {
            handleSwap();
            hideSwapPopup();
            showWaitingPopup();
            $('#fl-swp-for').html(
                `Swapping ${fromInput.val()} ${fromCurrency} for ${finalToTokenPrice} ${toCurrency}`
            );
        });
    $('#flint-approve')
        .off()
        .on('click', function () {
            handleApproval();
        });
    $('#flint-connect-wallet')
        .off()
        .on('click', async () => {
            $('*[data-testid="navbar-connect-wallet"]').click();
        });

    parentFlint = $('#tg_fl');
    return swapBtnOriginal.length;
};

export const insufficientBalance = (str) => {
    if (getCurrenyNetwork() === 1 && str === 'eth') {
        $('#flint-swap').html(`Low swap amount value given`);
    } else {
        $('#flint-swap').html(`Insufficient ${fromCurrency} balance`);
    }
};

export const activeSwap = () => {
    $('#flint-swap').html(`Swap`);
};

export const beginTransactionLoader = (callback) => {
    console.log('swapping using USDT as gas');
    $('#flint-swap-conf').html('');
    $('#flint-swap-conf').addClass('button--loading');
    $('.fn-lk-sc').remove();
    disableBtn();
    callback();
};

export const updatePriceValues = () => {
    setTimeout(() => {
        const to = toInput.val();
        const from = fromInput.val();
        if (to.length > 0) {
            setToTokenFinalPrice();
        }
        if (from.length > 0) {
            $('#fl-from-amt').html(from);
        }
    }, 200);
};

export const showMaxAmountErrorMessage = () => {
    $('#maxAmountErrorMessage').fadeIn(0);
};

export const hideMaxAmountErrorMessage = () => {
    $('#maxAmountErrorMessage').fadeOut(0);
};

export const getFromCurrency = () => {
    return fromCurrency;
};

export const getToCurrency = () => {
    return toCurrency;
};

export const getFromInput = () => {
    return fromInput;
};

export const getToInput = () => {
    return toInput;
};

export const triggerQuote = (exactIn = true) => {
    let amount;
    const fromTokenObject = getTokenAddressFromSymbol(fromCurrency);
    const toTokenObject = getTokenAddressFromSymbol(toCurrency);
    if (exactIn) {
        amount = Number(fromInput.val()) * 10 ** fromTokenObject.decimals;
    } else {
        amount = Number(toInput.val()) * 10 ** fromTokenObject.decimals;
    }
    getQuoteValues(
        fromTokenObject.address,
        toTokenObject.address,
        getCurrenyNetwork(),
        amount,
        exactIn
    );
};
