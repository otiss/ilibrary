(function(angular, _) {
	'use strict';
	var app = angular.module('bookApp');
	
	app.controller('HomeCtrl', ['$scope', '$rootScope', '$filter', 'dbBook', 'Book', 'BookReference', 'IDGenerator', 'ObjectConverter', 
	                            function($scope, $rootScope, $filter, dbBook, Book, BookReference, Generator, Converter){
		Book.query({type: 'recommend'}, {count: 20}, function(books){
			var bookIDs = _.pluck(books, '_id');
			if($rootScope.user && bookIDs && bookIDs.length > 0){
				BookReference.query({bookID: {$in: bookIDs}, container: {containerID: $rootScope.user._id, containerType: 'user'}}, function(brs){
					_.each(books, function(book){
						var found = _.find(brs, function(br){
							return br.bookID == book._id && br.types && br.types.indexOf('wishship') > -1;
						});
						if(found){
							book.$$alreadyWish = true;
						}
						found = _.find(brs, function(br){
							return br.bookID == book._id && br.types && br.types.indexOf('ownership') > -1;
						});
						if(found){
							book.$$alreadyShare = true;
						}
					})
				});
			}
			$scope.books = books;
		});
		
		$scope.search = function(event, keywords){
			var keycode = (event.keyCode ? event.keyCode : event.which);
			if(keywords && keycode == 13){
				$scope.$emit('loading.start');
				dbBook.search(keywords, function(datas){
					$scope.$emit('loading.end');
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
	
	app.controller('DoubanBooksCtrl', ['$scope', '$filter', 'dbBook', 'Book', 'BookReference', 'IDGenerator', 'ObjectConverter', 
	                            function($scope, $filter, dbBook, Book, BookReference, Generator, Converter){
		$scope.search = function(event, keywords){
			if(keywords && event.keyCode){
				dbBook.search(keywords, function(datas){
					if(datas && datas.length > 0){
						$scope.books = _.map(datas, function(data){
							var book = Converter.toBook(data);
							book._id = data.isbn13;
							return book;
						});
					}
				});
			}
		};
		
		$scope.add = function(index, book){
			Book.query({id: book._id}, function(data){
				var exist = data && data.length > 0;
				if(!exist){
					book.type = 'recommend';
					book.$save(function(){
						console.log('added ', book);
					});
				}
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
	
	app.controller('EditUserCtrl', ['$scope', '$rootScope', 'User', 
	                               function($scope, $rootScope, User){
		var userID = '';
		if($rootScope.user && $rootScope.user._id){
			userID = $rootScope.user._id;
		}
		if(userID){
			User.getById(userID, function(user){
				$scope.user = user;
			})
		}else{
			$scope.user = new User();
		}
	}]);
	
})(angular, _);