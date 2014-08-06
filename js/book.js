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
		
		$rootScope.go = function(path, options, transition, location){
			if(_.isObject(options)){
				options = options || {};
			}else{
				var location = options;
				options = {
					location: options,
					transition: 'none'
				};
			}
			$navigate.go(path, options.transition || "none");
			if(options.location){
				$rootScope.toggle(options.location, 'off');
			}
		}
		$rootScope.back = function(){
			$navigate.back();
		}
		$rootScope.$on("$routeChangeStart", function(event, route, c){
			if(route.$$route && route.$$route.needLogin && !($rootScope.user && $rootScope.user._id)){
                return $rootScope.go('/');
            }
            $rootScope.loading = true;
		});
		$rootScope.$on("$routeChangeSuccess", function(){
			$rootScope.loading = false;
		});
		$rootScope.$on("loading.start", function(){
			$rootScope.loading = true;
		});
		$rootScope.$on("loading.end", function(){
			$rootScope.loading = false;
		});
		
		var userID = loginedUser && loginedUser._id;
		if(userID){
			$rootScope.user = new User(loginedUser);
		}else if($location.search() && $location.search().userID){
			userID = $location.search().userID;
			User.query({_id: userID}, function(users){
				if(users && users.length > 0){
					$rootScope.user = users[0];
					_.extend(loginedUser, $rootScope.user);
				}else{
					var newUser = new User({_id: userID, type: 'library'});
					newUser.$save(function(){
						userID = newUser._id;
						$rootScope.user = newUser;
						_.extend(loginedUser, $rootScope.user);
						$rootScope.$emit('libraries.refresh');
						$rootScope.go('/users/self/edit');
					});
				}
			});
		}		
		
		$rootScope.libraries = [];
		$rootScope.$on('libraries.refresh', function(){
			User.query({type: 'library'}, function(users){
				var libraries = _.map(users, function(user){
					var lib = new Library(_.pick(user, '_id')); 
					lib.name = user.name;
					return lib;
				});
				$rootScope.libraries = libraries;
			});
		});
		$rootScope.$emit('libraries.refresh');
		
	}]);

})(angular, _);