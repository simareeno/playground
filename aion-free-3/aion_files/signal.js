(function(){define(function(require){var e,n,t,i,o,r,a,c,u,d,s;return a=require("packages/che"),e=require("packages/jquery"),r=require("packages/4game-api-client"),c=require("packages/event-bus"),d=require("global/licenceCheck"),s=r.user.identityTypes,i=s.VKONTAKTE,n=s.FACEBOOK,t=s.ODNOKLASSNIKI,o=s.YANDEX,u={vk:i,fb:n,ok:t,ya:o},window.name="parent4gameSocialAuth",window.receiveChildAuthWindowSignal=function(n,t,i,o,s){var l,g;if(s=e.extend(!0,s),l=window.open("",n),l.close(),"undefined"!==o&&"undefined"!==t)return s.localEventId?void c.trigger("@social-auth","callback-"+s.localEventId,{contactType:u[t],connectUserId:s.oauthUserId,accessToken:o}):s.oauthError?console.warn(s.oauthError):(g={},g[t]=o,r.user.login(g,"1"===s.rememberMe).then(function(e){var n;return n=function(){return s.redirectTo?window.location.href=decodeURIComponent(s.redirectTo):window.location.reload()},require("components/auth/login").setCookieByAuthTicket(e),r.licenses.hasRequired("4game").then(function(e){return e?d.showLicence(0,function(e){return e?n():window.location.href="/logout/"}):n()})},function(n,i,c){var d,l;if(401===n.status)return d={contactType:u[t],connectUserId:s.oauthUserId,accessToken:o},s.redirectTo&&(d.redirectTo=s.redirectTo),l=s.oauthEmail?r.get("identities/email:"+s.oauthEmail):e.Deferred().reject(),l.then(function(n){return d.foundContact=s.oauthEmail,a.events.trigger("pageTransition:init",["?popupWidget=SocialLinkWidget&"+e.param(d),'SocialLinkWidget: {"target":"#OverlayContent","ns":"popup"}',"GET",{}])},function(){return a.events.trigger("pageTransition:init",["?popupWidget=SocialRegisterWidget&"+e.param(d),'SocialRegisterWidget: {"target":"#OverlayContent","ns":"popup"}',"GET",{}])})}))}})}).call(this);
//# sourceMappingURL=signal.js.map