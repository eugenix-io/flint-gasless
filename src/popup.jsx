import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import FlintLogo from './assets/flint-logo.svg'
import Uniswap from './assets/uniswap.svg';
import Chain from './assets/chain.svg';
import USDC from './assets/usdc.svg';
import Dropdown from './assets/dropdown.svg';
import USDT from './assets/usdtLogo.svg';
import PolygonLogo from './assets/polygonLogo.svg';
import Ethereum from './assets/ethereum.svg';
import Conversion from './assets/conversion.svg';
import './index.css'
const url = 'https://app.prod.eugenix.io/coin-listing/api/v1/coin-listing/market-chart-data?date_range=ONE_DAY&coins=usdt&coins=usdc&coins=ftm&coins=axs&coins=doge&coins=matic&coins=avax&coins=trx&coins=bch&coins=eth&coins=dai&coins=dot&coins=sol&coins=btc&coins=bnb&coins=gmt&coins=knc&coins=snx&coins=okb';


// const top_currencies = ['bitcoin', 'ethereum']
// const base_currency = 'usd'
const App = () => {

    // const [data, setdata] = useState(undefined);

    const [toggleActive, setToggleActive] = useState(false);

    const toggleDropDown = () => {
        setToggleActive(!toggleActive);
    }
    // useEffect(() => {
    //     fetch(url).then(res => res.json()).then(data => {
    //         setdata(data)
    //     }).catch(e => {
    //         // setdata(`err - $${e}`)
    //     });
    // }, []);

    const getSignatureParameters = (signature) => {
        if (!web3.utils.isHexStrict(signature)) {
          throw new Error(
            'Given value "'.concat(signature, '" is not a valid hex string.')
          );
        }
        var r = signature.slice(0, 66);
        var s = "0x".concat(signature.slice(66, 130));
        var v = "0x".concat(signature.slice(130, 132));
        v = web3.utils.hexToNumber(v);
        if (![27, 28].includes(v)) v += 27;
        return {
          r: r,
          s: s,
          v: v,
        };
      };
    
      const  generateFunctionSignature = (abi) => {
        let iface = new ethers.Interface(abi);
        // Approve amount for spender 1 matic
        return iface.encodeFunctionData("approve", ['0xb2c125eec20aac81a6d2b37f17c252acdb785b54', 1]);
      }
    
      const generate = async () => {
        try {
    
          // get nonce from backend
    
          setLoading(true);
    
          const nonce = await (await axios.get(`https://mtx.flint.money/mtx/get-nonce?wa=${walletAddress}`)).data.nonce;
    
          setLoading(false);
          console.log(nonce, 'Nonce from backend');
          // get the signature
    
          let functionSignature = generateFunctionSignature(USDTAbi);
    
          let message = {
            nonce: parseInt(nonce),
            from: walletAddress,
            functionSignature: functionSignature
          };
    
          const dataToSign = {
            types: {
              EIP712Domain: domainType,
              MetaTransaction: metaTransactionType,
            },
            domain: domainData,
            primaryType: "MetaTransaction",
            message: message,
          };
    
          console.log(dataToSign, 'data t sinff');
    
          const sign = await ethereum.request({
            method: 'eth_signTypedData_v4',
            params: [walletAddress, JSON.stringify(dataToSign)],
          });
    
          console.log(sign, 'Signsgnsngs')
    
          let { r, s, v } = getSignatureParameters(sign);
    
          // Sign the data and get the signature from metamask
    
          // Send R, S, V to backend
    
          console.log(r, s, v, 'RRRRRRR');
    
          // const data = { r, s, v, functionSignature, userAddress: walletAddress }
    
          // setLoading(true);
    
          // const txResp = await axios.post(`https://mtx.flint.money/mtx/send`, data, {
          //   headers: {
          //     'Content-Type': 'application/json'
          //   }
          // });
    
          // setLoading(false);
    
          // const txJson = JSON.parse(txResp.data.data);
          // console.log(txJson, 'Tx json');
          // const hash = txJson["hash"];
    
          // // {
          // //   "_type": "TransactionReceipt",
          // //   "accessList": null,
          // //   "blockNumber": null,
          // //   "blockHash": null,
          // //   "chainId": "137",
          // //   "data": "0x0c53c51c000000000000000000000000d91cf3a4db5e3d9bec904ace91f8c1959ad86bba00000000000000000000000000000000000000000000000000000000000000a00d1a3ad697dd7097e33dbe8aac0a3b0b683cb2b9097eb8a3ba05ce4d72d5f89b0fa6912aa9539fbe80377fac2b1ff5dd093474d603da3846438c7a3c6ffe78d1000000000000000000000000000000000000000000000000000000000000001c0000000000000000000000000000000000000000000000000000000000000044095ea7b3000000000000000000000000b2c125eec20aac81a6d2b37f17c252acdb785b54000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000",
          // //   "from": "0xb2c125eec20aac81a6d2b37f17c252acdb785b54",
          // //   "gasLimit": "200000",
          // //   "gasPrice": "1000000000000",
          // //   "hash": "0xe0eb6b5b7c47020a9c5f711853e532248ff351df31da2827934705478d648b29",
          // //   "maxFeePerGas": null,
          // //   "maxPriorityFeePerGas": null,
          // //   "nonce": 8,
          // //   "to": "0x7FFB3d637014488b63fb9858E279385685AFc1e2",
          // //   "value": "0"
          // // }
    
          // setTx(hash);
    
          // console.log(txResp.data.data, 'transaction...');
        } catch (error) {
          console.log(error, 'Error in generate');
        }
      }
    
      const initiateConnectWallet = async () => {
        if (window.ethereum === null) {
          // If MetaMask is not installed, we use the default provider,
          // which is backed by a variety of third-party services (such
          // as INFURA). They do not have private keys installed so are
          // only have read-only access
          console.log("MetaMask not installed; using read-only defaults");
          provider = ethers.getDefaultProvider();
        } else {
          const provider = new ethers.BrowserProvider(window.ethereum);
          signer = await provider.getSigner();
          console.log(signer.address, 'Sginerfer');
          const currentWalletAddress = signer.address;
          setWalletAddress(currentWalletAddress);
        }
      }

    return (
        <div style={{ background: '#0d0d0d', width: '100%', height: '100%', overflow: 'hidden', padding: 10 }}>
            <div style={{ overflow: 'scroll', width: '100%', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', paddingTop: '20px' }}>
                    <img src={FlintLogo} width="23px" />
                    <span style={{ margin: '10px', color: '#f5f5f5', fontSize: '22px', fontWeight: '600', fontFamily: 'bold' }}>Flint gasless</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    {/* box */}
                    <div style={{ display: 'flex', flex: 3, padding: 10, borderRadius: 10, backgroundColor: '#121212', border: '1px solid #1c1c1c', flexDirection: 'row', alignItems: 'center' }}>
                        <span style={{ color: '#f5f5f5', fontSize: 16, fontFamily: 'regular' }}>Swap</span>
                        <img style={{ marginLeft: 5 }} src={Uniswap} width="18px" />
                    </div>

                    <div style={{ display: 'flex', flex: 1, padding: 10, }}>
                    </div>

                    {/* box */}
                    <div style={{ display: 'flex', flex: 6, padding: 10, borderRadius: 10, backgroundColor: '#121212', border: '1px solid #1c1c1c', flexDirection: 'row', alignItems: 'center' }}>
                        <img style={{ marginLeft: 5 }} src={Chain} width="18px" />
                        <span style={{ color: '#f5f5f5', fontSize: 16, marginLeft: 5, fontFamily: 'regular' }}>0xzwe.....1assd</span>
                    </div>
                </div>

                <div style={{ marginTop: 22 }}>
                    <span style={{ color: '#f5f5f5', fontSize: 16, fontFamily: 'medium' }}>Choose which token to pay</span>
                </div>

                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', flex: 6, padding: 10, borderRadius: 10, backgroundColor: '#121212', border: '1px solid #1c1c1c', flexDirection: 'row', alignItems: 'center' }}>
                    <div style={{ display: 'flex', justifyConent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'red' }}>
                        <span style={{ color: '#f5f5f5', fontSize: 16, marginLeft: 5, fontFamily: 'medium' }}>USDC</span>
                        <img style={{ marginLeft: 5 }} src={USDC} width="24px" />
                    </div>

                    <div onClick={toggleDropDown}>
                        <img id="dd" className="drop-down" src={Dropdown} />
                    </div>
                </div>
                {/* Drop Down options */}
                <div style={{display: toggleActive ? 'flex' : 'none', flexDirection: 'column'}}>
                    <div style={{ marginTop: 20, display: 'flex', padding: 10, borderRadius: 10, backgroundColor: '#121212', border: '1px solid #6DE573', flexDirection: 'row', alignItems: 'center' }}>
                        <img style={{ marginRight: '10px' }} src={USDT} width="39px" />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#f5f5f5', fontSize: 16, fontFamily: 'regular' }}>1.1 USDT</span>
                            <span style={{ color: '#bdbdbd', fontSize: 12, marginTop: 5, fontFamily: 'regular' }}>$1.000</span>
                        </div>
                    </div>

                    <div style={{ marginTop: 20, display: 'flex', padding: 10, borderRadius: 10, backgroundColor: '#121212', border: '1px solid #1c1c1c', flexDirection: 'row', alignItems: 'center' }}>
                        <img style={{ marginRight: '10px' }} src={PolygonLogo} width="39px" />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#f5f5f5', fontSize: 16, fontFamily: 'regular' }}>0.96 Matic</span>
                            <span style={{ color: '#bdbdbd', fontSize: 12, marginTop: 5, fontFamily: 'regular' }}>$1.000</span>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                    <span style={{ color: '#f5f5f5', fontSize: 16, fontFamily: 'medium' }}>Conversion</span>
                </div>

                <div style={{ marginTop: 10, display: 'flex', padding: 10, borderRadius: 10, backgroundColor: '#121212', border: '1px solid #1c1c1c', flexDirection: 'column', }}>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '16px', color: '#bdbdbd', marginBottom: '10px', fontFamily: 'regular' }}>Native</span>
                        <span style={{ fontSize: '16px', color: '#bdbdbd', marginBottom: '10px', fontFamily: 'regular' }}>Converted</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flex: 3, flexDirection: 'column', justifyContent: 'center' }}>
                            <img src={Ethereum} width="53px" />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', flex: 3, alignItems: 'center' }}>
                            <img src={Conversion} width="34px" />
                        </div>

                        <div style={{ display: 'flex', flex: 3, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end' }}>
                            <img src={USDC} width="53px" />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: '10px' }}>
                        <span style={{ fontSize: '16px', color: '#bdbdbd', marginBottom: '10px', fontFamily: 'regular' }}>0.0001 ETH</span>
                        <span style={{ fontSize: '16px', color: '#C4A0FF', marginBottom: '10px', fontFamily: 'regular' }}>1.12 USDC</span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'row', marginTop: '23px' }}>
                    <div style={{ display: 'flex', flex: 4.5, padding: '12px 12px', borderRadius: '50px', backgroundColor: '#ffffff' }}>
                        <span style={{ fontSize: '14px', color: '#000000', fontFamily: 'regular' }}>Pay gas in USDT</span>
                    </div>

                    <div style={{ display: 'flex', flex: 1, borderRadius: '50px' }}>
                    </div>

                    <div style={{ display: 'flex', flex: 4.5, padding: '12px 12px', borderRadius: '50px', border: '0.5px solid #bdbdbd', justifyContent: 'center', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#bdbdbd' }}>Cancel</span>
                    </div>
                </div>

            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <App />
);