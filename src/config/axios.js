import axios from 'axios';

axios.interceptors.request.use(
    function (config) {
        // check if the URL contains a specific string
        console.log('this is the config url - ', config);
        if (config.url.includes('ngrok')) {
            // add default header to the request
            config.headers['ngrok-skip-browser-warning'] = '1';
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);
