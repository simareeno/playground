define(["exports","packages/web-components","web-components/bundle","streams/achievements","streams/notifications","presenters/achievements","presenters/notification-center"],function(exports,e,t,n,a,s,u){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}var f=r(e),i=r(t),c=r(n),o=r(a),d=r(s),l=r(u);(0,i["default"])(f["default"]),c["default"].plug(o["default"].stream.filter(function(e){return"achievements"===e.type}).map(function(e){return e.data})),new d["default"](c["default"]),new l["default"](o["default"])});
//# sourceMappingURL=web-components.js.map
