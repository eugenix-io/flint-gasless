import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const Expandable = styled.div`
    overflow: hidden;
    height: ${(props) => (props.open ? 'auto' : '0')};
    .slide-down {
        animation: slide-down 0.2s linear both;
    }

    .slide-up {
        animation: slide-up 0.2s linear both;
        overflow: hidden;
    }

    @keyframes slide-down {
        0% {
            visibility: hidden;
            max-height: 0;
        }

        95% {
            visibility: visible;
            max-height: ${(props) => (props.height ? props.height : '100px')};
        }

        100% {
            visibility: visible;
            max-height: auto;
        }
    }

    @keyframes slide-up {
        from {
            visibility: visible;
            max-height: ${(props) => (props.height ? props.height : '100px')};
        }

        to {
            visibility: hidden;
            max-height: 0;
        }
    }
`;

const SlidingContainer = (props) => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (props.open && !open) {
            setOpen(true);
        }
    }, [props.open]);

    return (
        <Expandable open={open} height={props.height}>
            <div className={!props.open ? 'slide-up' : 'slide-down'}>
                {props.children}
            </div>
        </Expandable>
    );
};

export default SlidingContainer;
