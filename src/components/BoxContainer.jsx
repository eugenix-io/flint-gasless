import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
    border: 1px solid #1c1c1c;
    border-radius: ${(props) => (props.radius ? props.radius : '15px')};
    background-color: #121212;
    padding: ${(props) => (props.padding ? props.padding : '20px')};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
`;

const BoxContainer = (props) => {
    return <Container {...props}>{props.children}</Container>;
};

export default BoxContainer;
