define(["exports","block!purchase/tools","block!purchase/flow-client"],function(exports,n,o){"use strict";function r(r){var t=n.assign({onProductsLoadingStarted:function(){},onProductsLoaded:function(){},onProductPurchasingStarted:function(){},onProductPurchased:function(){}},r),e=new n.EventBus(document);return e.on(o.EVENTS.PRODUCTS_LOADING_STARTED,t.onProductsLoadingStarted),e.on(o.EVENTS.PRODUCTS_LOADED,function(n){var o=n.detail,r=o&&o.isError;t.onProductsLoaded(r?o.error:null,n)}),e.on(o.EVENTS.PRODUCT_PURCHASING_STARTED,t.onProductPurchasingStarted),e.on(o.EVENTS.PRODUCT_PURCHASED,function(n){var o=n.detail,r=o&&o.isError;t.onProductPurchased(r?o.error:null,n)}),t.initialize&&t.initialize(),this}Object.defineProperty(exports,"__esModule",{value:!0}),exports.PurchaseAgent=r});
//# sourceMappingURL=purchase-agent.js.map
