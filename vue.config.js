const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');

module.exports = defineConfig({
  configureWebpack: {
    resolve: {
      fallback: {
        "stream": "stream-browserify",
        "util": "util",
        "path": "path-browserify",
        "zlib": "browserify-zlib",
        "querystring": "querystring-es3",
        "crypto": "crypto-browserify",
        "http": "stream-http",
        "url": "url",
        "assert": "assert",
        "vm": "vm-browserify",
        "fs": false,
        "net": false,
        "async_hooks": false,
        "process": "process/browser"
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      }),
      new webpack.ContextReplacementPlugin(/express\/lib/, (data) => {
        delete data.dependencies[0].critical;
        return data;
      }),
    ],
  },
  transpileDependencies: true,
  lintOnSave: false,
});
