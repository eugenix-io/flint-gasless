import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import FlintLogo from './assets/flint-logo.svg'

const url = 'https://app.prod.eugenix.io/coin-listing/api/v1/coin-listing/market-chart-data?date_range=ONE_DAY&coins=usdt&coins=usdc&coins=ftm&coins=axs&coins=doge&coins=matic&coins=avax&coins=trx&coins=bch&coins=eth&coins=dai&coins=dot&coins=sol&coins=btc&coins=bnb&coins=gmt&coins=knc&coins=snx&coins=okb'

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
        <div style={{background: '#0d0d0d', width: '100%', height: '100%', overflow: 'hidden'}}>
            <div style={{ overflow: 'scroll', width: '100%', height: '100%' }}>
                <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column', paddingTop: '20px'}}>
                    <img src={FlintLogo} width="23px" />
                    <p style={{margin: '10px', color: 'rgb(240, 240, 240)', fontSize: '16px', fontWeight: '600'}}>Flint</p>
                </div>
                {data !== undefined && <div>
                    {
                        Object.keys(data.coins).map((k, i) => {
                            const coin = data.coins[k]
                            return <div key={i} style={{ display: 'flex', color: 'rgb(240, 240, 240)', margin: '16px' }} id={k}>
                                <img src={coin.markets_data.image} style={{width: '35px', height: '35px', borderRadius: '25px', marginRight: '12px'}} />
                                <div style={{flex: 1, display: 'flex', justifyContent: 'center', flexDirection: 'column'}}>
                                    <p style={{margin: '0', fontSize: '12px', fontWeight: '400'}}>{coin.markets_data.name}</p>
                                    <p style={{margin: '0', fontSize: '12px', fontWeight: '600'}}>{coin.markets_data.symbol}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {/* <p style={{margin: '0', textAlign: 'right', fontSize: '12px'}}>Price</p> */}
                                    <p style={{margin: '0', textAlign: 'right', fontSize: '16px', fontWeight: '700'}}>${coin.markets_data.current_price}</p>
                                </div>
                            </div>
                        })
                    }
                </div>}
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <App />
);