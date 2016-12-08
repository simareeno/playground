(function(){define(["./helpers"],function(t){return{shareInWall:function(e){return t.popupCentralized(t.urlConstructor("https://vk.com/share.php",{url:e.url,title:t.smartQuotes(e.title),description:t.smartQuotes(e.text),image:e.img,noparse:!0}))}}})}).call(this);
//# sourceMappingURL=vkontakte.js.map
