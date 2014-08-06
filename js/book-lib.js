(function(angular, _) {
	"use strict";
	var app = angular.module("bookLib", ["bookResource"]);
	
	app.factory("ViewMoreList", ["$resourceHttp", function($mongolabResourceHttp){
		var Page = function(type, options){
			var self = this;
			var options = options || {};
			var listName = options.name || type;
			self.type = type;
			self.pagesize = options.page || 10;
			self.total = 0;
			var cbError = function() {};
			var retrievelist = function(currentpage, callback) {
				$mongolabResourceHttp(self.type).query(self.queryobj, {
					limit: self.pagesize,
					skip: self.pagesize * currentpage,
					sort: self.sortobj
				}, function(list) {
					callback && callback(list);
				}, cbError);
			};
			
			var retrieveDate = function(countCallback, queryCallback) {
				$mongolabResourceHttp(self.type).count(self.queryobj, function(countresult){
					countCallback && countCallback(countresult);
					retrievelist(0, queryCallback);
				}, cbError);
			};
			
			self.apply = function(scope, precb, postcb) {
				var callback = function(list){
					_.each(list, function(item){
						scope[listName].push(item);
					});
					postcb && postcb();
				};
				scope[listName] = [];
				scope.currentpage = 0;
				scope.nextpage = (scope.currentpage + 1);
				retrieveDate(function(total){
					self.total = total;
					scope.total = total;
					scope.numpages = Math.ceil(total / self.pagesize);
				},callback);
				scope.pageChanged = function(pageNumber){
					precb && precb();
					scope.currentpage = pageNumber;
					scope.nextpage = (scope.currentpage + 1);
					retrievelist(pageNumber, callback);
				};
			};
		};
		
		Page.prototype = {
			fields: function(){
				this.fields = {};
				for(var i=0;i<arguments.length;i++){
					this.fields[arguments[i]] = 1;
				}
				return this;
			},
			query: function(queryobj){
				this.queryobj = queryobj;
				return this;
			},
			sort: function(sortobj){
				this.sortobj = sortobj;
				return this;
			}
		};
		
		var exports = {};
		exports.generate = function(type, options){
			return new Page(type, options);
		};
		
		return exports;
	}]);
	
	app.factory('IDGenerator', ['$rootScope', function($rootScope){
		
		return {
			wishID: function(bookID){
				return ['wish', $rootScope.user._id, bookID].join('_');
			},
			ownID: function(bookID){
				return ['own', $rootScope.user._id, bookID].join('_');
			},
			libraryID: function(){
				return [$rootScope.user._id, 'private', 'library'].join('_');
			}
		}
	}]);
	
	app.factory('ObjectConverter', ['$rootScope', '$filter', 'Book', 'BookReference', 
	                                function($rootScope, $filter, Book, BookReference){
		var toReference = function(book){
			var ref = new BookReference(_.pick(book, 'title', 'author', 'price'));
			ref.image = $filter('image')(book.images);
			ref.bookID = book._id;
			if($rootScope.user){
				ref.container = {
					containerID: $rootScope.user._id,
					containerType: 'user'
				}
			}
			return ref;
		}
		return {
			toBook: function(dbBook){
				var book = new Book(_.pick(dbBook, 'isbn10', 'isbn13', 'images', 'author', 'translator', 'tags', 'price'));
				book.referID = dbBook.id;
				
				var title = dbBook.title;
				if(dbBook.subtitle){
					title = title + ' ' + dbBook.subtitle;
				}
				book.title = title;
				return book;
			},
			toWish: function(book){
				return _.extend(toReference(book), {
					types: ['wishship']
				});
			},
			toOwn: function(book){
				return _.extend(toReference(book), {
					types: ['ownership']
				});
			}
		}
	}]);
	
	app.directive('selectAll', function () {
		return {
			replace: true,
			restrict: 'E',
			scope: {
				checkboxes: '=',
				allselected: '=allSelected',
				allclear: '=allClear',
				handler: '=',
				postHandler: '='
			},
			template: '<button class="btn gray" ng-click="masterChange()">{{master?"全不选":"全选"}}',
			controller: function ($scope, $element) {
				$scope.master = true;
				$scope.masterChange = function () {
					if ($scope.master) {
						angular.forEach($scope.checkboxes, function (cb, index) {
							cb.selected = false;
						});
					} else {
						angular.forEach($scope.checkboxes, function (cb, index) {
							cb.selected = true;
						});
					}
				};

				$scope.$watch('checkboxes', function () {
					var allSet = true,
						allClear = true,
						selectedcbs = [];
					angular.forEach($scope.checkboxes, function (cb, index) {
						if (cb.selected) {
							allClear = false;
							$scope.handler && _.isFunction($scope.handler) && $scope.handler(cb);
							selectedcbs.push(cb);
						} else {
							allSet = false;
						}
					});

					if ($scope.allselected !== undefined) {
						$scope.allselected = allSet;
					}
					if ($scope.allclear !== undefined) {
						$scope.allclear = allClear;
					}
					$scope.postHandler && _.isFunction($scope.postHandler) && $scope.postHandler(selectedcbs);

					$element.prop('indeterminate', false);
					if (allSet) {
						$scope.master = true;
					} else if (allClear) {
						$scope.master = false;
					} else {
						$scope.master = false;
						$element.prop('indeterminate', true);
					}

				}, true);
			}
		};
	});
	
	app.filter("image", function(){
		//size: small - 64px, middle - 180px, large - 440px
		var mapping = {
			small: "small",
			middle: "medium",
			large: "large"
		}
		return function(input, type){
			type = type || "small";
			if(!input){
				return "";
			}
			if(angular.isObject(input)){
				var key = mapping[type] || mapping.small;
				return input[key] || "";
			}else{
				return input;
			}
		};
	});
	
	app.filter("count", function() {
		return function(input) {
			return input || "0";
		};
	});

	
})(angular, _);