import $ from "jquery";

let parent;
let parentFlint;

const enable_flint = () => {
    parent.hide();
    parentFlint.show();
};

const disable_flint = () => {
    parent.show();
    parentFlint.hide();
};

export const disableBtn = () => {
    $("#flint-swap").css("background-color", "rgb(41, 50, 73)");
    $("#flint-swap").css("color", "rgb(152, 161, 192);");
};

export const enableButton = () => {
    $("#flint-swap").css("background-color", "rgb(76, 130, 251)");
    $("#flint-swap").css("color", "rgb(245, 246, 252)");
};

export const addFlintUILayer = (callback) => {
    const swapBtnOriginal = $("#swap-button");
    parent = swapBtnOriginal.parent();
    // parent.hide();
    const css = `background-color: rgb(41, 50, 73);
      font-size: 20px;
      font-weight: 600;
      padding: 16px;
      border: none;
      width: 100%;
      cursor: pointer;
      position: relative;
      min-height: 56.5px;
      border-radius: 20px;
      color: rgb(152, 161, 192);`;
    const btn = `<button id="flint-swap" style="${css}">Swap</button>`;
    // const btn2 = `<button id="flint-swap" class="button--loading" style="${css2}"></button>`;
    //   const ul = `<ul id="gas-selector" style="list-style-type: none; padding: 0;">
    //   <li>
    //     <input id="gas-matic" type="radio" name="selector" checked="checked">
    //     <label for="gas-matic" style="font-weight: 500; font-size: 16px;">MATIC</label>
    //     <div class="check"><div class="inside"></div></div>
    //   </li>

    //   <li>
    //     <input id="gas-dai" type="radio" name="selector">
    //     <label for="gas-dai" style="font-weight: 500; font-size: 16px;">DAI</label>

    //     <div class="check"><div class="inside"></div></div>
    //   </li>

    //   <li>
    //     <input id="gas-usdt" type="radio" name="selector">
    //     <label for="gas-usdt" style="font-weight: 500; font-size: 16px;">USDT</label>

    //     <div class="check"><div class="inside"></div></div>
    //   </li>
    // </ul>`;
    const ul = `<ul id="gas-selector" style="list-style-type: none; padding: 0;">
      <li>
        <input id="gas-matic" type="radio" name="selector" checked="checked">
        <label for="gas-matic" style="font-weight: 500; font-size: 16px;">MATIC</label>
        <div class="check"><div class="inside"></div></div>
      </li>
      <li>
        <input id="gas-usdt" type="radio" name="selector">
        <label for="gas-usdt" style="font-weight: 500; font-size: 16px;">USDT</label>
        
        <div class="check"><div class="inside"></div></div>
      </li>
    </ul>`;
    $(
        `<div id="new-par"><p style="font-weight: 500; font-size: 16px; margin-left: 12px;">Gas will be paid in</p>${ul}</div>`
    ).insertBefore(parent);

    parent.parent().append(`<div id="tg_fl" style="display: none;">${btn}</div>`);

    $(document).on("click", "#flint-swap", function () {
        callback();
    });

    parentFlint = $("#tg_fl");

    $(document).on("change", "#gas-selector", function () {
        if ($("#gas-matic:checked").val()) {
            disable_flint();
        } else {
            enable_flint();
        }
    });
};

export const beginTransactionLoader = (callback) => {
    if ($("#gas-usdt:checked").val()) {
        console.log("swapping using USDT as gas");
        $("#flint-swap").html('')
        $("#flint-swap").toggleClass('button--loading')
        $(".fn-lk-sc").remove();
        disableBtn();
        callback();
    }
}

export const showTransactionHash = (hash, callback) => {
    $("#flint-swap").html('Swap')
    $("#flint-swap").toggleClass('button--loading')
    enableButton()
    parent.parent().append(`<a class="fn-lk-sc" target="_blank" href="https://polygonscan.com/tx/${hash}"><p style="margin: 0 5px 0 0; color: rgb(130, 71, 229);">Check transaction status on Polygon Scan</p>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px" fill="rgb(130, 71, 229)">
  <path d="M 5 3 C 3.9069372 3 3 3.9069372 3 5 L 3 19 C 3 20.093063 3.9069372 21 5 21 L 19 21 C 20.093063 21 21 20.093063 21 19 L 21 12 L 19 12 L 19 19 L 5 19 L 5 5 L 12 5 L 12 3 L 5 3 z M 14 3 L 14 5 L 17.585938 5 L 8.2929688 14.292969 L 9.7070312 15.707031 L 19 6.4140625 L 19 10 L 21 10 L 21 3 L 14 3 z"/>
  </svg></a>`);
    callback()
}
