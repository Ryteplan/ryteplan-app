const { defineConfig } = require('@vue/cli-service')
var webpack = require('webpack');
const fs = require('fs')
const packageJson = fs.readFileSync('./package.json')
const version = JSON.parse(packageJson).version || 0

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
        new webpack.DefinePlugin({
            'process.env.node_env': {
                PACKAGE_VERSION: '"' + version + '"'
            }
        })
    ]
  },
})