var path = require('path');

module.exports = {
  entry: './public/src/app.js',
  output: {
    path: path.join(__dirname, 'public/js'),
    filename: 'app.js'
  },
  // devtool: 'inline-source-map',
  module: {
    loaders: [
      {
        test: path.join(__dirname, 'public/src'),
        loader: 'babel-loader'
      },
      {
        test: /\.handlebars$/,
        loader: "handlebars-loader"
      },
    ]
  }
};