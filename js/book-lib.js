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
	
	app.directive('selectAll', function () {
		return {
			replace: true,
			restrict: 'E',
			scope: {
				checkboxes: '=',
				allselected: '=allSelected',
				allclear: '=allClear',
				sum: '=',
				handler: '='
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
						sum = 0;
					angular.forEach($scope.checkboxes, function (cb, index) {
						if (cb.selected && cb.$$available) {
							allClear = false;
							if(cb.quantity && cb.price){
								sum += cb.quantity * cb.price;
							}
							$scope.handler && _.isFunction($scope.handler) && $scope.handler(cb);
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
					if ($scope.sum !== undefined) {
						$scope.sum = sum;
					}

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

	
	
	app.factory("OrderNotification", ["$http", "$config", function($http, $config){
		var url = $config.url + "/notification/order",
			transformFn = function(data){
				return data;
			},
			promiseThen = function(httpPromise, successcb, errorcb) {
				return httpPromise.then(function(response) {
					var result = transformFn(response.data);
					(successcb || angular.noop)(result, response.status, response.headers, response.config);
					return result;
				}, function(response) {
					(errorcb || angular.noop)(undefined, response.status, response.headers, response.config);
					return undefined;
				});
			}
		return function(orderID){
			return {
				toKeepers: function(successcb, errorcb){
					var httpPromise = $http.get(url, {
							params: {
								orderID: orderID,
								action: "notify2keepers",
								userID: ((loginedUser && loginedUser._id) || "anonymous"),
								openID: ((loginedUser && loginedUser.weixin) || "anonymous")
							}
						});
					return promiseThen(httpPromise, successcb, errorcb);
				},
				toDelivers: function(successcb, errorcb){
					var httpPromise = $http.get(url, {
							params: {
								orderID: orderID,
								action: "notify2delivers",
								userID: ((loginedUser && loginedUser._id) || "anonymous"),
								openID: ((loginedUser && loginedUser.weixin) || "anonymous")
							}
						});
					return promiseThen(httpPromise, successcb, errorcb);
				},
				toCustomer: function(successcb, errorcb){
					var httpPromise = $http.get(url, {
							params: {
								orderID: orderID,
								action: "notify2customer",
								userID: ((loginedUser && loginedUser._id) || "anonymous"),
								openID: ((loginedUser && loginedUser.weixin) || "anonymous")
							}
						});
					return promiseThen(httpPromise, successcb, errorcb);
				},
				confirm: function(successcb, errorcb){
					var httpPromise = $http.get(url, {
							params: {
								orderID: orderID,
								action: ["notify2keepers", "notify2customer"],
								userID: ((loginedUser && loginedUser._id) || "anonymous"),
								openID: ((loginedUser && loginedUser.weixin) || "anonymous")
							}
						});
					return promiseThen(httpPromise, successcb, errorcb);
				},
				cancel: function(successcb, errorcb){
					var httpPromise = $http.get(url, {
							params: {
								orderID: orderID,
								action: ["cancelOrder2customer", "cancelOrder2keepers"],
								userID: ((loginedUser && loginedUser._id) || "anonymous"),
								openID: ((loginedUser && loginedUser.weixin) || "anonymous")
							}
						});
					return promiseThen(httpPromise, successcb, errorcb);
				}
			}
		}
	}]);
	
	app.factory("QRCode", ["$http", "$config", function($http, $config){
		var url = $config.url + "/qrcode",
			transformFn = function(data){
				return data;
			},
			promiseThen = function(httpPromise, successcb, errorcb) {
				return httpPromise.then(function(response) {
					var result = transformFn(response.data);
					(successcb || angular.noop)(result, response.status, response.headers, response.config);
					return result;
				}, function(response) {
					(errorcb || angular.noop)(undefined, response.status, response.headers, response.config);
					return undefined;
				});
			}
		return function(id, type){
			type = type || 'items';
			return {
				create: function(successcb, errorcb){
					var jsonBody = {referID: id, type: type},
						httpPromise = $http.post(url, jsonBody);
					return promiseThen(httpPromise, function(res){
						successcb && successcb(res.url);
					}, errorcb);
				}
			}
		}
	}]);
	
	app.filter("image", function(){
		//size: small - 64px, middle - 180px, large - 440px
		var mapping = {
			small: "smallImageURL",
			middle: "middleImageURL",
			large: "largeImageURL"
		}
		return function(input, type){
			type = type || "large";
			if(!input){
				return "";
			}
			if(angular.isObject(input)){
				var key = mapping[type] || mapping.large;
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