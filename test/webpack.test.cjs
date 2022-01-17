const path = require("path");

module.exports = {
    mode: 'development',
    entry: {
        index: path.resolve(__dirname, 'src/index.js'),
    },
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.html$/i,
                type: 'asset/resource'
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.s[ac]ss$/i,
                use: ['style-loader', 'css-loader', 'sass-loader', {
                    loader: path.resolve(__dirname, '../src/aim/aim-loader.cjs')
                }]
            }
        ]
    },
    devtool: 'eval',
    devServer: {
        port: 3000,
        historyApiFallback: true,
        liveReload: true,
        hot: false,
        static: {
            directory: path.resolve(__dirname, 'public'),
            watch: true
        }
    }
};
