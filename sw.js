importScripts('/_nuxt/workbox.3de3418b.js')

const workboxSW = new self.WorkboxSW({
  "cacheId": "nuxt",
  "clientsClaim": true,
  "directoryIndex": "/"
})

workboxSW.precache([
  {
    "url": "/_nuxt/app.ac15ea284f788764969d.js",
    "revision": "a05971d291d58a421476784d8e1c5902"
  },
  {
    "url": "/_nuxt/layouts_default.4146977e09a9df14ab4f.js",
    "revision": "658bd8e4ef3f28ad8bb7b30754a5ce16"
  },
  {
    "url": "/_nuxt/manifest.271ff794bcb74fe5151d.js",
    "revision": "14cb929d7b9cdef6251593b47403df6f"
  },
  {
    "url": "/_nuxt/pages_index.89491d912b9b72ac2063.js",
    "revision": "2074560436a87e718aa1a38fd85e57e9"
  },
  {
    "url": "/_nuxt/vendor.82700a98d93f5cae2550.js",
    "revision": "cf1209de8fd593d3e6ef33dbbc2928aa"
  }
])


workboxSW.router.registerRoute(new RegExp('/_nuxt/.*'), workboxSW.strategies.cacheFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp('/.*'), workboxSW.strategies.networkFirst({}), 'GET')

