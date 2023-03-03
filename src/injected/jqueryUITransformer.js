import $ from 'jquery';
import chooseTokenBlock from './html/chooseTokenBlock.html';
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
import { getTokenBalance } from '../utils/ERC20Utils';

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

let dd2;

let gasInToToken = 0;

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
        $('#fl-to-amt').html(finalPrice);
    }
};

export const disableSwapButton = () => {
    swapButtons.forEach((btn) => {
        $(`#${btn}`).css('background-color', 'rgb(41, 50, 73)');
        $(`#${btn}`).css('color', 'rgb(152, 161, 192);');
        $(`#${btn}`).css('cursor', 'default');
        $(`#${btn}`).css('pointer-events', 'none');
    });
};

export const enableSwapButton = () => {
    const target = dd2
        .children('div:nth-child(3)')
        ?.children('div:first-child');
    target?.on({
        DOMSubtreeModified: () => {
            $('#fl-cr-exch-rate').html(target.html());
        },
    });
    swapButtons.forEach((btn) => {
        $(`#${btn}`).css('background-color', 'rgb(76, 130, 251)');
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
    $('#flint-approve').css('background-color', 'rgb(41, 50, 73)');
    $('#flint-approve').css('color', 'rgb(152, 161, 192);');
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

export const disableService = () => {
    select_dapp_for_swap();
    $('#fl-gas-sl2').addClass('disabled');
    $('#flint-error-message').show();
};

export const enableService = () => {
    select_flint_for_swap();
    $('#fl-gas-sl2').removeClass('disabled');
    $('#flint-error-message').hide();
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
            $('#fl-gas-sl2').click();
        }
    }
};

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
                `Swapping ${fromInput.val()} ${fromCurrency} for ${toInput.val()} ${toCurrency}`
            );
        });
    $('#flint-approve')
        .off()
        .on('click', function () {
            handleApproval();
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
