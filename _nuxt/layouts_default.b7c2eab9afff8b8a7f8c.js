webpackJsonp([7],{"+2hK":function(t,e,o){"use strict";var n={render:function(){var t=this,e=t.$createElement,o=t._self._c||e;return o("v-app",[o("v-navigation-drawer",{attrs:{app:""},model:{value:t.drawer,callback:function(e){t.drawer=e},expression:"drawer"}},[o("v-list",{staticClass:"pt-0"},[o("v-list-tile",{attrs:{to:"/",nuxt:""}},[o("v-list-tile-content",[o("v-list-tile-title",[t._v("\n\t\t\t\t\t\tHome\n\t\t\t\t\t")])],1)],1),o("v-list-tile",{attrs:{to:"/faq"}},[o("v-list-tile-content",[o("v-list-tile-title",[t._v("\n\t\t\t\t\t\tFAQ\n\t\t\t\t\t")])],1)],1)],1)],1),o("v-toolbar",{attrs:{dense:"",app:"",dark:"",color:"purple"}},[o("v-toolbar-side-icon",{on:{click:function(e){e.stopPropagation(),t.drawer=!t.drawer}}}),o("v-toolbar-title",[o("nuxt-link",{staticClass:"white--text",attrs:{to:"/"}},[t._v("\n\t\t\t\tSmart Cube Timer\n\t\t\t")])],1),o("v-spacer"),o("v-btn",{attrs:{icon:""},on:{click:t.onClickFullscreen}},[t.isFullscreen?o("v-icon",[t._v("fullscreen_exit")]):o("v-icon",[t._v("fullscreen")])],1)],1),o("v-content",[o("nuxt")],1),o("v-footer",{style:{lineHeight:"1.2em"},attrs:{app:"",height:40}},[o("v-flex",{attrs:{"text-xs-center":"",xs12:""}},[t._v("\n\t\t\tThis timer is under development - "),o("a",{attrs:{href:"https://github.com/hakatashi/smart-cube-timer",target:"_blank"}},[t._v("\n\t\t\t\tGitHub\n\t\t\t")]),t._v(" - "),o("a",{attrs:{href:"https://twitter.com/hakatashi",target:"_blank"}},[t._v("\n\t\t\t\tTwitter\n\t\t\t")]),o("br"),o("strong",[t._v("\n\t\t\t\tNEWS: Roux support is out!\n\t\t\t")])])],1),o("v-bottom-nav",{attrs:{app:"",active:"recent",height:50,value:"solves",absolute:"",color:"purple darken-2"}},[o("v-btn",{staticClass:"pa-0",attrs:{color:"white",flat:"",value:"timer",to:"/",nuxt:""}},[o("v-icon",[t._v("timer")])],1),o("v-btn",{staticClass:"pa-0",attrs:{color:"white",flat:"",value:"solves",to:"/solves",nuxt:""}},[o("v-icon",[t._v("history")])],1),o("v-btn",{staticClass:"pa-0",attrs:{color:"white",flat:"",value:"stats",to:"/stats",nuxt:""}},[o("v-icon",[t._v("bar_chart")])],1)],1)],1)},staticRenderFns:[]};e.a=n},LiIs:function(t,e,o){(t.exports=o("FZ+f")(!1)).push([t.i,'@font-face{font-family:Material Icons;font-style:normal;font-weight:400;src:url(https://fonts.gstatic.com/s/materialicons/v41/flUhRq6tzZclQEJ-Vdg-IuiaDsNZ.ttf) format("truetype")}@font-face{font-family:Roboto;font-style:normal;font-weight:300;src:local("Roboto Light"),local("Roboto-Light"),url(https://fonts.gstatic.com/s/roboto/v18/KFOlCnqEu92Fr1MmSU5fBBc9.ttf) format("truetype")}@font-face{font-family:Roboto;font-style:normal;font-weight:400;src:local("Roboto"),local("Roboto-Regular"),url(https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxP.ttf) format("truetype")}@font-face{font-family:Roboto;font-style:normal;font-weight:500;src:local("Roboto Medium"),local("Roboto-Medium"),url(https://fonts.gstatic.com/s/roboto/v18/KFOlCnqEu92Fr1MmEU9fBBc9.ttf) format("truetype")}@font-face{font-family:Roboto;font-style:normal;font-weight:700;src:local("Roboto Bold"),local("Roboto-Bold"),url(https://fonts.gstatic.com/s/roboto/v18/KFOlCnqEu92Fr1MmWUlfBBc9.ttf) format("truetype")}.material-icons{font-family:Material Icons;font-weight:400;font-style:normal;font-size:24px;line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;word-wrap:normal;direction:ltr}.v-chip.v-chip--small .v-avatar{height:24px!important;margin-left:-13px;margin-right:4px;min-width:24px;width:24px!important}a{text-decoration:none}.v-bottom-nav{position:fixed}',""])},Ma2J:function(t,e,o){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=o("xQwp"),l=o("+2hK");var s=function(t){o("gvl3")},r=o("VU/8")(n.a,l.a,!1,s,null,null);e.default=r.exports},gvl3:function(t,e,o){var n=o("LiIs");"string"==typeof n&&(n=[[t.i,n,""]]),n.locals&&(t.exports=n.locals);o("rjj0")("2f60d9a1",n,!0,{sourceMap:!1})},xQwp:function(t,e,o){"use strict";e.a={data:function(){return{drawer:null,isFullscreen:!1}},methods:{onClickFullscreen:function(){this.isFullscreen?(document.exitFullscreen?document.exitFullscreen():document.mozExitFullscreen?document.mozExitFullscreen():document.webkitExitFullscreen?document.webkitExitFullscreen():document.msExitFullscreen&&document.msExitFullscreen(),this.isFullscreen=!1):(document.documentElement.requestFullscreen?document.documentElement.requestFullscreen():document.documentElement.mozRequestFullScreen?document.documentElement.mozRequestFullScreen():document.documentElement.webkitRequestFullscreen?document.documentElement.webkitRequestFullscreen():document.documentElement.msRequestFullscreen&&document.documentElement.msRequestFullscreen(),this.isFullscreen=!0)}}}}});