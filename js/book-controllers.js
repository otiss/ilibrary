(function(angular, _) {
	'use strict';
	var app = angular.module('bookApp');
	
	app.controller('HomeCtrl', ['$scope', 'dbBook', 'Book', function($scope, dbBook, Book){
		$scope.search = function(keywords){
			dbBook.search(keywords, function(datas){
				if(datas && datas.length > 0){
					$scope.books = _.map(datas, function(data){
						var book = new Book(_.pick(data, 'isbn10', 'isbn13', 'images', 'author', 'translator', 'tags', 'price'));
						book.referID = data.id;
						book._id = data.id;
						var title = data.title;
						if(data.subtitle){
							title = title + ' ' + data.subtitle;
						}
						book.title = title;
						return book;
					});
				}
			});
		}
	}]);
	
})(angular, _);