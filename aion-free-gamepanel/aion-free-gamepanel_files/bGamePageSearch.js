(function(){define(["packages/jquery"],function(t){return{tips:null,form:null,domEvents:{"click .bGamePageSearch__eTipValue":"handleClickOnTip","submit @element":"rejectEmptyForm"},init:function(){return this.form=t(this.element),this.saveTips()},handleClickOnTip:function(e,n){var i;return i=t(n),this.setInputTip(i),this.changeTip(i)},rejectEmptyForm:function(e){var n,i;return e.preventDefault(),n=this.form.find(".bGamePageSearch__eQuery .bUIInput__eControl"),n.val(n.val().replace(/^\s+|\s+$/g,"")),n.val().length?(i=this.form.attr("action")+"?",this.form.find("input").each(function(){var e;if(e=t(this).attr("name"))return i+=e+"="+t(this).val()+"&"}),window.open(i)):n.focus()},setInputTip:function(t){return this.form.find(".bGamePageSearch__eQuery .bUIInput__eControl").val(t.text()).focus()},changeTip:function(t){var e;return e=this.tips[Math.floor(Math.random()*this.tips.length)],t.text(e)},saveTips:function(){return this.tips=this.form.find(".bGamePageSearch__eTipValue").data("tips").split(",")}}})}).call(this);
//# sourceMappingURL=bGamePageSearch.js.map
