(function(angular, _) {
	"use strict";
	var app = angular.module("bookApp");
	
	app.config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider){
		$locationProvider.html5Mode(true);
		
		$routeProvider.when("/home", {
			templateUrl: __TPL__("tpl/search.html"),
			controller: "HomeCtrl"
		});		
		
		$routeProvider.otherwise({
			templateUrl: __TPL__("tpl/blank.html"),
			controller: ["$scope", "$routeParams", "$location", function($scope, $routeParams, $location){
				var loc = "/" + ($location.search().location || "home");
				$location.path(loc);
			}]
		});
	}]);
	
})(angular, _);