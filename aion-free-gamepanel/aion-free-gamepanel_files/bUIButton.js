(function(){define(["packages/jquery"],function(t){return{_DOM:{},init:function(n){var o,e,r,s;return s=function(t,n){return t.data("bUIButton").trigger("submit"===n||"progress"===n?"progress-start":"progress-stop")},r=this,o=r._DOM,e=void 0,o.$oContainer=t(n),e=o.$oContainer.closest("form").data("bUIButton",o.$oContainer).off(".bUIButton"),o.$oContainer.on("progress-start.bUIButton progress-stop.bUIButton",function(n){return"progress-start"===n.type?t(this).addClass("bUIButton__mState_Loading").attr("disabled","disabled"):t(this).removeClass("bUIButton__mState_Loading").removeAttr("disabled")}),o.$oContainer.hasClass("jsUIButton__mListen_Submit")&&e.on("submit.bUIButton",function(t){return s(e,t.isDefaultPrevented()?"stop":t.type)}),e.on("progress.bUIButton complete.bUIButton",function(t){return s(e,t.type)}),o.$oContainer.on("disabled-on.bUIButton disabled-off.bUIButton",function(n){var o;return o="disabled-on"===n.type,t(this)[o?"addClass":"removeClass"]("bUIButton__mState_disabled").attr("disabled",o)})},restore:function(){return this.init()},remove:function(n){return t(n).off(".bUIButton"),n=null,this.$oContainer=null}}})}).call(this);
//# sourceMappingURL=bUIButton.js.map