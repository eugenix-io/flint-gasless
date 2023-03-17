import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Logo from './assets/gasly.svg';
import styled from 'styled-components';
import Instructions from './components/Instructions.jsx';
import Faucet from './components/Faucet.jsx';

const PopupContainer = styled.div`
    background: black;
    width: 100%;
    height: 100%;
    overflow: hidden;
`;

const LogoContainer = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    margin-top: 8%;
    margin-bottom: 3%;
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
    font-family: GilmerMedium;
    color: ${(props) => (props.selected ? 'black' : 'white')};
    background-color: ${(props) => (props.selected ? 'white' : 'transparent')};
    font-size: 1.1rem;
    padding-top: 3%;
    padding-bottom: 3%;
    width: 50%;
    border-radius: 50px;
    text-align: center;
`;

const BodyContainer = styled.div`
    padding: 5%;
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

const App = () => {
    const [navbarSelected, setNavbarSelected] = useState(1);
    return (
        <PopupContainer>
            <Navbar>
                {navbarItems.map((item, index) => (
                    <NavbarItem
                        key={index}
                        selected={index == navbarSelected}
                        onClick={() => setNavbarSelected(index)}
                    >
                        {item.title}
                    </NavbarItem>
                ))}
            </Navbar>
            <BodyContainer>
                {/* {navbarItems.map((item, index) => {
                    if (index == navbarSelected) {
                        return item.component;
                    }
                })} */}
                {navbarItems.length > navbarSelected &&
                    navbarItems[navbarSelected].component}
            </BodyContainer>
        </PopupContainer>
    );
};

const root = ReactDOM.createRoot(document.getElementById('fext-root'));
root.render(<App />);
