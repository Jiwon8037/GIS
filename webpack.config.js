const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './MyOpenLayer.js',
  output: {
    path: __dirname,
    filename: 'openlayer.js',
  },
};