define("l4g/assets/app-interface",["packages/l4gApp"],function(e){function n(){this.getListener=function(){return e.backend.connected()?function(n,t){e.backend.trigger(n,"object"==typeof t?JSON.stringify(t):t)}:function(){}},this.needUpdate=function(){e.setWorkingMode(e.WORKING_MODE.NEED_UPDATE)}}var t;return n.prototype=e.backend,{get:function(){return t||(t=new n),t},set:function(n){if(e.getWorkingMode()!=e.WORKING_MODE.FAKE){var t=this,c=function(){"fake"===this.getActiveBackend()&&(n(t.get()),e.backend.off("connect",c))};e.backend.on("connect",c).connect("fake")}else n(this.get())}}});