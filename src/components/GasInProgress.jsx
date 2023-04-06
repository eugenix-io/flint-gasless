import React from 'react';
import styled from 'styled-components';
import Lottie from 'react-lottie-player';
import lottieJson from '../assets/lottie.json';
import BoxContainer from './BoxContainer.jsx';

const LoaderHeading = styled.div`
    font-style: normal;
    font-weight: 700;
    font-size: 24px;
    line-height: 30px;
    text-align: center;
    color: #f5f5f5;
`;

const LoaderSubheading = styled.div`
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    text-align: center;
    letter-spacing: 0.2px;
    color: #bdbdbd;
    margin: 10px 20px;
`;

const GasInProgress = ({ title, message }) => {
    return (
        <BoxContainer style={{ flex: 1 }}>
            <Lottie
                loop
                animationData={lottieJson}
                play
                style={{ width: '60%', marginLeft: '20px' }}
            />
            {title ? <LoaderHeading>{title}</LoaderHeading> : null}
            {message ? <LoaderSubheading>{message}</LoaderSubheading> : null}
        </BoxContainer>
    );
};

export default GasInProgress;
