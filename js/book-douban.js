(function(angular){'use strict';

	var app = angular.module('bookDouban', []);
	
	var base_url = ((environment && environment.api_url)?environment.api_url:'') + '/v2/',
		defaultParameters = {},
		promiseThen = function(httpPromise, successcb, errorcb, transformFn) {
			return httpPromise.then(function(response) {
				var result = transformFn(response.data);
				(successcb || angular.noop)(result, response.status, response.headers, response.config);
				return result;
			}, function(response) {
				(errorcb || angular.noop)(undefined, response.status, response.headers, response.config);
				return undefined;
			});
		},
		prepareQueryParam = function(queryJson) {
			return angular.isObject(queryJson) && !angular.equals(queryJson, {}) ? {
				q: JSON.stringify(queryJson)
			} : {};
		};
	
	app.factory('dbBook', ["$http", function($http){

		var url = base_url + 'book/';
		var Book = function(data){angular.extend(this, data);},
			resourceRespTransform = function(data) {
				return new Book(data);
			},
			resourcesArrayRespTransform = function(data) {
				var result = [], books = data.books;
				for (var i = 0; i < books.length; i++) {
					result.push(new Book(books[i]));
				}
				return result;
			};
		Book.search = function(q, options, successCB, failureCB){
			if(angular.isFunction(options)){
				failureCB = successCB;
				successCB = options;
				options = {};
			}
			
			var params = {};
			
			if(q && q.indexOf('tag:') == 0){
				params.tag = q;
			}else{
				params.q = q;
			}
			
			options = options || {limit: 20, skip: 0};
			params.count = options.limit || 20;
			params.start = options.skip || 0;
			return promiseThen($http.get(url + 'search', {
				params: angular.extend(params, defaultParameters)
			}), successCB, failureCB, resourcesArrayRespTransform);
		};
		
		Book.isbn = function(isbn, successCB, failureCB){
			return promiseThen($http.get(url + 'isbn/' + isbn, {
				params: angular.extend({}, defaultParameters)
			}), successCB, failureCB, resourceRespTransform);
		}
		return Book;
	}]);

})(angular);