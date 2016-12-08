define(['packages/jquery'], function($) {
	return {
		load: function(name, req, onload) {
			var deferred = $.Deferred();

			onload(deferred.promise());

			req([name], function(component) {
				deferred.resolve(component);
			}, function(error) {
				deferred.reject(error);
			});
		}
	};
});
