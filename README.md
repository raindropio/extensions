# Raindrop.io extensions

Source code of Raindrop.io browser extensions (for Google Chrome, Firefox, Safari, Opera) and Mac OS X app.

## How it works
It have one code base and separate wrappers for each environment. Including [Atom-Shell](https://github.com/atom/atom-shell) with WebView and node.js wrapper for Mac OS X client implementation.

Directories:
* chrome — Main code base of browser extensions and Mac OS X app
* chrome-build — Google Chrome release
* desktop — Mac OS X release with Atom-Shell wrapper, config and specific sources
* firefox — Firefox release with wrapper, config and specific sources
* safari — Safari release with wrapper, config and specific sources

## Build
```
# Install all node modules
npm update
cd desktop
npm update

# Run build proccess
gulp
```

Also you need [cfx](https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Installation) utility from Firefox Addon SDK.

## Downloads
Prebuilt binaries and browser extensions you find on the [download](https://raindrop.io/pages/download) page.
