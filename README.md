# Raindrop.io extensions

Source code of Raindrop.io browser extension (for Google Chrome, Firefox, Safari, Opera) and Mac OS X app.

## How it works
It have one code base and separate wrappers for each environment. Including [Atom-Shell](https://github.com/atom/atom-shell) with WebView and node.js wrapper for Mac OS X client implementation.
Different appearance implemented with CSS media queries and specific environment classes.

Directories:
* chrome — Main code base of browser extension and Mac OS X app
* chrome-build — Google Chrome and Opera build
* desktop — Mac OS X build with Atom-Shell wrapper, config and specific sources
* firefox — Firefox build with wrapper, config and specific sources
* safari — Safari build with wrapper, config and specific sources

## Build
```
# Install all node modules
npm update
cd desktop
npm update
cd ../

# Run build proccess
gulp
```

Also you need [cfx](https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Installation) utility from Firefox Addon SDK.

## Downloads
Prebuilt binaries and browser extensions you find on the [download](https://raindrop.io/pages/download) page.
