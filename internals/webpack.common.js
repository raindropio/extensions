var webpack = require("webpack");
var path = require("path");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");
var GenerateJsonPlugin = require('generate-json-webpack-plugin');
var SplitByPathPlugin = require('webpack-split-by-path');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var copyFilesList = [
	{ from: './background/opera/panel.html', to: 'panel.html' }
]

if (global.withAppBuild){
	copyFilesList.push({from: '../pages/mini/mini.css', to: 'mini.css'})
	copyFilesList.push({from: '../pages/mini/index.js', to: 'mini.js'})

	if (global.appBuildLocal)
		copyFilesList.push({from: '../appbuild/**/*', to: 'appbuild'})
}

const Common = {
	plugins: [
		//index.html
		new HtmlWebpackPlugin({
			title: "Raindrop.io",
			platform: global.platform||"",
			template: './index.ejs',
			hash: false,
			inject: 'head',
			chunks: ['main', 'languages', 'analytics'],
			favicon: "./assets/extension/icon-48.png"
		}),
		//ready.html
		new HtmlWebpackPlugin({
			platform: global.platform||"",
			template: '../pages/ready/index.ejs',
			hash: false,
			inject: 'head',
			chunks: ['ready', 'languages', 'analytics'],
			filename: "ready.html",
			favicon: "./assets/extension/icon-48.png"
		}),
		//mini.html
		new HtmlWebpackPlugin({
			platform: global.platform||"",
			template: '../pages/mini/index.ejs',
			hash: false,
			inject: 'head',
			chunks: [],
			filename: "mini.html",
			favicon: "./assets/extension/icon-48.png",

			raindropURL: (global.appBuildLocal ? "appbuild/index.html?is_clipper=1" : "https://app.raindrop.io/?is_clipper=1")
		}),
		new ScriptExtHtmlWebpackPlugin({
			defaultAttribute: 'defer'
		}),

		new SplitByPathPlugin([
			{
				name: 'languages',
				path: path.join(__dirname, '/../src/languages')
			}, {
				manifest: 'app-entry'
			}
		]),

		new CopyWebpackPlugin(copyFilesList),

		new webpack.IgnorePlugin(/^(electron)$/),

		new webpack.ProvidePlugin({
			'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
		})
	],

	loaders: {
		'stylus': { test: /\.styl$/, loader: "style-loader!css-loader!postcss-loader!stylus-loader" },
		'babel': {
			test: /\.jsx?$/,
			loader: 'babel',
			/*query: {
				cacheDirectory: path.join(__dirname, "../temp"),
				presets: ['react', "stage-0", 'es2015-minimal']
			},*/
			exclude: /node_modules\/(?!(normalize-url)\/).*/
		},
		'svg': {
			test: /.*\.svg$/,
			loaders: [
				'svg-sprite?' + JSON.stringify({
					name: '[name]',
					prefixize: false
				}),
				"image-webpack?" + JSON.stringify({
					svgo: {
						plugins: [
							{transformsWithOnePath: true},
							{removeTitle: true},
							{removeUselessStrokeAndFill: true},
							{
								removeAttrs: {attrs: '(stroke|fill)'}
							}
							//{convertPathData: false}
						]
					}
				})
			]
		},
		'img': {
			test: /.*\.(gif|png|jpe?g)$/i,
			loaders: [
				'file?hash=sha512&digest=hex&name=assets/[name].[ext]'
		    ]
		},
		'masonry': {
	        test: /masonry|imagesloaded|fizzy\-ui\-utils|desandro\-|outlayer|get\-size|doc\-ready|eventie|eventemitter/,
	        loader: 'imports?define=>false&this=>window'
	    }
	}
}

Common.plugins = Common.plugins.concat(require('./manifest').plugin());

module.exports = Common;