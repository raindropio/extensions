var webpack = require("webpack");
var path = require("path");
var cssnext = require('postcss-cssnext');
var stylus = require('stylus');

var config = {
	cache: true,
	context: path.join(__dirname, '/../src'),
	entry: {
		main: './app.js',
		background: './background',
		inject: './background/inject',

		//pages
		ready: '../pages/ready'
	},
	output: {
		path: path.join(__dirname, "../build/"+global.platform),
		filename: '[name].js'
	},
	resolve: {
		modulesDirectories: [
			path.resolve(__dirname, '/../node_modules'),
			'node_modules'
		],
		extensions:         ['', '.js', '.jsx', '.styl'],
		alias: {
			t: __dirname + '/../src/modules/translate.js',
			api: __dirname + '/../src/modules/api.js',
			network: __dirname + '/../src/modules/network.js',
			config: __dirname + '/../src/modules/config.js'
		}
	},
	target: "web",

	postcss: function () {
        return [cssnext({
			browsers: ['last 2 versions', 'IE > 10'],
			features: {
				customProperties: {
					strict: false,
					preserve: true,
					warnings: false
				}
			}
	    })];
    }
}

module.exports = function(options, plugins, loaders) {
	config.plugins = plugins;

	//Loaders
	var _loaders = [];
	for(var i in loaders)
		_loaders.push(loaders[i]);

	config.module = {
		loaders: _loaders
	}

	var finalObj = Object.assign(config, options);

	return finalObj;
}