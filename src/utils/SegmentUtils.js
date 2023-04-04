import axios from 'axios';
import { getWalletAddress } from '../injected/flintButtonState';

const DOMAIN = 'https://api.segment.io/v1';
const WRITE_KEY = 'GMM8kDMztPC8HFXWQXEfZ5bYwo6NiatQ';
const ENCODED = btoa(WRITE_KEY + ':');
const AxiosApiConfig = {
    headers: {
        Authorization: `Basic ${ENCODED}`,
        'content-type': 'application/json',
    },
};

export const identifyUser = async (email, address) => {
    const data = {
        userId: email,
        traits: {
            address,
            email,
        },
        timestamp: new Date().toISOString(),
        messageId: `ms-${new Date().getTime()}`,
    };
    if (process.env.NODE_ENV != 'development' || true) {
        try {
            const response = await axios.post(
                `${DOMAIN}/identify`,
                data,
                AxiosApiConfig
            );
            console.log('SEGMENT IDENTIFYING', email, response.data);
        } catch (error) {
            console.log('SEGMENT IDENTIFY ERROR', email, error);
        }
    }
};

export const trackEvent = async (event, eventData) => {
    const data = {
        userId: getWalletAddress(),
        type: 'track',
        event,
        properties: {
            ...eventData,
        },
        messageId: `ms-${new Date().getTime()}`,
    };
    if (process.env.NODE_ENV != 'development' || true) {
        try {
            const response = await axios.post(
                `${DOMAIN}/track`,
                data,
                AxiosApiConfig
            );
            console.log('SEGMENT TRACK', event, response.data);
        } catch (error) {
            console.log('SEGMENT TRACK ERROR', event, error);
        }
    } else {
        console.log('DEV ENV IGNORING', event);
    }
};
