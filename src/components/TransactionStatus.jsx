import React, { useEffect } from 'react';
import styled from 'styled-components';
import BoxContainer from './BoxContainer.jsx';
import CTA from './CTA.jsx';
import $ from 'jquery';

const Heading = styled.div`
    font-family: 'Gilmer';
    font-style: normal;
    font-weight: 700;
    font-size: 24px;
    line-height: 30px;
    text-align: center;
    color: #f5f5f5;
`;

const SubHeading = styled.div`
    font-family: 'Gilmer';
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    text-align: center;
    letter-spacing: 0.2px;
    color: #bdbdbd;
`;

const CurrencyDetailBlock = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: ${(props) => (props.right ? 'flex-end' : 'flex-start')};
`;

const SectionHeading = styled.div`
    font-family: 'Gilmer';
    font-style: normal;
    font-weight: 600;
    font-size: 16px;
    line-height: 18px;
    color: #bdbdbd;
    opacity: 0.7;
    display: inline-block;
`;

const CurrencyAmount = styled.div`
    font-family: 'Gilmer';
    font-style: normal;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.2px;
    color: #f5f5f5;
    display: inline-block;
    margin-top: 10px;
`;

const BlockHeading = styled.div`
    font-family: 'Gilmer';
    font-style: normal;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.2px;
    color: #f5f5f5;
`;

const Header = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
`;

const ViewStatus = styled.div`
    font-family: 'Gilmer';
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 18px;
    color: #6de573;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
`;

const TimelineContainer = styled.div`
    margin-top: 20px;
    position: relative;
    width: 100%;
    display: none;
`;

const DotContainer = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
`;

const Dot = styled.div`
    width: 16px;
    height: 16px;
    border-radius: 8px;
    background-color: ${(props) => (props.active ? '#D9D9D9' : '#707070')};
`;

const LineContainer = styled.div`
    position: absolute;
    display: flex;
    top: 7px;
    width: 100%;
    left: 0;
`;

const Line = styled.div`
    height: 2px;
    width: 25%;
    background-color: ${(props) => (props.active ? '#D9D9D9' : '#707070')};
`;

const TimelineStatus = styled.p`
    font-family: 'Gilmer';
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 18px;
    color: #e0e0e0;
    opacity: 0.7;
    margin: 30px 0 0 0;
`;

const TransactionStatus = () => {
    return (
        <>
            <Heading>Congratulations</Heading>
            <SubHeading>Your transaction is detected succcessfully!</SubHeading>
            <BoxContainer style={{ marginTop: '20px', flexDirection: 'row' }}>
                <CurrencyDetailBlock>
                    <SectionHeading>From</SectionHeading>
                    <CurrencyChainBlock
                        network={
                            'https://dnj9s9rkg1f49.cloudfront.net/matic.svg'
                        }
                        coin={'https://dnj9s9rkg1f49.cloudfront.net/usdt.svg'}
                    />
                    <CurrencyAmount>0.988 USDT</CurrencyAmount>
                </CurrencyDetailBlock>
                <CurrencyDetailBlock right>
                    <SectionHeading>To</SectionHeading>
                    <CurrencyChainBlock
                        coin={'https://dnj9s9rkg1f49.cloudfront.net/matic.svg'}
                        network={
                            'https://dnj9s9rkg1f49.cloudfront.net/usdt.svg'
                        }
                    />
                    <CurrencyAmount>0.988 USDT</CurrencyAmount>
                </CurrencyDetailBlock>
            </BoxContainer>
            <BoxContainer style={{ marginTop: '20px', alignItems: 'start' }}>
                <Header>
                    <BlockHeading>Transation in progress</BlockHeading>
                    <svg
                        width="18"
                        height="22"
                        viewBox="0 0 18 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M9.75001 3.5V2H11.25C11.4489 2 11.6397 1.92098 11.7803 1.78033C11.921 1.63968 12 1.44891 12 1.25C12 1.05109 11.921 0.860322 11.7803 0.71967C11.6397 0.579018 11.4489 0.5 11.25 0.5H6.75001C6.5511 0.5 6.36033 0.579018 6.21968 0.71967C6.07903 0.860322 6.00001 1.05109 6.00001 1.25C6.00001 1.44891 6.07903 1.63968 6.21968 1.78033C6.36033 1.92098 6.5511 2 6.75001 2H8.25001V3.5C5.93612 3.6935 3.78655 4.7738 2.25055 6.51514C0.714556 8.25647 -0.0889961 10.5241 0.00783681 12.844C0.10467 15.164 1.09439 17.3567 2.77016 18.964C4.44592 20.5713 6.67804 21.4687 9.00001 21.4687C11.322 21.4687 13.5541 20.5713 15.2299 18.964C16.9056 17.3567 17.8953 15.164 17.9922 12.844C18.089 10.5241 17.2855 8.25647 15.7495 6.51514C14.2135 4.7738 12.0639 3.6935 9.75001 3.5ZM13.215 10.055L10.5 12.275C10.5074 12.3498 10.5074 12.4252 10.5 12.5C10.5 12.7967 10.412 13.0867 10.2472 13.3334C10.0824 13.58 9.84812 13.7723 9.57403 13.8858C9.29994 13.9994 8.99834 14.0291 8.70737 13.9712C8.4164 13.9133 8.14913 13.7704 7.93935 13.5607C7.72957 13.3509 7.58671 13.0836 7.52883 12.7926C7.47095 12.5017 7.50066 12.2001 7.61419 11.926C7.72772 11.6519 7.91998 11.4176 8.16665 11.2528C8.41333 11.088 8.70334 11 9.00001 11C9.18747 11.0005 9.37317 11.0361 9.54751 11.105L12.285 8.915C12.3605 8.84371 12.45 8.78888 12.5479 8.75399C12.6457 8.7191 12.7497 8.70491 12.8533 8.71231C12.9569 8.71971 13.0578 8.74854 13.1497 8.79698C13.2415 8.84542 13.3223 8.91242 13.3869 8.99372C13.4516 9.07502 13.4986 9.16885 13.5251 9.26928C13.5515 9.36971 13.5569 9.47454 13.5407 9.57713C13.5245 9.67972 13.4872 9.77783 13.4312 9.86526C13.3751 9.95268 13.3015 10.0275 13.215 10.085V10.055Z"
                            fill="#A9A9A9"
                        />
                    </svg>
                </Header>
                <ViewStatus
                    onClick={() => {
                        $('#progress-timeline').slideToggle(200);
                    }}
                >
                    View status
                    <svg
                        style={{ marginLeft: '8px', marginTop: '2px' }}
                        width="6"
                        height="10"
                        viewBox="0 0 6 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M1.75003 9.16681C1.64036 9.16745 1.53164 9.14642 1.43011 9.10495C1.32858 9.06348 1.23623 9.00238 1.15836 8.92514C1.08026 8.84767 1.01826 8.75551 0.975955 8.65396C0.933647 8.55241 0.911865 8.44349 0.911865 8.33348C0.911865 8.22347 0.933647 8.11455 0.975955 8.013C1.01826 7.91145 1.08026 7.81928 1.15836 7.74181L3.9167 5.00014L1.2667 2.24181C1.11149 2.08568 1.02437 1.87447 1.02437 1.65431C1.02437 1.43416 1.11149 1.22295 1.2667 1.06681C1.34417 0.988704 1.43633 0.926709 1.53788 0.884401C1.63943 0.842094 1.74835 0.820312 1.85836 0.820312C1.96837 0.820312 2.0773 0.842094 2.17884 0.884401C2.28039 0.926709 2.37256 0.988704 2.45003 1.06681L5.6667 4.40014C5.81939 4.55592 5.90491 4.76535 5.90491 4.98348C5.90491 5.2016 5.81939 5.41104 5.6667 5.56681L2.33336 8.90014C2.25857 8.98092 2.1685 9.04608 2.06838 9.09185C1.96826 9.13762 1.86006 9.1631 1.75003 9.16681Z"
                            fill="#52A656"
                        />
                    </svg>
                </ViewStatus>
                <TimelineContainer id="progress-timeline">
                    <DotContainer>
                        <Dot active />
                        <Dot />
                        <Dot />
                        <Dot />
                    </DotContainer>
                    <LineContainer>
                        <Line />
                        <Line />
                        <Line />
                        <Line />
                    </LineContainer>
                    <TimelineStatus>Current: Yet to be detected</TimelineStatus>
                </TimelineContainer>
            </BoxContainer>

            <CTA style={{ marginTop: '20px' }}>Request another</CTA>
        </>
    );
};

const Currency = styled.img`
    width: 55px;
    height: 55px;
    border-radius: 30px;
`;
const Network = styled.img`
    position: absolute;
    bottom: 0;
    right: 0;
    width: 25px;
    height: 25px;
    border-radius: 15px;
`;
const BlockContainer = styled.div`
    position: relative;
    width: 55px;
    margin-top: 15px;
`;

const CurrencyChainBlock = ({ network, coin }) => {
    return (
        <BlockContainer>
            <Currency src={coin}></Currency>
            <Network src={network}></Network>
        </BlockContainer>
    );
};

export default TransactionStatus;
