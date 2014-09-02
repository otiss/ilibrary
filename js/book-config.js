(function(angular, _) {
	"use strict";
	var app = angular.module("bookApp");
	
	app.config(["$config", "$httpProvider", "$resourceHttpProvider",
	function($config, $httpProvider, $resourceHttpProvider){
		function toJsonReplacer(key, value) {
		  var val = value;

		  if (typeof key === 'string' && key.charAt(0) === '$') {
			val = (key === '$set' || key === "$addToSet")?val:undefined;
		  } 

		  return val;
		}
		function toJson(obj, pretty) {
		  if (typeof obj === 'undefined') return undefined;
		  return JSON.stringify(obj, toJsonReplacer, pretty ? '  ' : null);
		}
		$httpProvider.defaults.transformRequest = [function(d) {
			return angular.isObject(d) ? toJson(d) : d;
		}]
		
		$httpProvider.interceptors.push(["$q", "$location", function($q, $location) {
			return {
			  'responseError': function(rejection) {
				if(rejection.status === 401){
					$location.path("/warning/notLogined");
				}
				if(rejection.status === 403){
					//alert("无权限访问");
				}
				return $q.reject(rejection);
			  }
			};
		  }]);
		
		
		$resourceHttpProvider.setAuthParams({
			userID: ((loginedUser && loginedUser._id) || "anonymous"),
			openID: ((loginedUser && loginedUser.weixin) || "anonymous")
		});
		$resourceHttpProvider.setConfig({
			DB_NAME: "cvs",
			BASE_URL: $config.url + "/databases/ilibrary/collections/"
		});
	}]);

	app.constant("$config", {
		url: (environment && environment.api_url)?environment.api_url:""
	})
	
	app.factory("User", ["$resourceHttp", function($mongolabResourceHttp){
		return $mongolabResourceHttp("users", 'user');
	}]);
	app.factory("Book", ["$resourceHttp", function($mongolabResourceHttp){
		return $mongolabResourceHttp("books", 'book');
	}]);
	app.factory("BookReference", ["$resourceHttp", function($mongolabResourceHttp){
		return $mongolabResourceHttp("bookReferences", 'bookRef');
	}]);
	app.factory("Library", ["$resourceHttp", function($mongolabResourceHttp){
		return $mongolabResourceHttp("libraries", 'library');
	}]);

    app.factory("Activity", ["$resourceHttp", function($mongolabResourceHttp){
        return $mongolabResourceHttp("activities", 'activity');
    }]);
    app.factory("Transaction", ["$resourceHttp", function($mongolabResourceHttp){
        return $mongolabResourceHttp("transactions", 'transaction');
    }]);

})(angular, _);