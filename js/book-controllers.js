(function(angular, _) {
	'use strict';
	var app = angular.module('bookApp');
	
	app.controller('HomeCtrl', ['$scope', '$filter', 'dbBook', 'Book', 'IDGenerator', 'ObjectConverter', 
	                            function($scope, $filter, dbBook, Book, Generator, Converter){
		$scope.search = function(event, keywords){
			if(keywords && event.keyCode){
				dbBook.search(keywords, function(datas){
					if(datas && datas.length > 0){
						$scope.books = _.map(datas, function(data){
							var book = Converter.toBook(data);
							book._id = data.id;
							return book;
						});
					}
				});
			}
		};
		
		$scope.wish = function(index, book){
			var wbook = Converter.toWish(book);
			wbook.$save(function(){
				book.$$alreadyWish = true;
			});
		};
		
		$scope.own = function(index, book){
			var obook = Converter.toOwn(book);
			obook.$save(function(){
				book.$$alreadyOwn = true;
			});
		};
	}]);
	
	app.controller('LibraryCtrl', ['$scope', '$routeParams', 'User', 'Library', 'BookReference', 
	                               function($scope, $routeParams, User, Library, BookReference){
		var libID = $routeParams.libraryID,
			queryObj = {container: {containerID: libID, containerType: 'user'}};
		BookReference.query(queryObj, function(brs){
			$scope.books = brs;
		});
		
		User.getById(libID, function(user){
			var lib = $scope.library = new Library(_.pick(user, '_id'));
			lib.name = user.name + '的图书馆';
		});
	}]);
	
	app.controller('WishesCtrl', ['$scope', '$rootScope', 'BookReference', 
	                               function($scope, $rootScope, BookReference){
		var queryObj = {types: {$all: ['wishship']}, container: {containerID: $rootScope.user._id, containerType: 'user'}};
		BookReference.query(queryObj, function(brs){
			$scope.books = brs;
		});
	}]);
	
	app.controller('OwnesCtrl', ['$scope', '$rootScope', 'BookReference', 
	                               function($scope, $rootScope, BookReference){
		var queryObj = {types: {$all: ['ownership']}, container: {containerID: $rootScope.user._id, containerType: 'user'}};
		BookReference.query(queryObj, function(brs){
			_.each(brs, function(br){
				if(br.types && br.types.indexOf('public')>-1){
					br.$$alreadyShare = true;
				}
			})
			$scope.books = brs;
		});
		
		$scope.share = function(index, book){
			var updateObj = _.pick(book, 'types');
			updateObj.types = updateObj.types || [];
			updateObj.types.push('public');
			book.$updateset(updateObj, function(){
				book.types = updateObj.types;
				book.$$alreadyShare = true;
			});
		}
	}]);
	app.controller('MyLibraryCtrl', ['$scope', '$rootScope', 'BookReference', 
	                               function($scope, $rootScope, BookReference){
		var queryObj = {types: {$all: ['ownership', 'public']}, container: {containerID: $rootScope.user._id, containerType: 'user'}};
		BookReference.query(queryObj, function(brs){
			$scope.books = brs;
		});
	}]);
})(angular, _);