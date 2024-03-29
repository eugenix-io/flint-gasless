import React, { useEffect, useState } from 'react';
import LeftArow from '../assets/img/left_arrow.png';
import RightArrow from '../assets/img/right_arrow.png';
import styled from 'styled-components';
import browser from 'webextension-polyfill';
import axios from 'axios';

const Instructions = () => {
    const [instructions, setInstructions] = useState([
        {
            asset: 'https://dnj9s9rkg1f49.cloudfront.net/first_step.webm',
            title: 'Go to Uniswap',
            text: 'Select Polygon as the network. The GasPay Beta only supports Polygon network',
        },
        {
            asset: 'https://dnj9s9rkg1f49.cloudfront.net/token.webm',
            title: 'Select the swap tokens ',
            text: 'Select the swap tokens and ensure you are swapping at least $0.25 worth of tokens ',
        },
        {
            asset: 'https://dnj9s9rkg1f49.cloudfront.net/approve.webm',
            title: 'Select your gas fees token',
            text: "Gaspay allows you to pay gas in the 'from' token or the native token (MATIC)",
        },
        {
            asset: 'https://dnj9s9rkg1f49.cloudfront.net/approve.webm',
            title: 'Approve the swap',
            text: 'Approve the token by signing the message on Metamask gaslessly',
        },
        {
            asset: 'https://dnj9s9rkg1f49.cloudfront.net/swap_initiate.webm',
            title: 'Confirm the swap',
            text: 'Sign the message to confirm the swap and deduct fees in the selected token.',
        },
        {
            asset: 'https://dnj9s9rkg1f49.cloudfront.net/swap_confirm.webm',
            title: 'Congratulations 🎉',
            text: "You've successfully swapped on Uniswap, paying gas fees in your desired token",
        },
    ]);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        (async () => {
            const result = await axios.get(
                `${
                    process.env.REACT_APP_BACKEND_BASE_URL
                }/v1/config/config?version=${
                    browser.runtime.getManifest().version
                }`
            );
            setInstructions(result.data.instructions);
        })();
    }, []);

    let isLastStep = currentStep == instructions.length - 1;
    return (
        <div>
            <div
                style={{
                    fontSize: '1.4rem',
                    marginBottom: '5%',
                    color: 'white',

                    marginLeft: '5px',
                }}
            >
                How to use Gaspay{' '}
            </div>
            <div
                style={{
                    backgroundColor: '#1C1C1C',
                    border: '1px solid rgb(54 53 53)',
                    borderRadius: '15px',
                    padding: '3.5%',
                    color: 'white',
                }}
            >
                <video
                    style={{ borderRadius: '12px' }}
                    width={'100%'}
                    controls={false}
                    loop
                    autoPlay
                    key={currentStep}
                >
                    <source
                        src={instructions[currentStep].asset}
                        type="video/webm"
                    ></source>
                </video>
                <div
                    style={{
                        fontSize: '1.2rem',
                        marginTop: '20px',
                        height: '30px',
                    }}
                >
                    {instructions[currentStep].title}
                </div>
                <div
                    style={{
                        fontSize: '0.9rem',
                        marginTop: '10px',
                    }}
                >
                    {instructions[currentStep].text}
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: '20px',
                        alignItems: 'center',
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        {instructions.map((_, index) => (
                            <div
                                key={index}
                                style={{
                                    width: '7px',
                                    height: '7px',
                                    backgroundColor: 'white',
                                    borderRadius: '50%',
                                    marginLeft: '4px',
                                    opacity: currentStep == index ? 1 : 0.4,
                                }}
                            ></div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div
                            style={{
                                width: '25px',
                                height: '25px',
                                backgroundColor: 'white',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: '50%',
                                opacity: currentStep == 0 ? 0.4 : 1,
                                pointerEvents:
                                    currentStep == 0 ? 'none' : 'auto',
                            }}
                            onClick={() => setCurrentStep(currentStep - 1)}
                        >
                            <img style={{ width: '30%' }} src={LeftArow}></img>
                        </div>
                        <div
                            style={{
                                width: '25px',
                                height: '25px',
                                backgroundColor: 'white',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: '50%',
                                marginLeft: '5px',
                                opacity:
                                    currentStep == instructions.length - 1
                                        ? 0.4
                                        : 1,
                                pointerEvents: isLastStep ? 'none' : 'auto',
                            }}
                            onClick={() => setCurrentStep(currentStep + 1)}
                        >
                            <img
                                style={{ width: '30%' }}
                                src={RightArrow}
                            ></img>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Instructions;
