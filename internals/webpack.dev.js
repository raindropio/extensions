global.withAppBuild = true

var commonConfig = require('./webpack.common.js')
var webpack = require("webpack");
var path = require("path");
var WriteFilePlugin = require('write-file-webpack-plugin');

process.env.NODE_ENV = "development"

//Plugins
var plugins = commonConfig.plugins.concat([
	new webpack.DefinePlugin({
		__DEV__: JSON.stringify(true),
		__PLATFORM__: JSON.stringify(global.platform||"chrome"),
		__APPBUILD__: JSON.stringify(global.withAppBuild||false)
	}),
	new WriteFilePlugin(),
])

var loaders = commonConfig.loaders;

var isHttps = global.unsecure ? false : true;
var protocol = (isHttps ? "https" : "http"),
	port = (isHttps ? 443 : 80);

module.exports = require('./webpack.js')({
	devtool: "cheap-module-eval-source-map",
	debug: true,
	https: isHttps,

	publicPath: protocol+"://localhost:"+port+"/",
	devServer: {
		publicPath: protocol+"://localhost:"+port+"/",
		outputPath: path.join(__dirname, "../build/chrome"),
		https: isHttps
	}
}, plugins, loaders)