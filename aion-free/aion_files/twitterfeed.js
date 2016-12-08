(function(){define(["external!twitter-widgets"],function(t){return{init:function(){return this.backup=this.element.innerHTML,t.then(this.turnOn.bind(this))},turnOn:function(){var t;if(null!=window.twttr)return this.element.innerHTML=this.backup,null!=(t=window.twttr.widgets)&&"function"==typeof t.load?t.load():void 0}}})}).call(this);
//# sourceMappingURL=twitterfeed.js.map
