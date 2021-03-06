/* global require:false, module:false, __dirname:false */

const path = require("path");
const packageJson = require("./package.json");
const libraryName = packageJson.name;

const sourceDir = path.resolve(__dirname, "src/");
const outputDir = path.resolve(__dirname, "dist/");

module.exports = {
    entry: sourceDir + "/index.js",
    output: {
        path: outputDir,
        filename: libraryName + ".js",
        library: libraryName,
        libraryTarget: "umd",
        umdNamedDefine: true
    },
    externals: [
        "d3"
    ],
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
    plugins: []
};
