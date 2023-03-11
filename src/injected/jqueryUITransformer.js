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
} from './flintButtonState';
import chainIdLogo from '../injected/configs/chainIdLogo.json';
import { getCurrenyNetwork } from './store/store';

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

const swapButtons = ['flint-swap-conf', 'flint-swap'];

const getSignificantDigits = (num) => {
    num = Number(num);
    if (num > 0.01) {
        num = num.toFixed(2);
    } else if (num > 0.0001) {
        num = num.toFixed(4);
    } else {
        num = num.toFixed(6);
    }
    return num;
};

export const setGasInToToken = (gas) => {
    if (gas) {
        gasInToToken = gas;
    }
    setToTokenFinalPrice();
};

export const setGasInFromToken = (gas, fromPrice) => {
    if (gas) {
        gas = getSignificantDigits(gas);
        fromPrice = getSignificantDigits(fromPrice);
        $('#fl-gs-cnt-bx').show(100);
        $('#fl-gs-cnt-bx')
            .children('div')
            .children('p')
            .html(`Fees: <b>${gas} ${fromCurrency}</b> ($${fromPrice})`);
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
};

export const hideApprove = () => {
    $('#flint-approve').hide();
    $('#flint-swap').show();
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

const insertGasTokenBlock = () => {
    const main = $('#swap-page');
    if (main && main.length > 0) {
        fromInput = main.children('input:first-child');
        toInput = main.children('input:nth-child(2)');
        currencySelector1 = main
            .children('div:nth-child(2)')
            ?.children('div:first-child')
            ?.children('div:first-child')
            ?.children('div:first-child')
            ?.children('div:first-child')
            ?.children('button');
        fromInput = currencySelector1.parent().children('input');
        fromInput.on({
            keyup: () => {
                if (!fromInput.val()) {
                    disableSwapButton();
                } else {
                    $('#fl-from-amt').html(fromInput.val());
                }
            },
            change: () => {
                if (!fromInput.val()) {
                    disableSwapButton();
                } else {
                    $('#fl-from-amt').html(fromInput.val());
                }
            },
        });
        fromCurrency = currencySelector1
            .children('span')
            ?.children('div')
            ?.children('span')
            ?.html();
        fromImgSrc = currencySelector1.find('img').attr('src');
        setTimeout(() => {
            fromImgSrc = currencySelector1.find('img').attr('src');
            $('#fl-from-token-im').attr('src', fromImgSrc);
            $('#fl-from-token').html(fromCurrency);
            $('#fl-from-im').attr('src', fromImgSrc);
            $('#fl-from-crr').html(fromCurrency);
        }, 200);
        currencySelector1?.on({
            DOMSubtreeModified: (e) => {
                fromCurrency = currencySelector1
                    .children('span')
                    ?.children('div')
                    ?.children('span')
                    ?.html();
                console.log('THIS IS THE FROM CURRENCY - ', fromCurrency);
                fromImgSrc = currencySelector1.find('img').attr('src');
                setTimeout(() => {
                    fromImgSrc = currencySelector1.find('img').attr('src');
                    $('#fl-from-token-im').attr('src', fromImgSrc);
                    $('#fl-from-token').html(fromCurrency);
                    $('#fl-from-im').attr('src', fromImgSrc);
                    $('#fl-from-crr').html(fromCurrency);
                    handleTokenChange(fromCurrency, fromInput.val());
                    activeSwap();
                }, 200);
            },
        });

        currencySelector2 = main
            .children('div:nth-child(3)')
            ?.children('div:first-child')
            ?.children('div:first-child')
            ?.children('div:first-child')
            ?.children('div:first-child')
            ?.children('div:first-child')
            ?.children('button');
        toInput = currencySelector2.parent().children('input');
        toInput.on('input', function () {
            setToTokenFinalPrice();
            // alert($(this).val());
        });
        toInput.on({
            change: () => {
                setToTokenFinalPrice();
            },
        });
        currencySelector2?.on({
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
                }, 200);
            },
        });
        main.children('div:nth-child(3)')
            ?.children('div:first-child')
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
    }
};

setInterval(() => {
    const main = $('#swap-page');

    console.log(main.css('background-color'), 'BG color');

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

export const insufficientBalance = () => {
    $('#flint-swap').html(`Insufficient ${fromCurrency} balance`);
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

export const showTransactionHash = (hash, callback) => {
    $('#flint-swap').html('Swap');
    $('#flint-swap').removeClass('button--loading');
    enableButton();
    parent.parent()
        .append(`<a class="fn-lk-sc" target="_blank" href="https://polygonscan.com/tx/${hash}"><p style="margin: 0 5px 0 0; color: rgb(130, 71, 229);">Check transaction status on Polygon Scan</p>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px" fill="rgb(130, 71, 229)">
  <path d="M 5 3 C 3.9069372 3 3 3.9069372 3 5 L 3 19 C 3 20.093063 3.9069372 21 5 21 L 19 21 C 20.093063 21 21 20.093063 21 19 L 21 12 L 19 12 L 19 19 L 5 19 L 5 5 L 12 5 L 12 3 L 5 3 z M 14 3 L 14 5 L 17.585938 5 L 8.2929688 14.292969 L 9.7070312 15.707031 L 19 6.4140625 L 19 10 L 21 10 L 21 3 L 14 3 z"/>
  </svg></a>`);
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
