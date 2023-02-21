import $ from "jquery";
import chooseTokenBlock from "./html/chooseTokenBlock.html";
import swapCheckPopup from "./html/swapCheckPopup.html";
import flintButtonWrapper from "./html/flintButtonWrapper.html";
import { handleSwap, handleApproval, handleTokenChange } from "./flintButtonState";

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

export const showSwapPopup = () => {
    $("#flppbx").fadeIn(200);
};

export const hideSwapPopup = () => {
    $("#flppbx").fadeOut(200);
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
    $("#fl-ck-a1").hide();
    $("#fl-ck-ina1").show();
    $("#fl-ck-a2").show();
    $("#fl-ck-ina2").hide();
};

const select_dapp_for_swap = () => {
    disable_flint();
    $("#fl-ck-a1").show();
    $("#fl-ck-ina1").hide();
    $("#fl-ck-a2").hide();
    $("#fl-ck-ina2").show();
};

export const disableSwapButton = () => {
    $("#flint-swap").css("background-color", "rgb(41, 50, 73)");
    $("#flint-swap").css("color", "rgb(152, 161, 192);");
};

export const enableSwapButton = () => {
    const target = dd2.children("div:nth-child(3)")?.children("div:first-child");
    console.log(target, "target value");
    target?.on({
        DOMSubtreeModified: () => {
            $("#fl-cr-exch-rate").html(target.html());
        },
    });
    $("#flint-swap").css("background-color", "rgb(76, 130, 251)");
    $("#flint-swap").css("color", "rgb(245, 246, 252)");
};

export const showApprove = () => {
    $("#flint-approve").show();
    $("#flint-swap").hide();
}

export const hideApprove = () => {
    $("#flint-approve").hide();
    $("#flint-swap").show();
}

export const showLoaderApprove = () => {
    $("#flint-approve").html("");
    $("#flint-approve").toggleClass("button--loading");
    $("#flint-approve").css("background-color", "rgb(41, 50, 73)");
    $("#flint-approve").css("color", "rgb(152, 161, 192);");
};

export const hideLoaderApprove = () => {
    $("#flint-approve").html("Approve");
    $("#flint-approve").toggleClass("button--loading");
    $("#flint-approve").css("background-color", "rgb(76, 130, 251)");
    $("#flint-approve").css("color", "rgb(245, 246, 252)");
};

const insertPopupHtml = () => {
    $("body").append(swapCheckPopup);
    $(".fl-pop-bk")
        .off()
        .on("click", function () {
            $(this).fadeOut(100);
        });
    $(".fl-pop-cnt")
        .off()
        .on("click", function (e) {
            e.stopPropagation();
        });
    $("#fl-p-cl")
        .off()
        .on("click", function (e) {
            $(".fl-pop-bk").fadeOut(100);
        });
};

const insertGasTokenBlock = () => {
    const main = $("#swap-page");
    if (main && main.length > 0) {
        fromInput = main.children("input:first-child");
        toInput = main.children("input:nth-child(2)");

        console.log(toInput);
        currencySelector1 = main
            .children("div:nth-child(2)")
            ?.children("div:first-child")
            ?.children("div:first-child")
            ?.children("div:first-child")
            ?.children("div:first-child")
            ?.children("button");
        fromInput = currencySelector1.parent().children("input");
        fromInput.on({
            change: () => {
                $("#fl-from-amt").html(fromInput.val());
            },
        });
        console.log(fromInput, "console.log(fromInput);");
        fromCurrency = currencySelector1
            .children("span")
            ?.children("div")
            ?.children("span")
            ?.html();
        fromCurrency = currencySelector1
            .children("span")
            ?.children("div")
            ?.children("span")
            ?.html();
        fromImgSrc = currencySelector1.find("img").attr("src");
        setTimeout(() => {
            fromImgSrc = currencySelector1.find("img").attr("src");
            $("#fl-from-token-im").attr("src", fromImgSrc);
            $("#fl-from-token").html(fromCurrency);
            $("#fl-from-im").attr("src", fromImgSrc);
            $("#fl-from-crr").html(fromCurrency);
        }, 200);
        currencySelector1?.on({
            DOMSubtreeModified: (e) => {
                fromCurrency = currencySelector1
                    .children("span")
                    ?.children("div")
                    ?.children("span")
                    ?.html();
                fromImgSrc = currencySelector1.find("img").attr("src");
                setTimeout(() => {
                    fromImgSrc = currencySelector1.find("img").attr("src");
                    $("#fl-from-token-im").attr("src", fromImgSrc);
                    $("#fl-from-token").html(fromCurrency);
                    $("#fl-from-im").attr("src", fromImgSrc);
                    $("#fl-from-crr").html(fromCurrency);
                }, 200);
                handleTokenChange(fromCurrency, fromInput.val());
            },
        });

        currencySelector2 = main
            .children("div:nth-child(3)")
            ?.children("div:first-child")
            ?.children("div:first-child")
            ?.children("div:first-child")
            ?.children("div:first-child")
            ?.children("div:first-child")
            ?.children("button");
        toInput = currencySelector2.parent().children("input");
        console.log(toInput, "toInput");
        toInput.on("input", function () {
            console.log("new value for to amount", toInput.val());
            $("#fl-to-amt").html(toInput.val());
            // alert($(this).val());
        });
        currencySelector2?.on({
            DOMSubtreeModified: (e) => {
                toCurrency = currencySelector2
                    .children("span")
                    ?.children("div")
                    ?.children("span")
                    ?.html();
                toImgSrc = currencySelector2.find("img").attr("src");
                $("#fl-to-im").attr("src", toImgSrc);
                $("#fl-to-crr").html(toCurrency);
            },
        });

        const dd = main.children("div:nth-child(3)");
        if (dd && dd.length > 0) {
            dd2 = dd.children("div:first-child");
            dd2.children("div:first-child").css("border-bottom", "none");
            dd2.css("border-radius", "12px");
            dd2.css("overflow", "hidden");
            dd2.append(chooseTokenBlock);

            $("#fl-gas-sl2")
                .off()
                .on("click", () => {
                    select_flint_for_swap();
                });

            $("#fl-gas-sl")
                .off()
                .on("click", () => {
                    select_dapp_for_swap();
                });
        }
    }
};

export const addFlintUILayer = (callback) => {
    const swapBtnOriginal = $("#swap-button");
    parent = swapBtnOriginal.parent();

    if (swapBtnOriginal.length > 0) {
        insertPopupHtml();
        insertGasTokenBlock();
    }

    parent.parent().append(flintButtonWrapper);

    $("#flint-swap")
        .off()
        .on("click", function () {
            callback();
        });
    $("#flint-approve")
        .off()
        .on("click", function () {
            handleApproval();
        });
    $("#flint-swap-conf")
        .off()
        .on("click", function () {
            handleSwap();
            hideSwapPopup();
        });
    $("flint-swap-progress").toggleClass("button--loading");

    parentFlint = $("#tg_fl");
    return swapBtnOriginal.length;
};

export const updatePriceValues = () => {
    setTimeout(() => {
        const to = toInput.val();
        const from = fromInput.val();
        if (to.length > 0) {
            $("#fl-to-amt").html(to);
        }
        if (from.length > 0) {
            $("#fl-from-amt").html(from);
        }
    }, 200);
};
