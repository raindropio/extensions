import colors from '../modules/colors'

const ThemeColor = {
	generateCSS(c) {
		if (c) {
			var cleanC = "", darken = c, lighten = c;
			try{cleanC = c.match(/rgb\((.*)\)/)[1];}catch(e) {}
			try{lighten = colors.lighten(cleanC,.5); darken = colors.lighten(cleanC,-.2);}catch(e){}

			return `
				#app {
					--accentColor: ${c};
					--accentColorLighten10: rgba(${cleanC},.1);
					--accentColorLighten20: rgba(${cleanC},.2);
					--accentColorLighten30: rgba(${cleanC},.3);
					--accentColorLighten: ${lighten};
					--accentColorDarken: ${darken};
					--accentOverlay: rgba(${cleanC},.06);
				}
			`
		}
		else
			return null;
	}
}

export default ThemeColor