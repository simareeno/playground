(function(){define(["packages/jquery","packages/che"],function(e,a){var t,n;return n=e(window),t=e(document),{moduleEvents:{"game-panel-rendered":"checkGamePanel","game-panel-flip":"saveGamepanelHeight","l4g-panel-became-compact":"waitGamepanelHeight","l4g-panel-became-expand":"waitGamepanelHeight"},turnOn:function(){return this.setDom(),this.saveSizes(),this.setScrollHandlers(),this.triggerFixedElementAppear(),this.updateStickiness()},turnOff:function(){return this.unsetScrollHandlers(),this.triggerFixedElementDisappear()},setDom:function(){return this.dom={},this.dom.playWrap=e(".bPlayLayout__eWrapper"),this.dom.playGamepanel=e(".bPlayLayout__eGamepanel"),this.dom.gamepanelContainer=e("#GamePanel"),this.dom.gamepanel=this.dom.gamepanelContainer.find(".bGamePanelCommon"),this.dom.gamepanelSettings=this.dom.gamepanelContainer.find(".bGamePanelSettings")},setScrollHandlers:function(){return n.on("scroll.bPlayLayout__eGamepanel",function(e){return function(a){return e.updateStickiness()}}(this))},unsetScrollHandlers:function(){return n.off("scroll.bPlayLayout__eGamepanel")},getCurrentPanelHeight:function(){return this.dom[this.dom.gamepanelContainer.hasClass("bGamePanelWrap__mShow_FaceFull")?"gamepanel":"gamepanelSettings"].outerHeight(!0)},saveSizes:function(){return this.sizes={gpColumnPadding:parseInt(this.dom.playGamepanel.css("padding-top"),10)+parseInt(this.dom.playGamepanel.css("padding-bottom"),10)}},updateStickiness:function(){var e,a;return a=n.scrollTop(),e=this.dom.playWrap.offset().top+this.dom.playWrap.height()-this.sizes.gpColumnPadding-a,a>this.dom.playWrap.offset().top?e<this.getCurrentPanelHeight()?this.makeGamepanelStick():this.makeGamepanelFloated():this.resetGamepanelState()},resetGamepanelState:function(){return this.dom.playGamepanel.removeClass("bPlayLayout__eGamepanel__mState_floating bPlayLayout__eGamepanel__mState_bottom")},makeGamepanelStick:function(){return this.dom.playGamepanel.removeClass("bPlayLayout__eGamepanel__mState_floating").addClass("bPlayLayout__eGamepanel__mState_bottom")},makeGamepanelFloated:function(){return this.dom.playGamepanel.removeClass("bPlayLayout__eGamepanel__mState_bottom").addClass("bPlayLayout__eGamepanel__mState_floating")},saveGamepanelHeight:function(){if(!this.heightSaved)return this.heightSaved=!0,clearTimeout(this.heightTimeout),this.updateStickiness()},checkGamePanel:function(){return this.setDom(),this.updateStickiness()},waitGamepanelHeight:function(){return this.heightSaved=!1,this.dom.gamepanel.one("transitionend webkitTransitionEnd otransitionend oTransitionEnd",function(e){return function(){return e.saveGamepanelHeight()}}(this)),this.heightTimeout=setTimeout(function(e){return function(){return e.saveGamepanelHeight()}}(this),400)},triggerFixedElementAppear:function(){return t.trigger("fixed-element-appear",".bGamePanelFixed__eSideWrapper"),a.events.trigger("fixed-element-appear",".bGamePanelFixed__eSideWrapper")},triggerFixedElementDisappear:function(){return t.trigger("fixed-element-disappear",".bGamePanelFixed__eSideWrapper"),a.events.trigger("fixed-element-disappear",".bGamePanelFixed__eSideWrapper")}}})}).call(this);
//# sourceMappingURL=bPlayLayout__eGamepanel.js.map
