(function(){define(["packages/jquery"],function(t){var e,n,i;return e=i=n=null,{moduleEvents:{"pageTransition:success":"updateMetaParams"},init:function(a){return e=t(a),i=e.find("title"),n=e.find("link[rel='shortcut icon']"),i.length||(i=t(document.createElement("title")).appendTo(e)),n.length||(n=t(document.createElement("link")).attr({rel:"shortcut icon",type:"image/ico"}).appendTo(e)),this.updateMetaParams()},updateMetaParams:function(e){var a,r;if(null==e||!(null==(null!=(a=e.transition)&&null!=(r=a.state)?r.sectionsHeader:void 0)||e.transition.state.sectionsHeader.indexOf("pageView")<0))return i.text(t("title:first").text()),n.attr("href",t("link[rel='shortcut icon']").attr("href"))}}})}).call(this);
//# sourceMappingURL=bParentPageMetaParams.js.map