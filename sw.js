importScripts('/_nuxt/workbox.42554690.js')

workbox.precaching.precacheAndRoute([
  {
    "url": "/_nuxt/app.6c6ddd381df32daafa6b.js",
    "revision": "3063386ac800e415118efb825b82bb72"
  },
  {
    "url": "/_nuxt/layouts_default.f601000c77ba9fe6cec7.js",
    "revision": "a2fb392ce22ec004c22102b304288089"
  },
  {
    "url": "/_nuxt/manifest.4d2ffe6a174b3a3e1a96.js",
    "revision": "c3c5cddf25e94854c93f137bf271fa43"
  },
  {
    "url": "/_nuxt/pages_faq.47dd49e142e0e9ca9d94.js",
    "revision": "97e7d6c61c7aac371a1cb122004c5773"
  },
  {
    "url": "/_nuxt/pages_index.60733347d64079a6af63.js",
    "revision": "fdbd00e0d8eb4d646f3e0c598b92f78d"
  },
  {
    "url": "/_nuxt/pages_solves__id.376c9c6e8e1612c3bac8.js",
    "revision": "bfa043e280344bfb180b9c7143370584"
  },
  {
    "url": "/_nuxt/pages_solves_index.8a317c9be819f0a47fab.js",
    "revision": "79ce9d42e65ba456a63d2b5411f378bd"
  },
  {
    "url": "/_nuxt/pages_stats_cll.80aec3249253ed991533.js",
    "revision": "dc8e2b3ce7a6a9f22a5ce5ba9a77b593"
  },
  {
    "url": "/_nuxt/pages_stats_index.e096cbd34377a58d78b1.js",
    "revision": "efe7a07f3a151a104345137d9c39b6c9"
  },
  {
    "url": "/_nuxt/pages_stats_oll.5f8d76c2b58da18dbf43.js",
    "revision": "fa7deafcb261c2d0c2584318af9bb488"
  },
  {
    "url": "/_nuxt/pages_stats_pll.63f2b91c98b1470dbe0f.js",
    "revision": "2b9c538cabe4383baaa4db8bd6b9fcdb"
  },
  {
    "url": "/_nuxt/vendor.27fe32bfd0388ef5ad97.js",
    "revision": "ccdb869c969edf5a2a8484e36cc68596"
  }
], {
  "cacheId": "smart-cube-timer",
  "directoryIndex": "/",
  "cleanUrls": false
})



workbox.clientsClaim()
workbox.skipWaiting()


workbox.routing.registerRoute(new RegExp('/_nuxt/.*'), workbox.strategies.cacheFirst({}), 'GET')

workbox.routing.registerRoute(new RegExp('/.*'), workbox.strategies.networkFirst({}), 'GET')





