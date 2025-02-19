const { defineConfig } = require('@vue/cli-service')
var webpack = require('webpack');
const fs = require('fs')
const packageJson = fs.readFileSync('./package.json')
const version = JSON.parse(packageJson).version || 0

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    devtool: 'source-map',
    plugins: [
        new webpack.DefinePlugin({
            __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
            'process.env.node_env': {
                PACKAGE_VERSION: '"' + version + '"'
            }
        })
    ]
  },
})