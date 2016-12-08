(function(){define(function(require,exports,t){var e,n,i,o,r,a,u,c,s;return e=require("packages/jquery"),r=require("packages/che"),o=require("packages/4game-api-client"),u=require("packages/event-bus"),a=require("packages/web-components").components,i=require("streams/actions"),n=864e5,c="events-action-state",s=function(t,n,i){var o;return o=e.Deferred(),404===t.status?o.resolve(null):o.reject(t,n,i)},{getActions:function(){return e.when(o.revault.get("events").then(null,s),o.achievements.get()).then(function(t,n){var i;return i={},n.achievements.forEach(function(t){return function(t){return i[t.achievementType]=t}}(this)),e.extend({},t,i)},s)},getEventsActionStates:function(){return o.revault.get(c).then(null,s)},updateStates:function(){return o.revault.set(c,this.states)},normalizeActions:function(t){var e,n;null==t&&(t={});for(n in t)e=t[n],e.achievementType=n;return t},turnOn:function(){return this.updateEvents(),u.on("@premium","purchased",this.updateEvents,this)},turnOff:function(){return u.off("@premium","purchased",this.updateEvents,this)},updateEvents:function(){return e.when(this.getActions(),this.getEventsActionStates(),this.checkSpecialConditions()).then(function(t){return function(e,n){return t.actions=t.normalizeActions(e),t.states=n||{},t.checkActions()}}(this))},checkSpecialConditions:function(){var t,n;return t=e.cookie("prevent-events-notifications"),n=!t,e.Deferred()[n?"resolve":"reject"]()},checkActions:function(){var t,n,o,r;return r=i.filter,t=r.area,o=r.inactive,n=r.conditionsByUrl,i.getAll().filter(t).filter(o).filter(n).onValue(function(t){return function(n){return e.Deferred().resolve(!1).then(t.createAvailabilityCheck(n)).then(function(e){return e?(t.checkActionStatement(n)&&t.handleAction(n),t.notifyAboutActiveAction(n)):t.notifyAboutInactiveAction(n)}).then(t.updateStates.bind(t))}}(this))},createAvailabilityCheck:function(t){return function(n){return function(){var i,o;return i=n.checkAvailabilityStatement(t),"function"==typeof(null!=i?i.then:void 0)?(o=e.Deferred(),i.then(o.resolve,function(){return o.resolve(!1)}),o.promise()):i}}(this)},getActionByName:function(t){var e,n,i,o,r,a,u;for(null==t&&(t=""),e=[].concat(t),o=0,r=e.length;o<r;o++)if(t=e[o],a=t.name,u=t.version,null==a&&(a=t),""!==a&&(null==u&&(u=0),n=this.actions[a],i=null!=(null!=n?n.version:void 0)?~~n.version:0,n&&i!==u&&(n=void 0),n))return n},checkAvailabilityStatement:function(t){var e;return null!=t&&(e=this.states[t.id],"function"==typeof t.showHandler?t.showHandler(e,this.getActionByName(t.enabledBy)):!this.getActionByName(t.disabledBy)&&(null==t.enabledBy||!!this.getActionByName(t.enabledBy)))},checkActionStatement:function(t){var e;if(null==t)return!1;if(e=this.states[t.id]){if((e.version||0)!==(t.version||0))return!0;if(t.counterDays&&Date.now()>e.activateDate+t.counterDays*n)return!1}return!0},checkSuspendStatement:function(t){var e,i;if(i=this.states[t.id])return e=i.showDate||i.activateDate,(i.version||0)!==(t.version||0)||Date.now()-e>=(t.suspendDays||0)*n},handleAction:function(t){var e,n,i;return e=this.states[t.id]||(this.states[t.id]={}),this.checkSuspendStatement(t)&&(e.popupShowed=!1),e.popupShowed||(n=t.version||0,i=0,(e.version||0)===n&&e.viewCount&&(i=e.viewCount),e.activateDate||(e.activateDate=Date.now()),e.showDate=Date.now(),e.popupShowed=!0,e.viewCount=i+1,e.version=n,this.showPopup(t)),this.showCounter(t)},notifyAboutActiveAction:function(t){if(t.id)return document.body.classList.add("events-active_action--"+t.id),null!=t.premiumCouponsIds?(t.premiumCouponsIds.forEach(function(e){return window.localStorage.setItem("action-premium-couponid-"+e,t.id)}),u.trigger("@premium-coupons","update")):void 0},notifyAboutInactiveAction:function(t){if(t.id)return document.body.classList.remove("events-active_action--"+t.id),null!=t.premiumCouponsIds?(t.premiumCouponsIds.forEach(function(t){return window.localStorage.removeItem("action-premium-couponid-"+t)}),u.trigger("@premium-coupons","update")):void 0},showPopup:function(t){var e,n;if(e=t.popupName,n=t.popupType,e)return r.events.trigger("pageTransition:init",["?popupWidget="+n+"&popupName="+e,n+': {"target":"#OverlayContent","ns":"popup"}',"GET",{}])},showCounter:function(t){var e,i,o,r,c;if(r=this.states[t.id],o=t.id,o&&r&&(e=r.activateDate+(t.counterDays||0)*n,c=(e-Date.now())/1e3,!(c<=0)))return i={name:o,timeLeft:c,endTime:e},a.on("attached",function(t){var n,i;if(n=t.nodeName.toLowerCase(),i=t.getAttribute("name"),"base-counter"===n&&i===o)return t.setAttribute("end-time",e)}),u.trigger("@counter-timer","!init",i),u.trigger("@counter-timer","!show",i),i}}})}).call(this);
//# sourceMappingURL=bEventsNotifications.js.map
