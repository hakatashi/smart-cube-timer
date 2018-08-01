importScripts('https://hakatashi.github.io/smart-cube-timer/workbox.3de3418b.js')

const workboxSW = new self.WorkboxSW({
  "cacheId": "nuxt",
  "clientsClaim": true,
  "directoryIndex": "/"
})

workboxSW.precache([
  {
    "url": "https://hakatashi.github.io/smart-cube-timer/app.e8319bd48fb459158279.js",
    "revision": "86da474f6633b31fc11e1647fde6dbd1"
  },
  {
    "url": "https://hakatashi.github.io/smart-cube-timer/layouts_default.4146977e09a9df14ab4f.js",
    "revision": "658bd8e4ef3f28ad8bb7b30754a5ce16"
  },
  {
    "url": "https://hakatashi.github.io/smart-cube-timer/manifest.d4ebdd31d6af9b20e82a.js",
    "revision": "e50057ccb5d661fbaadfbe1e6d3d3f71"
  },
  {
    "url": "https://hakatashi.github.io/smart-cube-timer/pages_index.89491d912b9b72ac2063.js",
    "revision": "2074560436a87e718aa1a38fd85e57e9"
  },
  {
    "url": "https://hakatashi.github.io/smart-cube-timer/vendor.82700a98d93f5cae2550.js",
    "revision": "cf1209de8fd593d3e6ef33dbbc2928aa"
  }
])


workboxSW.router.registerRoute(new RegExp('https://hakatashi.github.io/smart-cube-timer/.*'), workboxSW.strategies.cacheFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp('/.*'), workboxSW.strategies.networkFirst({}), 'GET')

