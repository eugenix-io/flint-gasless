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

const url = 'https://app.prod.eugenix.io/coin-listing/api/v1/coin-listing/market-chart-data?date_range=ONE_DAY&coins=usdt&coins=usdc&coins=ftm&coins=axs&coins=doge&coins=matic&coins=avax&coins=trx&coins=bch&coins=eth&coins=dai&coins=dot&coins=sol&coins=btc&coins=bnb&coins=gmt&coins=knc&coins=snx&coins=okb';


// const top_currencies = ['bitcoin', 'ethereum']
// const base_currency = 'usd'
const App = () => {

    const [data, setdata] = useState(undefined);

    useEffect(() => {
        fetch(url).then(res => res.json()).then(data => {
            setdata(data)
        }).catch(e => {
            // setdata(`err - $${e}`)
        });
    }, []);

    return (
        <div style={{ background: '#0d0d0d', width: '100%', height: '100%', overflow: 'hidden', padding: 10 }}>
            <div style={{ overflow: 'scroll', width: '100%', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', paddingTop: '20px' }}>
                    <img src={FlintLogo} width="23px" />
                    <p style={{ margin: '10px', color: '#f5f5f5', fontSize: '16px', fontWeight: '600' }}>Flint gasless</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    {/* box */}
                    <div style={{ display: 'flex', flex: 3, padding: 10, borderRadius: 10, backgroundColor: '#121212', border: '1px solid #1c1c1c', flexDirection: 'row', alignItems: 'center' }}>
                        <span style={{ color: '#f5f5f5', fontSize: 16 }}>Swap</span>
                        <img style={{ marginLeft: 5 }} src={Uniswap} width="18px" />
                    </div>

                    <div style={{ display: 'flex', flex: 1, padding: 10, }}>
                    </div>

                    {/* box */}
                    <div style={{ display: 'flex', flex: 6, padding: 10, borderRadius: 10, backgroundColor: '#121212', border: '1px solid #1c1c1c', flexDirection: 'row', alignItems: 'center' }}>
                        <img style={{ marginLeft: 5 }} src={Chain} width="18px" />
                        <span style={{ color: '#f5f5f5', fontSize: 16, marginLeft: 5 }}>0xzwefwefwac.....1assd</span>
                    </div>
                </div>

                <div style={{ marginTop: 22 }}>
                    <span style={{ color: '#f5f5f5', fontSize: 16, }}>Choose which token to pay</span>
                </div>

                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', flex: 6, padding: 10, borderRadius: 10, backgroundColor: '#121212', border: '1px solid #1c1c1c', flexDirection: 'row', alignItems: 'center' }}>
                    <div style={{ display: 'flex', justifyConent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'red' }}>
                        <span style={{ color: '#f5f5f5', fontSize: 16, marginLeft: 5 }}>USDC</span>
                        <img style={{ marginLeft: 5 }} src={USDC} width="24px" />
                    </div>

                    <div>
                        <img src={Dropdown} />
                    </div>
                </div>

                <div style={{ marginTop: 20, display: 'flex', padding: 10, borderRadius: 10, backgroundColor: '#121212', border: '1px solid #6DE573', flexDirection: 'row', alignItems: 'center' }}>
                    <img style={{ marginRight: '10px' }} src={USDT} width="39px" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: '#f5f5f5', fontSize: 16 }}>1.1 USDT</span>
                        <span style={{ color: '#bdbdbd', fontSize: 12, marginTop: 5 }}>$1.000</span>
                    </div>
                </div>

                <div style={{ marginTop: 20, display: 'flex', padding: 10, borderRadius: 10, backgroundColor: '#121212', border: '1px solid #1c1c1c', flexDirection: 'row', alignItems: 'center' }}>
                    <img style={{ marginRight: '10px' }} src={PolygonLogo} width="39px" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: '#f5f5f5', fontSize: 16 }}>0.96 Matic</span>
                        <span style={{ color: '#bdbdbd', fontSize: 12, marginTop: 5 }}>$1.000</span>
                    </div>
                </div>

                <div style={{marginTop: '20px'}}>
                    <span style={{ color: '#f5f5f5', fontSize: 16, }}>Conversion</span>
                </div>

                <div style={{ marginTop: 10, display: 'flex', padding: 10, borderRadius: 10, backgroundColor: '#121212', border: '1px solid #1c1c1c', flexDirection: 'column', }}>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '16px', color: '#bdbdbd', marginBottom: '10px' }}>Native</span>
                        <span style={{ fontSize: '16px', color: '#bdbdbd', marginBottom: '10px' }}>Converted</span>
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
                        <span style={{ fontSize: '16px', color: '#bdbdbd', marginBottom: '10px' }}>0.0001 ETH</span>
                        <span style={{ fontSize: '16px', color: '#C4A0FF', marginBottom: '10px' }}>1.12 USDC</span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'row', marginTop: '23px'}}>
                    <div style={{ display: 'flex', flex: 4.5, padding: '12px 12px', borderRadius: '50px', backgroundColor: '#ffffff'}}>
                        <span style={{ fontSize: '14px', color: '#000000' }}>Pay gas in USDT</span>
                    </div>

                    <div style={{ display: 'flex', flex: 1, borderRadius: '50px'}}>
                    </div>

                    <div style={{ display: 'flex', flex: 4.5, padding: '12px 12px', borderRadius: '50px', border: '0.5px solid #bdbdbd', justifyContent: 'center', alignItems: 'center'}}>
                        <span style={{fontSize: '14px', color: '#bdbdbd' }}>Cancel</span>
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