(function(){define(["packages/4game-ns-client","packages/che","packages/jquery"],function(n,t,e){var i,s;return s={popup:"PromoPopupWidget","popup-notification":"NotificationPopupWidget"},i=function(n){var t,e;return n=n.replace(/(\[|\])/g,"\\$1"),t=new RegExp("[\\?&]"+n+"=([^&#]*)"),e=t.exec(location.search),e?decodeURIComponent(e[1].replace(/\+/g," ")):""},{init:function(n){return this.params=e(n).data("js-params")||{},this.nsClientSubscribers=[]},turnOn:function(){return this.overlay=e("#OverlayContent"),Object.keys(s).forEach(function(t){return function(e){return t.nsClientSubscribers.push(n.subscribe(function(n){return t.notificationReceived(n)},{type:e,tags:t.params.tags}))}}(this))},turnOff:function(){return this.nsClientSubscribers.forEach(n.unsubscribe),this.nsClientSubscribers.length=0,t.events.unbind("pageTransition:success",this.popupOpened,this),this.unbindPopupEvents()},notificationReceived:function(n){var e,o;return this.notification=n,o=s[n.type],e=this.overlay[0].childNodes.length,i("popupWidget")?e?this.popupOpened():t.events.bind("pageTransition:success",this.popupOpened,this):(t.events.bind("pageTransition:success",this.popupOpened,this),t.events.trigger("pageTransition:init",["?popupWidget="+o+"&popupName="+n.name,o+': {"target":"#OverlayContent","ns":"popup"}',"GET",{}]))},popupOpened:function(){var i,s;if(t.events.unbind("pageTransition:success",this.popupOpened,this),i=e(""+this.notification.name),i.length||(i=e(".bUIPopup [data-popup-name='"+this.notification.name+"']")),i.length)return s=function(t){return function(){return t.unbindPopupEvents(),n.markAsRead(t.notification)}}(this),this.overlay.on("markAsRead.bPopupNotifications",".jsUIPopup",s),this.overlay.on("click.bPopupNotifications",".bUIPopup__eClose, .jsRead, a[href]",s)},unbindPopupEvents:function(){return this.overlay.off(".bPopupNotifications")}}})}).call(this);
//# sourceMappingURL=bPopupNotifications.js.map