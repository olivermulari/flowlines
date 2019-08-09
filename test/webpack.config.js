const HtmlWebPackPlugin = require("html-webpack-plugin");

const webpack = require('webpack');
const path = require("path");

module.exports = function(env, argv) {
  return {
    mode: env.production ? 'production' : 'development',
    devtool: env.production ? 'source-maps' : 'eval',
    entry: {
      main: path.resolve(__dirname, "src", "test.js"),
    },
    output: {
      filename: 'js/[name].[contenthash].js',
      chunkFilename: 'js/[name].[contenthash].js',
      path: path.resolve(__dirname, "build"),
    },
    devServer: {
      contentBase: path.join(__dirname, 'build'),
      open: true,
      overlay: true,
      compress: false,
      port: 9000
    },
    module: {
      rules: [
        {
          test: /\.html$/,
          use: [
            {
              loader: "html-loader",
              options: { minimize: true }
            }
          ]
        },
        {
          test: /\.js$/,
          include: [
            path.resolve(__dirname, "src")
          ],
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          }
        },
      ]
    },
    plugins: [
      new webpack.ProgressPlugin(),
      new HtmlWebPackPlugin({
        template: path.resolve(__dirname, "src", "index.html"),
        filename: "index.html"
      }),
    ],
  };
};
