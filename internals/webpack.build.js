global.platform = global.platform||"chrome";

var path = require("path");
var commonConfig = require('./webpack.common.js')
var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var ZipPlugin = require('zip-webpack-plugin');
var OptimizeJsPlugin = require("optimize-js-plugin");
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

process.env.NODE_ENV = "production";

//Plugins
var plugins = commonConfig.plugins.concat([
	new ExtractTextPlugin("[name].css", {filename: "[name].css", allChunks: true}),
	new webpack.optimize.OccurrenceOrderPlugin(true),
	new webpack.optimize.DedupePlugin(),
	new webpack.optimize.UglifyJsPlugin({
		minimize: true,
		comments: false,
		compress: {
	        warnings: false
	    }
	}),
	new OptimizeJsPlugin({
        sourceMap: false
    }),
	new ZipPlugin({
		path: '../',
		filename: global.platform+".zip"
	}),
	new BundleAnalyzerPlugin({
		analyzerMode: 'static',
		openAnalyzer: false,
		reportFilename: path.join(__dirname, '/../report.html'),
		generateStatsFile: false,
		logLevel: 'info'
	})
])

plugins.unshift(
	new webpack.DefinePlugin({
		__DEV__: JSON.stringify(false),
		__PLATFORM__: JSON.stringify(global.platform),
		__APPBUILD__: JSON.stringify(global.withAppBuild||false),
		'process.env': {
			'NODE_ENV': JSON.stringify('production')
		}
	})
);

//Loaders
var loaders = commonConfig.loaders;
loaders.img.loaders.push('image-webpack?{pngquant:{optimizationLevel: 7, quality: "65-90", speed: 2}, mozjpeg: {quality: 80}}');
loaders.stylus.loader = ExtractTextPlugin.extract("stylus", "css-loader!postcss-loader!stylus-loader");

/*loaders.stylus.loader = ExtractTextPlugin.extract({
	fallbackLoader: "style-loader",
	loader: "css-loader!postcss-loader!stylus-loader"
});*/

module.exports = require('./webpack.js')({
	devtool: false
}, plugins, loaders)