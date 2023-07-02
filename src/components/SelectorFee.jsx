import React, { useState } from 'react';

export const SelectorFee = () => {
    const [selectedOption, setSelectedOption] = useState('option1');
    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const divStyle1 = {
        width: '170px',
        height: '50px',
        position: 'absolute',
        top: '64px',
        left: '25px',
        padding: '14px 13.999994277954102px 13px 14.3111572265625px',
        borderRadius: '10px',
        gap: '11.777777671813965px',
        background: '#212121',

        // Add any other necessary styles for the div component
        // For example, you can add the background color, border, etc.
    };
    const divStyle2 = {
        width: '170px',
        height: '50px',
        position: 'absolute',
        top: '64px',
        left: '215px',
        padding: '14px 13.999994277954102px 13px 14.3111572265625px',
        borderRadius: '10px',
        gap: '11.777777671813965px',
        background: '#212121',

        // Add any other necessary styles for the div component
        // For example, you can add the background color, border, etc.
    };
    const inputStyle = {
        width: '40%',
        height: '40%',
        // top: ' 15px',
        left: '100.977783203125px',
        position: 'absolute',
        background: '#00C689',
    };
    const currencyStyle = {
        width: '80.24px',
        height: '23px',
        top: '14px',
        left: '14.3111572265625px',
        gap: '8.244443893432617px',
    };
    return (
        <div>
            <div style={divStyle1}>
                <div style={currencyStyle}>
                    <div style={{ width: '22px', height: '21px' }}>
                        <svg
                            width="23"
                            height="21"
                            viewBox="0 0 23 21"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g filter="url(#filter0_i_30_3190)">
                                <circle
                                    cx="11.5891"
                                    cy="10.3444"
                                    r="10.3444"
                                    fill="#00C689"
                                />
                            </g>
                            <path
                                d="M11.7196 9.01599C14.856 9.01599 16.4801 9.87072 16.6761 10.1464C16.4801 10.4222 14.884 10.8357 11.7196 10.8357C8.5833 10.8357 6.95913 10.4222 6.76311 10.1464C6.95913 9.84315 8.5833 9.01599 11.7196 9.01599ZM11.7196 8.79541C8.72331 8.79541 6.31506 9.402 6.31506 10.1464C6.31506 10.8909 8.72331 11.4975 11.7196 11.4975C14.7159 11.4975 17.1242 10.8909 17.1242 10.1464C17.1242 9.402 14.7159 8.79541 11.7196 8.79541Z"
                                fill="white"
                            />
                            <path
                                d="M12.9785 10.5914V9.04733C12.5865 9.01976 12.1664 8.99219 11.7464 8.99219C11.3543 8.99219 10.9903 8.99219 10.6263 9.01976V10.5638C10.9623 10.5638 11.3543 10.5914 11.7464 10.5914C12.1664 10.6189 12.5865 10.6189 12.9785 10.5914ZM11.7184 11.5012C11.3263 11.5012 10.9623 11.5012 10.5983 11.4737V15.5819H12.9505V11.4461C12.5585 11.4737 12.1384 11.5012 11.7184 11.5012Z"
                                fill="white"
                            />
                            <path
                                d="M10.599 9.8975V7.66416H7.60266V5.70654H15.9755V7.69173H12.9792V9.8975H10.599Z"
                                fill="white"
                            />
                            <defs>
                                <filter
                                    id="filter0_i_30_3190"
                                    x="1.24463"
                                    y="0"
                                    width="20.6888"
                                    height="22.8794"
                                    filterUnits="userSpaceOnUse"
                                    color-interpolation-filters="sRGB"
                                >
                                    <feFlood
                                        flood-opacity="0"
                                        result="BackgroundImageFix"
                                    />
                                    <feBlend
                                        mode="normal"
                                        in="SourceGraphic"
                                        in2="BackgroundImageFix"
                                        result="shape"
                                    />
                                    <feColorMatrix
                                        in="SourceAlpha"
                                        type="matrix"
                                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                        result="hardAlpha"
                                    />
                                    <feOffset dy="2.19057" />
                                    <feGaussianBlur stdDeviation="1.09529" />
                                    <feComposite
                                        in2="hardAlpha"
                                        operator="arithmetic"
                                        k2="-1"
                                        k3="1"
                                    />
                                    <feColorMatrix
                                        type="matrix"
                                        values="0 0 0 0 0.118403 0 0 0 0 0.916667 0 0 0 0 0.581396 0 0 0 1 0"
                                    />
                                    <feBlend
                                        mode="normal"
                                        in2="shape"
                                        result="effect1_innerShadow_30_3190"
                                    />
                                </filter>
                            </defs>
                        </svg>
                    </div>
                </div>
                <input
                    style={inputStyle}
                    type="checkbox"
                    value="option1"
                    checked={selectedOption === 'option1'}
                    onChange={handleOptionChange}
                />
            </div>
            <div style={divStyle2}>
                <input
                    style={inputStyle}
                    type="checkbox"
                    value="option2"
                    checked={selectedOption === 'option2'}
                    onChange={handleOptionChange}
                />
            </div>
        </div>
    );
};

export default SelectorFee;
