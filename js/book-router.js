(function(angular, _) {
	"use strict";
	var app = angular.module("bookApp");
	
	app.config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider){
		$locationProvider.html5Mode(true);
		
		$routeProvider.when("/home", {
			templateUrl: __TPL__("tpl/search.html"),
			controller: "HomeCtrl"
		});
		
		$routeProvider.when("/books/douban", {
			templateUrl: __TPL__("tpl/books.html"),
			controller: "DoubanBooksCtrl"
		});
		
		$routeProvider.when("/libraries/:libraryID", {
			templateUrl: __TPL__("tpl/library.html"),
			controller: "LibraryCtrl"
		});
		
		$routeProvider.when("/books/wish", {
			templateUrl: __TPL__("tpl/wishes.html"),
			controller: "WishesCtrl"
		});
		$routeProvider.when("/books/own", {
			templateUrl: __TPL__("tpl/ownes.html"),
			controller: "OwnesCtrl"
		});
		$routeProvider.when("/books/mylibrary", {
			templateUrl: __TPL__("tpl/mylibrary.html"),
			controller: "MyLibraryCtrl"
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