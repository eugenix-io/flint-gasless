const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    entry: {
        popup: './src/popup.jsx',
        content: './src/content.js',
        injected: './src/injected.js',
    }, 
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
    },
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env', '@babel/preset-react'],
                }
            }
        },
        {
            test: /\.svg$/,
            use: [
              {
                loader: 'svg-url-loader',
                options: {
                  limit: 10000,
                },
              },
            ],
          },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({ template: './src/index.html', filename: 'index.html' }),
        new CopyPlugin({
            patterns: [{
                from: 'public'
            }]
        })
    ],
};