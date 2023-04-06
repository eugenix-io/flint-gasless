const { merge } = require('webpack-merge');
const config = require('./webpack.config.js');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

// config.module.rules.forEach((rule, index) => {
//     if (rule.use && rule.use.loader && rule.use.loader == 'babel-loader') {
//         config.module.rules[index].use.options.plugins = [
//             require.resolve('react-refresh/babel'),
//         ].filter(Boolean);
//     }
// });

module.exports = merge(config, {
    mode: 'development',
    devtool: 'inline-source-map',
    // plugins: [new ReactRefreshWebpackPlugin()].filter(Boolean),
});
