const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: './MyOpenLayer.js',
  output: {
    path: __dirname,
    filename: 'openlayer.js',
  },
};
