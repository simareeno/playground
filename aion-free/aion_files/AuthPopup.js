define(["exports","packages/che","block!purchase/tools","block!purchase/flow-client","block!purchase/purchase-agent"],function(exports,e,t,n,u){"use strict";function o(){var o=arguments.length<=0||void 0===arguments[0]?{}:arguments[0];o.container,o.eventBus||new t.EventBus(document);return new u.PurchaseAgent({onProductPurchased:function(t,u){t&&n.ERRORS.Unauthorized===t.status&&e.events.trigger("pageTransition:init",["?popupWidget=AuthPopupWidget",'AuthPopupWidget: {"target":"#OverlayContent","ns":"popup"}',"GET",{}])}})}Object.defineProperty(exports,"__esModule",{value:!0}),exports.AuthPopup=o});
//# sourceMappingURL=AuthPopup.js.map