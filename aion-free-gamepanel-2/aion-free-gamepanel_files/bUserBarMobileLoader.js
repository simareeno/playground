(function(){define(["module","packages/jquery","packages/underscore","packages/event-bus","block!bUserBar/mixins","block!bUserBar/bUserBarConfig","packages/l4gApp","global/launcher","global/spg-fresh-status","i18n_t","i18n!Interface","i18n!Payments"],function(e,t,n,r,a,i,s,u,o,c){var g;return g={},n.extend({},a,{moduleEvents:{"payment-polling-result":"processPaymentResult","payment-polling-started":"processPaymentStart","update-userinfo":"updateUserInfo","overdraft-enabled":function(){return this.renderBillingMenu()},"overdraft-disabled":function(){return this.renderBillingMenu()},"set-contacts:complete":"renderAuthMenu"},init:function(){return this.config=i(),s.backend.on("message",function(e){return function(e){var t;if("string"==typeof e)try{e=JSON.parse(e)}catch(n){t=n,console.error(t)}if("status"===(null!=e?e.name:void 0))return r.trigger("@userbar","gamesStatus",e.data)}}(this)),s.init(),this._eventsBinded=!1,this.bindListeners(),r.on("@premium","purchased",this.renderBillingMenu,this),t(document).one("l4g-model-ready",function(e){return function(t,n){return e.subscribeToL4gModel(n.model)}}(this)).trigger("get-l4g-model-status"),t.when(this.loadUserbar(),this.getSharedOptions()).then(function(e){return function(n,a){var i;return n.init(t("#bar-placeholder").empty()[0],r.channel("userbar"),t.extend(a,{cheNavigation:!1,chePopupNavigation:!0,area:e.config.area,lang:e.config.lang,currencySymbol:e.config.currencySymbol,bonusSymbol:e.config.bonusSymbol,staging:e.config.staging,authUrl:e.config.authLink,supportUrl:e.config.supportUrl,replenishUrl:e.config.account.billing.replenishLink}),{i18n:e.getI18nOverrides()},{onSectionSwitch:function(e){return r.trigger("@userbar","sectionSwitch",e)}}),i=e.getPathParts(),i[0]&&t(".userbar-container",e.container).addClass("userbar-state--game-"+i[0]),t.when(e.getUserData(),e.getAccountData()).then(function(e,t){var n;return n=e[0],r.trigger("@licence-check","!limitedModeInit",n)}),e.getGameData(),e.detectPageType(),e.checkNewGames(n),s.backend.send("getStatus")}}(this))},turnOff:function(){return this.unbindListeners(),r.off("@premium","purchased",this.renderBillingMenu,this)},getPrefix:function(){var e,t,n;return t=this.config.lang,e=document.documentElement.getAttribute("data-DEBUG"),n=e?"":t+"/"},getUserData:function(e){return u.userData(e).then(function(e){return r.trigger("@userbar","!userData",{user:e})})},getAccountData:function(){return this.updateBuffs(),this.renderAuthMenu(),this.renderBillingMenu()},getGameData:function(){var e;return e=this.config.gamesOrder||[],u.gameData().then(function(t){return r.trigger("@userbar","gamesData",t),n.each(t,function(t,r){var a,i;if(r=""+r,r.indexOf("31-")<0&&!n.find(e,function(e){return""+e===r})&&(null!=(a=t.accounts)&&null!=(i=a[0])?i.service_account_id:void 0))return e.push(r)}),r.trigger("@userbar","gamesOrder",e)})},updateUserInfo:function(){return this.getUserData(!0),this.updateUserBalance()},updateState:function(){return this.getUserData(),this.renderAuthMenu()},processPaymentStart:function(){return r.trigger("@userbar","paymentPolingStarted")},processPaymentResult:function(e){return r.trigger("@userbar","processedPayment",e)},subscribeToL4gModel:function(e){return this.l4gModel=e,e.on(["change:GameData/services"].join(" "),this.updateGameDataFromL4G,this),this.updateGameDataFromL4G(),e.on("change:L4G.User/UserData.user.id",this.updateUserInfoFromL4G,this),e.on("change:L4G.User/UserData.user.balance",this.updateUserBalanceFromL4G,this),e.on("change:L4G.Application/in-error.code",function(e){return function(t,n){return r.trigger("@userbar","gamesError",e.purgeData(t.get("L4G.Application/in-error")))}}(this))},updateUserInfoFromL4G:function(){var e;if(e=this.purgeData(this.l4gModel.get("L4G.User/UserData")),null!=e)return r.trigger("@userbar","!userData",e)},updateUserBalanceFromL4G:function(){return this.renderBillingMenu()},updateGameDataFromL4G:function(){var e,t,a;if(e=this.purgeData(this.l4gModel.get("GameData/services")),a=this.l4gModel.get("MyGames/sortOrder")||[],t=this.l4gModel.get("MyGames/gameData")||{},null!=e&&(r.trigger("@userbar","gamesData",e),!this._eventsBinded))return n.each(e,function(e){return function(r,i){var s,u;if(i=""+i,e.l4gModel.on(["change:GameData/services."+i+".status","change:L4G.Maintenance/maintenance.services."+i,"change:L4G.Application/in-status.services."+i+".info","change:L4G.Application/in-status.services."+i+".status","change:L4G.Application/in-status.services."+i+".environment"].join(" "),function(){return e.gamesUpdateHandler(i)}),i.indexOf("31-")<0&&!n.find(a,function(e){return""+e===i})&&(null!=(s=r.accounts)&&null!=(u=s[0])?u.service_account_id:void 0)&&a.push(i),!n.contains(t,i))return t[i]={id:i,key:r.key,name:r.name,title:r.name}}}(this)),this._eventsBinded=!0,r.trigger("@userbar","gamesOrder",this.purgeData(a))},purgeData:function(e){if(null!=e)return JSON.parse(JSON.stringify(e))},gamesUpdateHandler:function(e){return r.trigger("@userbar","gamesStatus",this.gatherDataForGame(e))},gatherDataForGame:function(e){var t,n,r;return r=[],n=!!this.l4gModel.get("L4G.Maintenance/maintenance.services."+e),t=this.l4gModel.get("L4G.Application/in-status.services."+e),null!=t&&(n&&"progress"!==t.status&&(t.status="maintenance"),r.push(t)),this.purgeData({maintenance:n,services:r})},checkNewGames:function(e){return o.getNewGamesBadge().then(function(t){var n,a,i;if(t)return i=function(e){return r.trigger("@userbar","gameSectionsData",{desktop:{after:e}})},a=function(){return i("")},i(t),n=null,"desktop"===e.getActiveGamesSection()?(o.save(),n=function(){return a(),r.off("@userbar","sectionSwitch",n)}):n=function(e){if("desktop"===e)return a(),o.save(),r.off("@userbar","sectionSwitch",n)},r.on("@userbar","sectionSwitch",n)})}})})}).call(this);
//# sourceMappingURL=bUserBarMobileLoader.js.map
