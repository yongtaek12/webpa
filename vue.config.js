const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');
const path = require('path');

module.exports = defineConfig({
// 👇👇 이 부분을 추가해야 합니다! 👇👇
  // S3와 같은 정적 호스팅 환경에서 리소스 경로를 HTML 파일을 기준으로 상대 경로로 설정합니다.
  publicPath: './',

  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      },
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
