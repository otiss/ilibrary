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
			if(keywords && event.keyCode == 13){
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
	
	app.controller('LibraryCtrl', ['$scope', '$routeParams', 'User', 'Library', 'BookReference', 'ActivityGenerator',
	                               function($scope, $routeParams, User, Library, BookReference, ActivityGenerator){
		var libID = $routeParams.libraryID,
			queryObj = {container: {containerID: libID, containerType: 'user'}};
		BookReference.query(queryObj, function(brs){
			$scope.books = brs;
		});
		
		User.getById(libID, function(user){
			var lib = $scope.library = new Library(_.pick(user, '_id'));
			lib.name = user.name;
		});

         $scope.want = function($index, book){
            var act = ActivityGenerator.fromBookReference('request.borrow', book, $scope.library);
			if(act.target){
				act.target.name = book.title;
			}
            act.$save(function(){
               book.$$alreadyRequest = true;
            });
         }

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
			$scope.user = new User({type: 'library'});
		}
		
		$scope.save = function(){
			var updateObj = _.pick($scope.user, 'name', 'username', 'password');
			$scope.user.$updateset(updateObj, function(){
				_.extend($rootScope.user, updateObj);
				$rootScope.go('/');
			});
		}
		
	}]);
	
	
	app.controller('MessagesCtrl', ['$scope', '$rootScope', 'Activity', 'Transaction',
	                               function($scope, $rootScope, Activity, Transaction){
		$scope.messages = $rootScope.requests.items;

        $scope.accept = function(index, message){
            var transaction = new Transaction({
                purchaser: {
                    purchaserID: message.actor.actorID,
                    purchaserName: message.actor.name
                },
                vendor: {
                    vendorID: message.context.contextID,
                    vendorName: message.context.name
                },
                goods: {
                    goodsID: message.target.targetID,
                    goodsName: message.target.name
                },
                amount: 0,
                status: 5
            });
            transaction.$save(function(){
                $scope.messages.splice(index, 1);
            });
        }
	}]);
	
	app.controller('SignInCtrl', ['$scope', '$rootScope', 'User', 
	                               function($scope, $rootScope, User){
		$scope.user = new User();
		
		$scope.login = function(){
			var username = $scope.username, password = $scope.password;
			User.query({username: username}, function(users){
				if(users && users.length > 0){
					if(users[0].password === password){
                        $rootScope.user = users[0];
                        _.extend(loginedUser, $rootScope.user);
                        $rootScope.$emit('libraries.refresh');
                        $rootScope.$emit('request.refresh');
                        $rootScope.go('/');
                    }else{
                        $scope.warning = '密码错误';
                        $scope.username = '';
                        $scope.password = '';
                    }
				}else{
					$scope.warning = '找不到此用户';
					$scope.username = '';
                    $scope.password = '';
				}
			});
		};
		
		$scope.cancel = function(){
			$rootScope.go('/');
		}
	}]);
	
})(angular, _);