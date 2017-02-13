//chrome-extension://gfbhgndcnagahgmpbacifkhliokhobdn/index.html
require('./files')

import routes from './routes'
routes()

import extensionHelper from './helpers/extension'
extensionHelper.init()