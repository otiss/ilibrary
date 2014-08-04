(function(angular, _) {
	"use strict";
	var app = angular.module("bookApp", ["ngRoute", "ajoslin.mobile-navigate", "ngCookies", "mobile-angular-ui", "bookResource", "bookLib", "bookDouban"]);
	
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
		return $mongolabResourceHttp("users");
	}]);
	app.factory("Book", ["$resourceHttp", function($mongolabResourceHttp){
		return $mongolabResourceHttp("books");
	}]);
	app.factory("BookReference", ["$resourceHttp", function($mongolabResourceHttp){
		return $mongolabResourceHttp("bookReferences");
	}]);
	app.factory("Library", ["$resourceHttp", function($mongolabResourceHttp){
		return $mongolabResourceHttp("libraries");
	}]);
	
	
	app.run(["$rootScope", "$location", "$window", "$cookies", "$filter", "$navigate", "$document", 
	         "User", "Book", "Library",
	function($rootScope, $location, $window, $cookies, $filter, $navigate, $document, 
			User, Book, Library){
		
		var userID = loginedUser._id;
		$rootScope.user = new User(loginedUser);
		$rootScope.go = function(path, transition){
			transition = transition || "none";
			$navigate.go(path, transition);
		}
		$rootScope.back = function(){
			$navigate.back();
		}
		$rootScope.$on("$routeChangeStart", function(){
			$rootScope.loading = true;
		});
		$rootScope.$on("$routeChangeSuccess", function(){
			$rootScope.loading = false;
		});
		
		var library = $rootScope.library = {};
		Book.query({}, function(books){
			library.books = books;
		});
		$rootScope.libraries = [];
		Library.query({}, function(libraries){
			$rootScope.libraries = libraries;
		});
		
	}]);

})(angular, _);