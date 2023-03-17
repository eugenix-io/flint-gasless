import React from 'react';
import styled from 'styled-components';
import Lottie from 'react-lottie-player';
import lottieJson from '../assets/lottie.json';
import BoxContainer from './BoxContainer.jsx';

const LoaderHeading = styled.div`
    font-family: 'Gilmer';
    font-style: normal;
    font-weight: 700;
    font-size: 24px;
    line-height: 30px;
    text-align: center;
    color: #f5f5f5;
`;

const LoaderSubheading = styled.div`
    font-family: 'Gilmer';
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    text-align: center;
    letter-spacing: 0.2px;
    color: #bdbdbd;
`;

const GasInProgress = () => {
    return (
        <BoxContainer>
            <Lottie
                loop
                animationData={lottieJson}
                play
                style={{ width: '50%', marginLeft: '30px' }}
            />
            <LoaderHeading>Gas in progress</LoaderHeading>
            <LoaderSubheading>
                Congratulations, transaction is under processing state
            </LoaderSubheading>
        </BoxContainer>
    );
};

export default GasInProgress;
