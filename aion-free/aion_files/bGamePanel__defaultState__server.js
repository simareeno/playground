(function(){define(["packages/jquery","packages/che"],function(t,e){return{timeout:20,domEvents:{"click .jsGamePanel__eDefaultState__Refresh":"refreshState","click .jsDownloadApp":"downloadApp"},moduleEvents:{"l4g:inited":"stopWatching"},turnOn:function(){return this.faultTimer=setTimeout(function(t){return function(){return t.showError()}}(this),1e3*this.timeout)},turnOff:function(){return this.stopWatching()},refreshState:function(){return location.reload()},showError:function(){return t(this.element).addClass("bGamePanel__eDefaultState__mState_fault"),e.events.trigger("game-panel-rendered")},downloadApp:function(){return window.A4G.download({serviceId:0}),!1},stopWatching:function(){return clearTimeout(this.faultTimer)}}})}).call(this);
//# sourceMappingURL=bGamePanel__defaultState__server.js.map
