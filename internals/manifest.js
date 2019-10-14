var fs = require('fs');
var path = require('path');
var GenerateJsonPlugin = require('generate-json-webpack-plugin');
var _ = {
	capitalize: require('lodash/capitalize')
}

var m = {
	background: function(value) {
		if (global.platform == "firefox")
			delete value.persistent;

		return value;
	},

	applications: function(value) {
		if (global.platform == "firefox")
			return {gecko:{
				id: "jid0-adyhmvsP91nUO8pRv0Mn2VKeB84@jetpack",
				"strict_min_version": "56.0"
			}};

		return undefined;
	},

	sidebarAction: function(value) {
		if (global.platform == "opera"/* || global.platform == "firefox"*/)
			return {
				"default_icon": "assets/dark_idle_19.png",
				"default_title" : "__MSG_myBookmarksRaindrop__",
				"default_panel": "panel.html"
			};

		return undefined;
	},

	version: function(value) {
		if (process.env.NODE_ENV != "production")
			return value;

		var buildVer = parseInt(fs.readFileSync(__dirname + '/buildversion.txt').toString()) + 1;
		var tempValue = value.split('.');
		tempValue[2] = buildVer;
		value = tempValue.join('.');

		fs.writeFileSync(__dirname+'/buildversion.txt', buildVer);
		return value;
	},

	contentSecurity: function(value) {
		if (process.env.NODE_ENV == "production"){
			if (global.platform == "firefox")
				return undefined;

			return value;
		}

		return "script-src 'self' http://localhost:80 https://localhost:80 https://raindrop.io 'unsafe-eval'; style-src * 'unsafe-inline' 'self' blob:;"
	},

	browserAction: function(value) {
		var temp = Object.assign({}, value);

		if (global.platform == "firefox"){
			temp.theme_icons = Object.keys(temp.default_icon).map(size=>{
				return {
					dark: temp.default_icon[size],
					light: temp.default_icon[size].replace('dark', 'light'),
					size: parseInt(size)
				}
			})
			//for(var i in temp["default_icon"])
			//	temp["default_icon"][i] = temp["default_icon"][i].replace('idle','firefox_idle');
		}

		return temp;
	},

	commands: function(value) {
		var temp = Object.assign({}, value);

		if (global.platform == "firefox"){
			temp["save-page"] = temp["_execute_browser_action"];
			delete temp["_execute_browser_action"];
		}

		return temp;
	},

	permissions: function(value) {
		let temp = [...value]

		//Firefox do not support 'activeTab' as expected
		if (global.platform == "firefox")
			temp = temp.map(v=>v=='activeTab' ? 'tabs' : v)
		
		// maybe need also:
		// "*://*/*",
		// "<all_urls>"
		

		return temp
	}
}

module.exports = {
	plugin: function() {
		var plugins = [
			new GenerateJsonPlugin(
				'manifest.json',
				require('../src/config/manifest.json'),
				function(key, value){
					switch(key){
						case "background": 				value = m.background(value); 		break;
						case "applications": 			value = m.applications(value); 		break;
						case "sidebar_action": 			value = m.sidebarAction(value); 	break;
						case "version": 				value = m.version(value); 			break;
						case "content_security_policy": value = m.contentSecurity(value); 	break;
						case "browser_action": 			value = m.browserAction(value); 	break;
						case "commands": 				value = m.commands(value); 	break;
						case "permissions":				value = m.permissions(value); 	break;
					}

					return value;
				},
				2
			)
		];

		var pathToLangs =__dirname+"/../src/languages";
		var langs = fs.readdirSync(pathToLangs).filter((fileName) => fs.lstatSync(path.join(pathToLangs, fileName)).isFile());
		var defaultLang = JSON.parse(fs.readFileSync(path.join(pathToLangs, "en_US.json")).toString())

		langs.forEach((fileName)=>{
			var strings = JSON.parse(fs.readFileSync(path.join(pathToLangs, fileName)).toString());
			var code = fileName.match(/(\D{2})\_/g)[0].substr(0,2);
			var t = (key)=>{
				return strings[key]||defaultLang[key];
			}

			if (code){
				var keyVal = (val)=>{
					val = val.replace('&nbsp;',' ');
					
					return {
						message: val,
						description: val
					}
				}
				//desc = desc.replace(/\"/g,"'").replace('&nbsp;',' ');

				plugins.push(
					new GenerateJsonPlugin(
						'_locales/'+code+"/messages.json", {
							appName: keyVal("Raindrop.io"),
							appDesc: keyVal(t("saveButtonForWeb")),
							hotkey: keyVal(t("helpHotKey")),

							savePage: keyVal(t("savePage")),
							saveLink: keyVal(t('savePage')),
							saveImage: keyVal(t("saveImage")),
							myBookmarks: keyVal(t('myBookmarks')),
							myBookmarksRaindrop: keyVal(t('myBookmarks')+" (Raindrop.io)"),

							open: keyVal(t('open')),
							save: keyVal(t('save')),
							toRaindrop: keyVal(t('toRefreshedRaindrop')),
							saveToRaindrop: keyVal(t("save")+" "+t("toRefreshedRaindrop")),
							loading: keyVal(t('loading')),

							articleSaved: keyVal(t('articleSaved')),
							imageSaved: keyVal(t('imageSaved')),
							linkSaved: keyVal(t('linkSaved')),
							videoSaved: keyVal(t('videoSaved')),

							articleRemovedPermament: keyVal(t('articleRemovedPermament')),
							imageRemovedPermament: keyVal(t('imageRemovedPermament')),
							videoRemovedPermament: keyVal(t('videoRemovedPermament')),
							linkRemovedPermament: keyVal(t('linkRemovedPermament')),

							remove: keyVal(t('remove')),
							edit: keyVal(t('edit')),
							restore: keyVal(t('restore')),
							inCollection: keyVal(_.capitalize(t('inCollection'))),
							unsorted: keyVal(t("defaultCollection--1")),
							alreadyInCollection: keyVal(t('alreadyInCollection')),

							saveError: keyVal(t('saveError')),
							supportOnlyUrls: keyVal(t('supportOnlyUrls')),
							error: keyVal(t('serverundefined')),
							tryAgain: keyVal(t('tryAgain')),
							pleaseLogin: keyVal(t('startToSave')),
							signIn: keyVal(t('signIn')),
							signUp: keyVal(t('signUp')),
							settings: keyVal(t('settings')),
							logOut: keyVal(t('logOut')),

							findBookmark: keyVal(t('findBookmarkLong').replace('...',''))
						}
					)
				)
			}
		})
		
		return plugins
	}
}