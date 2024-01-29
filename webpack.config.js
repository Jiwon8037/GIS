const webpack = require('webpack');

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: {
    openlayer: './MyOpenLayer.js'
  },
  output: {
    path: __dirname,
    filename: '[name].bundle.js',
  },
};
