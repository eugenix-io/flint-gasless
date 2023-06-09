import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Logo from './assets/gasly.svg';
import styled from 'styled-components';
import Instructions from './components/Instructions.jsx';
import Faucet from './components/Faucet.jsx';
import BoxContainer from './components/BoxContainer.jsx';
import TransactionHistory from './components/TransactionHistory.jsx';
// import {
//     getnewPendingTransaction,
//     getWalletAddress,
//     removePendingTransaction,
// } from './utils/StorageUtils';
import PendingTransaction from './components/PendingTransaction.jsx';
import axios from 'axios';

const PopupContainer = styled.div`
    background: black;
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
`;

const LogoContainer = styled.div`
    border: 1px solid #1c1c1c;
    border-radius: 30px;
    background-color: #121212;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
`;

const Navbar = styled.div`
    width: 90%;
    background-color: #121212;
    margin: auto;
    border-radius: 50px;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    border: 1px solid rgb(54 53 53);
    margin-top: 4%;
`;

const NavbarItem = styled.div`
    color: ${(props) => (props.selected ? 'black' : 'white')};
    background-color: ${(props) => (props.selected ? 'white' : 'transparent')};
    font-size: 1.1rem;
    padding-top: 3%;
    padding-bottom: 3%;
    width: 50%;
    border-radius: 50px;
    text-align: center;
    cursor: pointer;
`;

const BodyContainer = styled.div`
    padding: 5%;
`;

const AppHeader = styled.div`
    padding: 15px 5% 0;
    display: flex;
    justify-content: space-between;
`;

const AppLogo = styled.img`
    width: 20px;
    height: 20px;
`;

const navbarItems = [
    {
        title: 'Uniswap',
        component: <Instructions></Instructions>,
    },
    {
        title: 'Faucet',
        component: <Faucet></Faucet>,
    },
];

const HistoryButton = ({ close, setClose }) => {
    return (
        <LogoContainer
            onClick={() => {
                setClose(!close);
            }}
        >
            {!close ? (
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M4 10.0062C4 9.65266 4.02344 9.29914 4.07031 8.94758C4.06055 9.01594 4.05078 9.08625 4.04297 9.15461C4.13672 8.45735 4.32422 7.7757 4.59766 7.12727C4.57227 7.18977 4.54492 7.25227 4.51953 7.31477C4.78516 6.68977 5.13086 6.10188 5.54492 5.56281L5.42188 5.72102C5.83594 5.18781 6.31445 4.70735 6.84766 4.29328L6.68945 4.41633C7.23438 3.99641 7.83008 3.6468 8.46484 3.37922C8.40234 3.40461 8.33984 3.43195 8.27734 3.45735C8.91797 3.18977 9.5918 3.00617 10.2813 2.91242C10.2129 2.92219 10.1426 2.93195 10.0742 2.93977C10.7754 2.84797 11.4883 2.84797 12.1895 2.93977C12.1211 2.93 12.0508 2.92024 11.9824 2.91242C12.6797 3.00617 13.3613 3.19367 14.0098 3.46711C13.9473 3.44172 13.8848 3.41438 13.8223 3.38899C14.4473 3.65461 15.0352 4.00031 15.5723 4.41438L15.4141 4.29133C15.9473 4.70539 16.4258 5.18391 16.8398 5.71711L16.7168 5.55891C17.1309 6.09602 17.4766 6.68391 17.7422 7.30891C17.7168 7.24641 17.6895 7.18391 17.6641 7.12141C17.9375 7.76985 18.123 8.45149 18.2188 9.14875C18.209 9.08039 18.1992 9.01008 18.1914 8.94172C18.2832 9.64289 18.2832 10.3558 18.1914 11.057C18.2012 10.9886 18.2109 10.9183 18.2188 10.8499C18.125 11.5472 17.9375 12.2288 17.6641 12.8773C17.6895 12.8148 17.7168 12.7523 17.7422 12.6898C17.4766 13.3148 17.1309 13.9027 16.7168 14.4398L16.8398 14.2816C16.426 14.8145 15.947 15.2935 15.4141 15.7073L15.5723 15.5843C15.0352 15.9984 14.4473 16.3441 13.8223 16.6097C13.8848 16.5843 13.9473 16.557 14.0098 16.5316C13.3613 16.805 12.6797 16.9905 11.9824 17.0863C12.0508 17.0765 12.1211 17.0667 12.1895 17.0589C11.4805 17.1527 10.7617 17.1507 10.0527 17.057C10.1211 17.0667 10.1914 17.0765 10.2598 17.0843C9.57617 16.9905 8.9082 16.8089 8.27344 16.5413C8.33594 16.5667 8.39844 16.5941 8.46094 16.6195C7.83203 16.3538 7.23828 16.0081 6.69727 15.5921L6.85547 15.7152C6.31836 15.2991 5.83594 14.8187 5.41992 14.2816L5.54297 14.4398C5.52539 14.4163 5.50781 14.3929 5.49023 14.3714C5.36133 14.2015 5.23633 14.0706 5.02344 14.012C4.83594 13.9613 4.58789 13.9847 4.42187 14.0902C4.25586 14.1976 4.10742 14.3577 4.0625 14.557C4.01953 14.7484 4.01758 14.9964 4.14062 15.1585C4.42187 15.5296 4.7168 15.8851 5.04883 16.2093C5.37305 16.5277 5.72656 16.8148 6.0957 17.0804C6.79883 17.5902 7.58984 17.9808 8.41406 18.2562C10.0215 18.7933 11.8066 18.8284 13.4395 18.3812C14.918 17.9749 16.291 17.1624 17.3594 16.0628C18.4316 14.9573 19.2188 13.555 19.5781 12.0511C19.9492 10.5003 19.8984 8.8343 19.3984 7.31672C18.918 5.85774 18.0566 4.51985 16.9023 3.50422C15.7402 2.48274 14.3164 1.75227 12.791 1.46906C11.2227 1.17805 9.57227 1.28742 8.07812 1.8636C6.64453 2.41633 5.34766 3.31867 4.38672 4.5257C3.9082 5.12727 3.49414 5.76985 3.1875 6.47883C2.87305 7.20735 2.64258 7.95344 2.53516 8.74055C2.47852 9.16242 2.4375 9.58039 2.4375 10.0062C2.4375 10.4144 2.79688 10.807 3.21875 10.7874C3.64258 10.7679 3.99805 10.4437 4 10.0062Z"
                        fill="white"
                    />
                    <path
                        d="M6.71484 7.13058C6.26953 7.37863 5.82226 7.62668 5.37695 7.87668C4.66992 8.27121 3.96093 8.66574 3.2539 9.06027C3.09179 9.15011 2.92773 9.24191 2.76562 9.33175C3.12109 9.4255 3.47851 9.51925 3.83398 9.613C3.58593 9.16769 3.33789 8.72043 3.08789 8.27511C2.69531 7.56613 2.30078 6.8591 1.90625 6.15207C1.8164 5.98996 1.72461 5.8259 1.63476 5.66379C1.43554 5.30636 0.916012 5.15793 0.566403 5.38254C0.205075 5.61496 0.0722621 6.07004 0.285153 6.45089C0.5332 6.89621 0.781246 7.34347 1.03125 7.78879C1.42578 8.49582 1.82031 9.20285 2.21289 9.91183C2.30273 10.0739 2.39453 10.238 2.48437 10.4001C2.69336 10.7732 3.18945 10.8825 3.55273 10.6814C3.99804 10.4333 4.44531 10.1853 4.89062 9.93527C5.59765 9.54074 6.30664 9.14621 7.01367 8.75168C7.17578 8.66183 7.33984 8.57004 7.50195 8.48019C7.85937 8.28097 8.00781 7.76144 7.7832 7.41183C7.55078 7.0505 7.09765 6.91769 6.71484 7.13058ZM10.3477 5.44308V9.63449C10.3477 9.97433 10.3184 10.2771 10.5801 10.5583C10.707 10.6931 10.8418 10.82 10.9727 10.9509L12.7832 12.7614C13.2246 13.2028 13.6621 13.6501 14.1074 14.0857L14.1289 14.1071C14.418 14.3962 14.9492 14.4177 15.2344 14.1071C15.5215 13.7946 15.543 13.3103 15.2344 13.0017L14.0332 11.8005L12.1191 9.88644L11.6797 9.44699C11.7559 9.63058 11.832 9.81613 11.9082 9.99972V5.44308C11.9082 5.03488 11.5488 4.6423 11.1269 4.66183C10.7051 4.68136 10.3477 5.00558 10.3477 5.44308Z"
                        fill="white"
                    />
                </svg>
            ) : (
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M7.70098 6L11.6623 2.03866C11.8814 1.81178 12.0027 1.50792 12 1.1925C11.9972 0.877093 11.8707 0.575376 11.6477 0.352338C11.4246 0.1293 11.1229 0.00278631 10.8075 4.54747e-05C10.4921 -0.00269536 10.1882 0.118556 9.96134 0.337685L6 4.29902L2.03866 0.337685C1.81178 0.118556 1.50792 -0.00269536 1.1925 4.54747e-05C0.877093 0.00278631 0.575376 0.1293 0.352338 0.352338C0.1293 0.575376 0.00278631 0.877093 4.54747e-05 1.1925C-0.00269536 1.50792 0.118556 1.81178 0.337685 2.03866L4.29902 6L0.337685 9.96134C0.118556 10.1882 -0.00269536 10.4921 4.54747e-05 10.8075C0.00278631 11.1229 0.1293 11.4246 0.352338 11.6477C0.575376 11.8707 0.877093 11.9972 1.1925 12C1.50792 12.0027 1.81178 11.8814 2.03866 11.6623L6 7.70098L9.96134 11.6623C10.1882 11.8814 10.4921 12.0027 10.8075 12C11.1229 11.9972 11.4246 11.8707 11.6477 11.6477C11.8707 11.4246 11.9972 11.1229 12 10.8075C12.0027 10.4921 11.8814 10.1882 11.6623 9.96134L7.70098 6Z"
                        fill="white"
                    />
                </svg>
            )}
        </LogoContainer>
    );
};

const ScreenContainer = ({
    navbarSelected,
    setNavbarSelected,
    historyPage,
}) => {
    const [showNavbar, setShowNavbar] = useState(false);
    useEffect(() => {
        (async () => {
            const result = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/faucet/v1/config/config`
            );
            if (result.data.faucetActive) {
                setShowNavbar(true);
            }
        })();
    }, []);
    return (
        <>
            {historyPage ? (
                <TransactionHistory></TransactionHistory>
            ) : (
                <>
                    {showNavbar && (
                        <BoxContainer
                            style={{
                                flexDirection: 'row',
                                borderRadius: '50px',
                                padding: '5px',
                                margin: '4% 5% 0 5%',
                            }}
                        >
                            {navbarItems.map((item, index) => (
                                <NavbarItem
                                    key={index}
                                    selected={index == navbarSelected}
                                    onClick={() => setNavbarSelected(index)}
                                >
                                    {item.title}
                                </NavbarItem>
                            ))}
                        </BoxContainer>
                    )}
                    <BodyContainer>
                        {navbarItems.length > navbarSelected &&
                            navbarItems[navbarSelected].component}
                    </BodyContainer>
                </>
            )}
        </>
    );
};

const App = () => {
    const [navbarSelected, setNavbarSelected] = useState(0);
    const [historyPage, setHistoryPage] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [newTrasaction, setNewTransaction] = useState(false);
    const [pendingTransactioHash, setPendingTrasactionHash] = useState('');

    useEffect(() => {
        const walletAdd = async () => {
            const wallet = await getWalletAddress();
            setWalletAddress(wallet);
        };
        const chekNewTransaction = async () => {
            const hash = await getnewPendingTransaction();
            if (hash) {
                setNewTransaction(true);
                removePendingTransaction();
                setPendingTrasactionHash(hash);
            }
        };

        chekNewTransaction();

        walletAdd();
    }, []);

    return (
        <PopupContainer>
            {newTrasaction ? (
                <PendingTransaction
                    hash={pendingTransactioHash}
                    setNewTransaction={setNewTransaction}
                    setHistoryPage={setHistoryPage}
                />
            ) : (
                <>
                    <AppHeader>
                        <LogoContainer>
                            <AppLogo src={Logo} />
                        </LogoContainer>
                        <HistoryButton
                            close={historyPage}
                            setClose={setHistoryPage}
                        />
                    </AppHeader>
                    {walletAddress ? (
                        <BoxContainer
                            style={{
                                padding: '10px',
                                margin: '20px 20px 0',
                                borderRadius: '20px',
                                color: '#F5F5F5',
                                fontWeight: 600,
                            }}
                        >
                            {walletAddress}
                        </BoxContainer>
                    ) : null}
                    <ScreenContainer
                        navbarSelected={navbarSelected}
                        setNavbarSelected={setNavbarSelected}
                        historyPage={historyPage}
                    />
                </>
            )}
        </PopupContainer>
    );
};

const root = ReactDOM.createRoot(document.getElementById('fext-root'));
root.render(<App />);
