const path = require('path');

module.exports = {
  entry: './static/graph-src/index.ts',
  devtool: 'inline-source-map',
  mode: "development",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
        // include: 'static/graph-src'
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.js' ]
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'static/graph-src/dev')
  },
  devServer: {
    static: path.join(__dirname, 'static/graph-src/dev'),
  }
};
