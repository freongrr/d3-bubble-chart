/* global require:false, module:false, __dirname:false */

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const sourceDir = path.resolve(__dirname, "src/");
const outputDir = path.resolve(__dirname, "dist/");

module.exports = {
    entry: sourceDir + "/index.js",
    output: {
        path: outputDir,
        filename: "[name].bundle.js"
    },
    module: {
        rules: [{
            test: /\.js$/,
            use: [
                "source-map-loader"
            ],
            enforce: "pre"
        }, {
            test: /\.js$/,
            exclude: /node_modules/,
            use: [
                "babel-loader",
                "eslint-loader"
            ]
        }, {
            test: /\.css$/,
            use: [
                "style-loader?sourceMap",
                "css-loader?sourceMap"
            ]
        }]
    },
    devtool: "source-maps",
    plugins: [
        new HtmlWebpackPlugin({
            template: sourceDir + "/index.html"
        })
    ]
};
