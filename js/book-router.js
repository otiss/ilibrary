(function(angular, _) {
	"use strict";
	var app = angular.module("bookApp");
	
	app.config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider){
		$locationProvider.html5Mode(true);
		
		$routeProvider.when("/home", {
			templateUrl: __TPL__("tpl/search.html"),
			controller: "HomeCtrl"
		});
		
		$routeProvider.when("/signin", {
			templateUrl: __TPL__("tpl/signin.html"),
			controller: "SignInCtrl"
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
			controller: "WishesCtrl",
            needLogin: true
		});
		$routeProvider.when("/books/own", {
			templateUrl: __TPL__("tpl/ownes.html"),
			controller: "OwnesCtrl",
            needLogin: true
		});
		$routeProvider.when("/books/mylibrary", {
			templateUrl: __TPL__("tpl/mylibrary.html"),
			controller: "MyLibraryCtrl",
            needLogin: true
		});
        $routeProvider.when("/books/isbn/:isbn", {
            templateUrl: __TPL__("tpl/book.html"),
            controller: "DoubanBookCtrl"
        });
		$routeProvider.when("/users/self/edit", {
			templateUrl: __TPL__("tpl/editUser.html"),
			controller: "EditUserCtrl",
            needLogin: true
		});
		$routeProvider.when("/messages", {
			templateUrl: __TPL__("tpl/messages.html"),
			controller: "MessagesCtrl",
            needLogin: true
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