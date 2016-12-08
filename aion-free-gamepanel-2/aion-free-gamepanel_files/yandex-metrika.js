(function(){define(["module"],function(n){var o;return o=n.config(),{reachGoal:function(n,a){var r;return null!=(r=window[o.counterId])?r.reachGoal(n,a):void 0},reachGoalIfMatchUrl:function(n,o){var a,r,e,t;t=[];for(r in n)a=n[r],e=new RegExp(r),e.test(window.location.pathname)?t.push(this.reachGoal(a,o)):t.push(void 0);return t}}})}).call(this);
//# sourceMappingURL=yandex-metrika.js.map
