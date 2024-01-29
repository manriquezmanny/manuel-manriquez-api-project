const path = require("path");
const Dotenv = require("dotenv-webpack");

module.exports = {
    mode: "development",
    entry: {"app": path.resolve(__dirname, "src/app.js"),
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "public"),
    },
    module: {
        rules: [
            {
                test:/\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.worker\.js$/,
                exclude: /node_modules/,
                use: "worker-loader",
            }
        ],
    },
    plugins: [
        new Dotenv(),
    ],
    devServer: {
        static: path.join(__dirname, "public"),
        port: 3000,
        hot: true,
    },
};
