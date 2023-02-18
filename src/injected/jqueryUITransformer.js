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

const select_flint_for_swap = () => {
    enable_flint();
    $('#fl-ck-a1').hide();
    $('#fl-ck-ina1').show();
    $('#fl-ck-a2').show();
    $('#fl-ck-ina2').hide();
}

const select_dapp_for_swap = () => {
    disable_flint()
    $('#fl-ck-a1').show();
    $('#fl-ck-ina1').hide();
    $('#fl-ck-a2').hide();
    $('#fl-ck-ina2').show();
}

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
      min-height: 58px;
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

    const ht = `
    <div id="flppbx" class="fl-pop-bk" style="display: none;">
        <div class="fl-pop-cnt">
            <div class="fl-pop-hd-br">
                <div class="fl-pop-hd-ttl">Confirm Swap</div>
                <svg id="fl-p-cl" style="cursor: pointer;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-cy="confirmation-close-icon" class="sc-7yzmni-0 ezZlS">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </div>
            <div class="fl-sm-bx">
                <div class="bx">
                    <div style="display: flex;">
                        <div style="flex: 1; font-size: 18px; font-weight: 600;">1</div>
                        <div style="margin-right: 12px;">
                            <img src="./static/media/matic-token-icon.da7b877d.svg">
                        </div>
                        <div>MATIC</div>
                    </div>
                    <div>
                        <div>
                            <div style="">$1.47</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="fl-pop-ddr">
                <div color="#FFFFFF" class="bx">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5D6785" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
                </div>
            </div>
            <div class="fl-sm-bx">
                <div class="bx">
                    <div style="display: flex;">
                        <div style="flex: 1; font-size: 18px; font-weight: 600;">1</div>
                        <div style="margin-right: 12px;">
                            <img src="./static/media/matic-token-icon.da7b877d.svg">
                        </div>
                        <div>MATIC</div>
                    </div>
                    <div>
                        <div>
                            <div style="">$1.47</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    <div />`
    if (swapBtnOriginal.length > 0) {
        $('body').append(ht);
        $(document).on('click', '.fl-pop-bk', function () {
            $(this).fadeOut(100);
        })
        $(document).on('click', '.fl-pop-cnt', function (e) {
            e.stopPropagation();
        })
        $(document).on('click', '#fl-p-cl', function (e) {
            $('.fl-pop-bk').fadeOut(100);
        })
        setTimeout(() => {
            $('#flppbx').fadeIn(100);
        }, 1000);
        const main = $('#swap-page');
        if(main && main.length > 0) {
            const dd = main.children('div:nth-child(3)');
            if(dd && dd.length > 0) {
                const dd2 = dd.children('div:first-child');
                dd2.children('div:first-child').css('border-bottom', 'none');
                dd2.css('border-radius', '12px');
                dd2.css('overflow', 'hidden');
                dd2.append(`<div style="min-height: 60px; width: 100%; background-color: rgb(19, 26, 42); margin-top: -24px; padding: 40px 16px 10px 16px;">
                <div>Choose token for gas fees:</div>
                <div style="display: flex; margin: 10px 0;">
                    <div class="fl-ck-bx-n" id="fl-gas-sl" style="margin-right: 10px;">
                        <img alt="MATIC logo" src="./static/media/matic-token-icon.da7b877d.svg" width="25px" height="25px">
                        <div style="flex: 1; margin-left: 10px; font-size: 18px; font-weight: 600;">MATIC</div>
                        <svg id="fl-ck-a1" width="25px" height="25px" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="9.5" cy="9.5" r="9.5" fill="#00C689"/>
                            <path d="M4.39055 10.96C4.20055 10.77 4.20055 10.45 4.39055 10.25C4.59055 10.06 4.91055 10.06 5.10055 10.25L7.18055 12.33L12.9005 6.60996C13.0905 6.40996 13.4105 6.40996 13.6105 6.60996C13.8005 6.79996 13.8005 7.11996 13.6105 7.31996L7.53055 13.39C7.34055 13.59 7.02055 13.59 6.82055 13.39L4.39055 10.96Z" fill="white"/>
                        </svg>
                        <div id="fl-ck-ina1" style="width: 25px; height: 25px; border-radius: 15px; border: 2px solid #959595; display: none;"></div>
        
                    </div>
                    <div class="fl-ck-bx-n" id="fl-gas-sl2">
                        <img alt="MATIC logo" src="https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/polygon/assets/0xc2132D05D31c914a87C6611C10748AEb04B58e8F/logo.png" width="25px" height="25px" style="border-radius: 15px;">
                        <div style="flex: 1; margin-left: 10px; font-size: 18px; font-weight: 600;">USDT</div>
                        <svg id="fl-ck-a2" style="display: none;" width="25px" height="25px" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="9.5" cy="9.5" r="9.5" fill="#00C689"/>
                            <path d="M4.39055 10.96C4.20055 10.77 4.20055 10.45 4.39055 10.25C4.59055 10.06 4.91055 10.06 5.10055 10.25L7.18055 12.33L12.9005 6.60996C13.0905 6.40996 13.4105 6.40996 13.6105 6.60996C13.8005 6.79996 13.8005 7.11996 13.6105 7.31996L7.53055 13.39C7.34055 13.59 7.02055 13.59 6.82055 13.39L4.39055 10.96Z" fill="white"/>
                        </svg>
                        <div id="fl-ck-ina2" style="width: 25px; height: 25px; border-radius: 15px; border: 2px solid #959595;"></div>
                    </div>
                </div>
                </div>`)
        
                $(document).on('click', '#fl-gas-sl2', () => {
                    select_flint_for_swap()
                });
        
                $(document).on('click', '#fl-gas-sl', () => {
                    select_dapp_for_swap()
                });
            };
        }
    }

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
    // $(
    //     `<div id="new-par"><p style="font-weight: 500; font-size: 16px; margin-left: 12px;">Gas will be paid in</p>${ul}</div>`
    // ).insertBefore(parent);

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
    return swapBtnOriginal.length;
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
