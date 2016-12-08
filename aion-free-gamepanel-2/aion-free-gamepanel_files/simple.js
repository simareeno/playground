define(["exports","packages/che","packages/react","block!bForm/bForm_simple"],function(exports,t,i,o){"use strict";function e(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(exports,"__esModule",{value:!0});var r=e(t),n=e(i),a=e(o);exports["default"]=n["default"].createClass({displayName:"SimpleForm",statics:{nameFactory:function(t){return function(i){return t+"["+i+"]"}},toStateDiff:function(t,i,o,e,r){return r||(r={}),"function"!=typeof e&&(e=function(t){return t}),Object.keys(i).forEach(function(n){i[n]in t&&(o&&o.indexOf(n)>=0?r[e(n)]=!!t[i[n]]:r[e(n)]=t[i[n]])}),r}},getInitialState:function(){return{isValid:!1}},getDefaultProps:function(){return{validateSubmit:!1}},componentWillMount:function(){this.formWidget=Object.create(a["default"]),this.lastFormDataHash=null},componentDidMount:function(){this.formWidget=r["default"].widgets._manager.add("bForm_simple",this.getDOMNode(),a["default"]),this.formWidget.oForm.on("inputChanged",this.checkUpdates),this.formWidget.oForm.on("validationError",this.notifyAboutErrors),this.lastFormDataHash=JSON.stringify(this.getFormData()),this.checkUpdates()},componentDidUpdate:function(){this.formWidget.updateOValidateElements()},componentWillUnmount:function(){this.formWidget.oForm.off("inputChanged",this.checkUpdates),this.formWidget.oForm.off("validationError",this.notifyAboutErrors),this.formWidget.destroy(),this.formWidget=null,this.lastFormDataHash=null},render:function(){return n["default"].createElement("form",{noValidate:!0,id:this.props.id,onSubmit:this.onSubmit,"data-target":"bForm_simple","data-validate-submit":this.props.validateSubmit},this.props.children)},checkUpdates:function(){if(this.isMounted()&&this.formWidget&&this.formWidget.oForm){var t=this.formWidget.oForm.data("isValid");if(this.state.isValid!==t&&this.setState({isValid:t}),"function"==typeof this.props.onChange){var i=this.getFormData(),o=JSON.stringify(i);o!==this.lastFormDataHash&&(this.lastFormDataHash=o,this.props.onChange(i,t))}}},notifyAboutErrors:function(){"function"==typeof this.props.onErrors&&this.props.onErrors(this.formWidget.getValidationErrors())},onSubmit:function(t){this.state.isValid&&"function"==typeof this.props.onSubmit&&this.props.onSubmit(t)},getFormData:function(){var t={};return this.formWidget.oForm.serializeArray().forEach(function(i){t[i.name]=i.value}),t}})});
//# sourceMappingURL=simple.js.map