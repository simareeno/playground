function returnObj2Str(o){return"object"==typeof o?JSON.stringify(o):o}!function(){var o,e,n,t,s,i,l,r,d,a={id:"DevConsole",jsId:"jsDevConsole",hotkeys:!0,sHotKeysJSUrl:"//yandex.st/jquery/hotkeys/1.0.0/jquery.hotkeys.min.js",keyEnable:["⌥+⇧+s","Ctrl+Shift+s"],cookies:!0,sCookiesJSUrl:"//yandex.st/jquery/cookie/1.0/jquery.cookie.min.js",json2:["//yandex.st/json2/2011-10-19/json2.min.js"],speed:200},c=!1,p={OPENED:"dev-console-opened",CLOSED:"dev-console-closed",READY:"dev-console-ready"},v=function(){$("<style>  #DevConsole{border:2px solid #ababab;color:#efefef;width:100%;height:1px;position:fixed;bottom:0;left:0;opacity:0;z-index:1000}#DevConsole .content{position:relative;width:100%;padding:20px;font:12px Courier New;z-index:1002}#DevConsole .bg{position:absolute;top:0;left:0;width:100%;height:100%;background:black;opacity:.8;z-index:1001}#DevConsole .control{display:block;width:400px;border-right:1px solid #ababab;float:left}#DevConsole .console{width:auto;height:270px;overflow-y:scroll;margin:0 20px 0 20px;padding-left:40px}#DevConsole .logString{border-bottom:1px dashed #444;padding:5px 0;position:relative;overflow:hidden}#DevConsole .logStringHeader{float:left;width:130px;color:white}#DevConsole .logStringContent{padding-left:150px;color:#cdcdcd}#DevConsole .logStringContent .json{cursor:pointer}#DevConsole .logStringContent .json-error{color:red}#DevConsole .logStringContent .json-success{color:#a0e411;-webkit-transition:opacity .5s ease;-moz-transition:opacity .5s ease;-ms-transition:opacity .5s ease;-o-transition:opacity .5s ease;transition:opacity .5s ease}#DevConsole .logStringContent .json-success.hide{opacity:0}#DevConsole.open{height:300px;opacity:1}#DevConsole.close{height:1px;opacity:0}#DevConsole.open,#DevConsole.close{-webkit-transition:all 200ms ease-in;-moz-transition:all 200ms ease-in;-ms-transition:all 200ms ease-in;-o-transition:all 200ms ease-in;transition:all 200ms ease-in;}</style>").appendTo("head"),e=$("<div></div>").attr("id",a.id),n=$('<div class="content"></div>').appendTo(e),t=$('<div class="bg"></div>').appendTo(e),l=$('<div class="control"></div>').appendTo(n),s=$('<div class="console"></div>').appendTo(n),i=$('<div class="logString"><div class="logStringHeader"></div><div class="logStringContent"></div></div>'),r=$('<div class="json-success" />').html("Printed to console")},u=function(){e.on("click.innDevConsole",".logString .logStringContent .json",function(o){var e=$(o.currentTarget);try{console.debug("[Devconsole]:",JSON.parse(e.html())),r.insertAfter(e).removeClass("hide"),clearTimeout(d),d=setTimeout(function(){r.addClass("hide")},2e3)}catch(o){$('<div class="json-error" />').html(o.toString()).insertAfter(e.removeClass("json"))}})},g=function(){return e.removeClass("close").addClass("open"),$(document).trigger(p.OPENED),this},h=function(){return e.removeClass("open").addClass("close"),$(document).trigger(p.CLOSED),this},f=function(){for(var o=0;o<a.keyEnable.length;o++)$(document).bind("keyup",a.keyEnable[o],function(){c?h():g()})},C=function(){$(document).bind(p.OPENED,function(){c=!0,$.cookie("dev-console-opened",!0,{path:"/"})}),$(document).bind(p.CLOSED,function(){c=!1,$.cookie("dev-console-opened",null,{path:"/"})})},m=function(){return!window.bDevConsoleInited&&(window.bDevConsoleInited=!0,o=$("#"+a.jsId),v(),u(),e.prependTo("body").eq(0),C(),y(),$(document).bind("show-console",g),void $(document).trigger(p.READY,[{events:p,options:a,log:w,logHTML:D,useOwnContent:S,registerControl:j,registerConsole:k}]))},y=function(){if(!window.Modernizr)return!1;for(var e,n=!0,t=0;t<document.styleSheets.length;t++)if(e=document.styleSheets[t],e&&e.ownerNode&&~(e.ownerNode.href||"").indexOf("inn.devconsole.css")){n=!1;break}n&&window.Modernizr.load({load:o.data("url-path")+"/inn.devconsole.css"}),window.Modernizr.load({test:$.hotkeys,nope:a.sHotKeysJSUrl,complete:f}),window.Modernizr.load({test:$.cookie,nope:a.sCookiesJSUrl,complete:b}),window.Modernizr.load({test:JSON.stringify,nope:a.json2})},b=function(){$.cookie("dev-console-opened")&&g()},w=function(o,e,n){o||(o="&nbsp;");var t=i.clone();$("div:eq(0)",t).css("color",n).html(e),$("div:eq(1)",t).html('<span class="json">'+returnObj2Str(o)+"</span>"),D(t)},D=function(o){s.append(o).scrollTop(s[0].scrollHeight)},S=function(o){n.html(o)},j=function(o){l.html(o)},k=function(o){s.html(o)};$(document).ready(m)}();