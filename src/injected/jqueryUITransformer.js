import $ from "jquery";
import chooseTokenBlock from "./html/chooseTokenBlock.html";
import swapCheckPopup from "./html/swapCheckPopup.html";
import transactionWaiting from "./html/transactionWaiting.html";
import flintButtonWrapper from "./html/flintButtonWrapper.html";
import signatureRejectPopup from "./html/signatureRejectPopup.html";
import transactionSuccessPopup from "./html/transactionSuccessPopup.html";
import { handleSwap } from "./flintButtonState";

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

export const showTransactionSuccessPopup = () => {
  $("#flppbxtrasuc").fadeIn(200);
};

export const hideTransactionSuccessPopup = () => {
  $("#flppbxtrasuc").fadeOut(200);
};

export const showRejectPopup = () => {
  $("#flppbxsigrj").fadeIn(200);
};

export const hideRejectPopup = () => {
  $("#flppbxsigrj").fadeOut(200);
};

export const showWaitingPopup = () => {
  $("#flppbxwtg").fadeIn(200);
};

export const hideWaitingPopup = () => {
  $("#flppbxwtg").fadeOut(200);
};

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

export const switchToSwap = () => {
  $("#flint-approve").hide();
  $("#flint-swap").show();
};

const switchToApprove = () => {
  $("#flint-approve").show();
  $("#flint-swap").hide();
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

export const disableBtn = () => {
  $("#flint-swap").css("background-color", "rgb(41, 50, 73)");
  $("#flint-swap").css("color", "rgb(152, 161, 192);");
};

export const enableButton = () => {
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

const insertPopupHtml = () => {
  $("body").append(swapCheckPopup);
  $("body").append(transactionWaiting);
  $("body").append(signatureRejectPopup);
  $("body").append(transactionSuccessPopup);
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
  $(".fl-p-cl")
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
        setTimeout(() => {
          toImgSrc = currencySelector2.find("img").attr("src");
          $("#fl-to-im").attr("src", toImgSrc);
          $("#fl-to-crr").html(toCurrency);
        }, 200);
      },
    });
    main
      .children("div:nth-child(3)")
      ?.children("div:first-child")
      ?.on({
        DOMSubtreeModified: (e) => {
          setTimeout(() => {
            if (fromInput.val() && fromInput.val() > 0) {
              $("#fl-from-amt").html(fromInput.val());
            }
            if (toInput.val() && toInput.val() > 0) {
              $("#fl-from-amt").html(toInput.val());
            }
          }, 200);
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
  $("#flint-swap-conf")
    .off()
    .on("click", function () {
      handleSwap();
      hideSwapPopup();
      showWaitingPopup();
      $("#fl-swp-for").html(
        `Swapping ${fromInput.val()} ${fromCurrency} for ${toInput.val()} ${toCurrency}`
      );
    });

  parentFlint = $("#tg_fl");
  return swapBtnOriginal.length;
};

export const startPreloader = () => {
  console.log("starting preloader...");
  $("#flint-swap").html("");
  $("#flint-swap").toggleClass("button--loading");
};

export const beginTransactionLoader = (callback) => {
  console.log("swapping using USDT as gas");
  $("#flint-swap-conf").html("");
  $("#flint-swap-conf").toggleClass("button--loading");
  $(".fn-lk-sc").remove();
  disableBtn();
  callback();
};

export const beginApprovalTransactionLoader = (callback) => {
  if ($("#gas-usdt:checked").val()) {
    console.log("Starting approval call");
    $("#flint-approve").html("");
    $("#flint-approve").toggleClass("button--loading");
    $(".fn-lk-sc").remove();
    // disableBtn();
    callback();
  }
};

export const showTransactionHash = (hash, callback) => {
  $("#flint-swap").html("Swap");
  $("#flint-swap").toggleClass("button--loading");
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
      $("#fl-to-amt").html(to);
    }
    if (from.length > 0) {
      $("#fl-from-amt").html(from);
    }
  }, 200);
};
