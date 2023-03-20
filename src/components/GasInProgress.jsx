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
    margin: 20px;
`;

const GasInProgress = ({ title, message }) => {
    return (
        <BoxContainer style={{ flex: 1 }}>
            <Lottie
                loop
                animationData={lottieJson}
                play
                style={{ width: '50%', marginLeft: '30px' }}
            />
            {title ? <LoaderHeading>{title}</LoaderHeading> : null}
            {message ? <LoaderSubheading>{message}</LoaderSubheading> : null}
        </BoxContainer>
    );
};

export default GasInProgress;
