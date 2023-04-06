import React from 'react';
import styled from 'styled-components';

const ButtonContainer = styled.div`
    background: #6de573;
    border-radius: 50px;
    color: black;
    padding: 16px;
    font-size: 18px;
    text-align: center;
    cursor: pointer;

    &:hover {
        background: #5cd162;
    }
`;

const CTA = (props) => {
    return <ButtonContainer {...props}>{props.children}</ButtonContainer>;
};

export default CTA;
