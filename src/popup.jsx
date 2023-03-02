import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Logo from './assets/gasly.svg';

// const top_currencies = ['bitcoin', 'ethereum']
// const base_currency = 'usd'
const App = () => {
    const [data, setdata] = useState([
        `1. Go to <a href="https://app.uniswap.org/#/swap" target="_blank">Uniswap</a>`,
        '2. Switch to the Polygon network. The beta version only works on Polygon.',
        '3. Swap any ERC20 token to any other ERC20 token. Do not select MATIC as the from or to token. We are working on native token swaps and it should be live soon',
        '4. Select your from token as the gas token in the option ',
        '5. If you are asked to approve the token, click on the button and sign the message on Metamask. This will approve your token for the swap without you needing to pay any MATIC',
        '6. Now click on Swap and confirm. You will need to sign the message on Metamask. Once again, no MATIC will be deducted from your wallet.',
        "7. Congratulations! You've successfully swapped on Uniswap by paying gas fees in an ERC20 token.",
    ]);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_BASE_URL}/mtx/instructions`)
            .then((res) => res.json())
            .then((data) => {
                setdata(data);
            })
            .catch((e) => {
                // setdata(`err - $${e}`)
            });
    }, []);

    return (
        <div
            style={{
                background: 'white',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
            }}
        >
            <div style={{ overflowY: 'scroll', width: '100%', height: '100%' }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column',
                        paddingTop: '20px',
                        backgroundColor: '#0d0d0d',
                        borderBottomLeftRadius: '10px',
                        borderBottomRightRadius: '10px',
                        height: '15%',
                    }}
                >
                    <img src={Logo} width="30px" />
                    <p
                        style={{
                            margin: '10px',
                            color: 'rgb(240, 240, 240)',
                            fontSize: '16px',
                            fontWeight: '600',
                        }}
                    >
                        GasPay
                    </p>
                </div>
                <div
                    style={{
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        paddingLeft: '5%',
                        marginBottom: '5%',
                        marginTop: '7%',
                    }}
                >
                    Instructions:{' '}
                </div>
                {data &&
                    data.map((instruction) => {
                        return (
                            <div
                                style={{
                                    paddingLeft: '5%',
                                    paddingRight: '5%',
                                    marginBottom: '3%',
                                    fontSize: '1rem',
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: instruction,
                                }}
                            ></div>
                        );
                    })}
                <div style={{ marginBottom: '10%' }}></div>
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('fext-root'));
root.render(<App />);
