define(["exports","packages/jquery","global/launcher","packages/event-bus"],function(exports,e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function a(){return v.then(function(e){return e.length})}function u(){return a().then(i)}function o(){return v.then(function(e){return m.then(function(t){try{localStorage.setItem(p,JSON.stringify(t.concat(e)))}catch(n){console.warn(n)}v=l["default"].Deferred().resolve([]).promise(),c(0)})})}function c(e){g["default"].trigger("@spg","!new-games",e||0,i(e))}function i(e){return e?'<span class="bNotificationBadge">'+(e<10?e:"∞")+"</span>":""}function s(){var e=localStorage.getItem("spg-viewed");if(e&&"string"==typeof e)try{e=JSON.parse(e)}catch(t){console.warn(t)}return Array.isArray(e)||(e=[]),l["default"].Deferred().resolve(e).promise()}function f(){return d["default"].gameData().then(function(e){return Object.keys(e).filter(function(t){return 6===e[t].type&&h.indexOf(t)===-1})})}Object.defineProperty(exports,"__esModule",{value:!0}),exports.getNewGamesCount=a,exports.getNewGamesBadge=u,exports.save=o;var l=r(e),d=r(t),g=r(n),h=["31-assassins-creed-syndicate","31-call-of-duty-advanced-warfare","31-just-cause-3","31-mortal-kombat-x","31-tom-clancys-the-division"],p="spg-viewed",y=f(),m=s(),v=y.then(function(e){return m.then(function(t){return e.filter(function(e){return t.indexOf(e)===-1})})});v.then(function(e){return c(e.length)})});
//# sourceMappingURL=spg-fresh-status.js.map
