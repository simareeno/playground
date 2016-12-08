define(["exports","packages/jquery","packages/react","css!components/controls/characters-select/styles","components/controls/select","components/jade-template"],function(exports,e,t,a,r,n){"use strict";function s(e){return e&&e.__esModule?e:{"default":e}}Object.defineProperty(exports,"__esModule",{value:!0});var c=s(e),l=s(t),i=(s(a),s(r)),o=s(n),u={alcyone:"Альсион",ceres:"Церера",terios:"Териос",gardarika:"Гардарика",lantis:"Лантис"};exports["default"]=l["default"].createClass({displayName:"CharactersSelect",getDefaultProps:function(){return{serviceId:0,listener:{}}},render:function(){var e=Object.assign({captionTemplate:this.captionTemplate,listItemTemplate:this.itemTemplate,fetchData:this.fetchData},this.props);return l["default"].createElement("span",{className:"characters_select"},l["default"].createElement(i["default"],e))},captionTemplate:function(e){return e.loader?l["default"].createElement("span",null,l["default"].createElement(o["default"],{name:"controls",params:{name:"bUISpinner",params:{type:"black"}}})):this.itemTemplate(e)},itemTemplate:function(e){var t;return e.extra&&(t=l["default"].createElement("i",{className:"characters_select-character-class_icon characters_select-character-class_icon--id_"+e.extra.gameCharClassId})),l["default"].createElement("span",{title:e.name},t,e.name)},notify:function(){var e=this.props.listener.trigger;"function"==typeof e&&e.apply(this.props.listener,arguments)},fetchData:function(){var e=this;return this.notify("fetch","start"),this.getCharactersData().then(function(e,t,a){return e.map(function(e){var r="",n=[e.name],s={};return t.some(function(t){if(e.worldId===t.worldId)return r=t.name,s=t,!0})&&n.push(u[r.toLowerCase()]||r),{name:n.join(", "),value:[e.gameCharId,s.gameWorldId,a[e.charId]].filter(function(e){return null!=e}).join("-"),extra:e}})}).then(function(t){if(t.length)e.notify("fetch","success");else{var a="У тебя нет персонажа";t.push({name:a,value:"error"}),e.notify("fetch","error",{message:a,type:"inner"})}return{items:t}})},getCharactersData:function(){var e=this;return c["default"].getJSON("/launcher/charactersData/?serviceId="+this.props.serviceId).then(function(e){var t=[],a={};return e.characters&&Object.keys(e.characters).forEach(function(a){t=t.concat(e.characters[a])}),e.gameCharClasses.forEach(function(e){a[e.charClassId]=e.gameCharClassId}),c["default"].Deferred().resolve(t.map(function(e){return Object.assign({gameCharClassId:a[e.charClassId]},e)}),e.worlds,e.signatures)},function(){e.notify("fetch","error",{message:"Не&nbsp;удалось получить твой список персонажей. Попробуй позже.",type:"external"})}).then(function(e,t,a){return c["default"].Deferred().resolve(e.filter(function(e){return!e.deleted}),t||[],a||{})})}})});
//# sourceMappingURL=characters-select.js.map
