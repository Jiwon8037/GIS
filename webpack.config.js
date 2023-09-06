const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: {
    openlayer: './MyOpenLayer.js'
  },
  output: {
    path: __dirname,
    filename: '[name].bundle.js',
  },
};
