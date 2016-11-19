const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require('path');

module.exports = {
  entry: './public/src/app.js',
  output: {
    path: path.join(__dirname, 'public/js'),
    filename: 'app.js'
  },
  devtool: 'inline-source-map',
  module: {
    loaders: [
      {
        test: path.join(__dirname, 'public/src'),
        loader: 'babel-loader'
      },
      {
        test: /\.handlebars$/,
        loader: 'handlebars-loader'
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract('css!sass')
      },
      {
        test: /\.png/,
        loader: 'ignore-loader'
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('../css/app.css')
  ]
};