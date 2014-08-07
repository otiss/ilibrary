(function(angular){'use strict';

	var app = angular.module("bookResource", []);
	
	var ResourceHttpProvider = function(){
		var authParams,
			config = {
				BASE_URL: "https://api.mongolab.com/api/1/databases/",
				DB_NAME: "cvs"
			},
			resourceReqTransform = function(){
			return authParams || {apiKey: "-cGabrQhjdwmMJa5LVzzsWPwaP3MHmSn"};
		}
		
		this.setAuthParams = function(params){
			authParams = params;
		};
		this.setConfig = function(conf){
			config = conf;
		};
		
		this.$get = ["$http", function($http) {
			return function(collectionName, resourceType) {
				var dbUrl = config.BASE_URL + config.DB_NAME,
					collectionUrl = config.BASE_URL + collectionName,
					resourceRespTransform = function(data) {
						return new Resource(data);
					},
					resourcesArrayRespTransform = function(data) {
						var result = [];
						for (var i = 0; i < data.length; i++) {
							result.push(new Resource(data[i]));
						}
						return result;
					},
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
					},
					Resource = function(data) {
						angular.extend(this, data);
                        this.$$type = resourceType || collectionName;
					};
				
				angular.extend(Resource, {
					query: function(queryJson, options, successcb, errorcb, other) {
						var prepareOptions = function(opts) {
							var optionsTranslated = {};
							
							if (opts && !angular.equals(opts, {})) {
								angular.forEach({
									sort: "s",
									limit: "l",
									fields: "f",
									skip: "sk"
								}, function(targetOption, sourceOption) {
									if (angular.isDefined(opts[sourceOption])) {
										if (angular.isObject(opts[sourceOption])) {
											optionsTranslated[targetOption] = JSON.stringify(opts[sourceOption]);
										} else {
											optionsTranslated[targetOption] = opts[sourceOption];
										}
									}
								});
							}
							return optionsTranslated;
						};
						
						var params = {};
						if (angular.isString(queryJson)) {
							params.action = queryJson;
							queryJson = options;
							options = successcb;
							successcb = errorcb;
							errorcb = other;
						}
						
						if (angular.isFunction(options)) {
							errorcb = successcb;
							successcb = options;
							options = {};
						}
						
						return promiseThen($http.get(collectionUrl, {
							params: angular.extend(params, resourceReqTransform(), prepareQueryParam(queryJson), prepareOptions(options))
						}), successcb, errorcb, resourcesArrayRespTransform);
					},
					getByPath: function(path, successcb, errorcb) {
						var httpPromise = $http.get(collectionUrl + "/" + path, {
							params: resourceReqTransform()
						});
						return promiseThen(httpPromise, successcb, errorcb, resourceRespTransform);
					},
					all: function(options, successcb, errorcb) {
						if (angular.isFunction(options)) {
							errorcb = successcb;
							successcb = options;
							options = {};
						}
						return Resource.query({}, options, successcb, errorcb);
					},
					
					count: function(queryJson, successcb, errorcb) {
						var httpPromise = $http.get(collectionUrl, {
							params: angular.extend({}, resourceReqTransform(), prepareQueryParam(queryJson), {
								c: true
							})
						});
						return promiseThen(httpPromise, successcb, errorcb, function(data) {
							return data;
						});
					},
					
					mdelete: function(queryJson, successcb, errorcb) {
						var requestParams = angular.extend({}, resourceReqTransform(), prepareQueryParam(queryJson));
						var httpPromise = $http.put(collectionUrl, [], {
							params: requestParams
						});
						return promiseThen(httpPromise, successcb, errorcb, resourceRespTransform);
					},
					
					updateset: function(queryJson, data, successcb, errorcb) {
						var requestParams = angular.extend({}, resourceReqTransform(), prepareQueryParam(queryJson));
						var httpPromise = $http.put(collectionUrl, data, {
							params: requestParams
						});
						return promiseThen(httpPromise, successcb, errorcb, resourceRespTransform);
					},

					newObjectId: function(jsonBody, successcb, errorcb) {
						var httpPromise = $http.post(collectionUrl + "/newobjectid", jsonBody, {
							params: resourceReqTransform()
						});
						return promiseThen(httpPromise, successcb, errorcb, function(data) {
							return data;
						});
					},
					
					updateupsert: function(queryJson, data, successcb, errorcb) {
						var requestParams = angular.extend({}, resourceReqTransform(), prepareQueryParam(queryJson), {
							u: true,
							m: true
						});
						var httpPromise = $http.put(collectionUrl, data, {
							params: requestParams
						});
						return promiseThen(httpPromise, successcb, errorcb, resourceRespTransform);
					},
					
					updatewithoutupsert: function(queryJson, data, successcb, errorcb) {
						var requestParams = angular.extend({}, resourceReqTransform(), prepareQueryParam(queryJson), {
							u: false,
							m: true
						});
						var httpPromise = $http.put(collectionUrl, data, {
							params: requestParams
						});
						return promiseThen(httpPromise, successcb, errorcb, resourceRespTransform);
					},
					
					distinct: function(field, queryJson, successcb, errorcb) {
						var httpPromise = $http.post(dbUrl + "/runCommand", angular.extend({}, {
							distinct: collectionName,
							key: field,
							query: queryJson || {}
						}), {
							params: resourceReqTransform()
						});
						return promiseThen(httpPromise, successcb, errorcb, function(data) {
							return data.values;
						});
					},
					
					findAndModify: function(jsonBody, successcb, errorcb) {
						var httpPromise = $http.post(dbUrl + "/runCommand", jsonBody, {
							params: resourceReqTransform()
						});
						return promiseThen(httpPromise, successcb, errorcb, function(data) {
							return data.value;
						});
					},

					getById: function(id, action, successcb, errorcb) {
						var params = {};
						if(angular.isFunction(action)){
							errorcb = successcb;
							successcb = action;
						}else{
							params.action = action;
						}
						var httpPromise = $http.get(collectionUrl + "/" + id, {
							params: angular.extend(params, resourceReqTransform())
						});
						return promiseThen(httpPromise, successcb, errorcb, resourceRespTransform);
					},
					
					getByObjectIds: function(ids, successcb, errorcb) {
						var qin = [];
						angular.forEach(ids, function(id) {
							qin.push({
								$oid: id
							});
						});
						return Resource.query({
							_id: {
								$in: qin
							}
						}, successcb, errorcb);
					}
				});
				
				angular.extend(Resource.prototype, /** @lends Resource.prototype */{
					lastmodified: 0,
					_id: "",
					
					$id: function() {
						if (this._id && this._id.$oid) {
							return this._id.$oid;
						} else if (this._id) {
							return this._id;
						}// FIXME return nothing?
					},
					
					$msave: function(mdata, successcb, errorcb) {
						var httpPromise = $http.post(collectionUrl, mdata, {
							params: resourceReqTransform()
						});
						return promiseThen(httpPromise, successcb, errorcb, resourceRespTransform);
					},
					
					$save: function(successcb, errorcb) {
						if (!this._id) {
							this._id = uuid.v4();
						}
						this.createdtime = new Date().getTime();
						this.lastmodified = new Date().getTime();
						var httpPromise = $http.post(collectionUrl, this, {
							params: resourceReqTransform()
						});
						return promiseThen(httpPromise, successcb, errorcb, resourceRespTransform);
					},
					
					$update: function(successcb, errorcb) {
						var httpPromise = $http.put(collectionUrl + "/" + this.$id(), angular.extend({}, this, {
							_id: undefined,
							lastmodified: new Date().getTime()
						}), {
							params: resourceReqTransform()
						});
						return promiseThen(httpPromise, successcb, errorcb, resourceRespTransform);
					},
					
					$updatedata: function(data, params, updatecb, errorUpdatecb) {
						var httpPromise = $http.put(collectionUrl + "/" + this.$id(), data, {
							params: angular.extend(params, resourceReqTransform())
						});
						return promiseThen(httpPromise, updatecb, errorUpdatecb, resourceRespTransform);
					},
					
					$updateset: function(action, data, updatecb, errorUpdatecb) {
						var mdata = {
							$set: {}
						}, params;
						if(angular.isObject(action)){
							errorUpdatecb = updatecb;
							updatecb = data;
							data = action;
							params = {};
						}else{
							params = {action: action};
						}
						
						data.lastmodified = new Date().getTime();
						angular.extend(mdata.$set, data, {
							_id: undefined
						});
						
						var _this = this;
						return this.$updatedata(mdata, params, function() {
							var id = _this._id;
							angular.extend(_this, mdata.$set);
							_this._id = _this._id || id;
							if (updatecb) {
								updatecb.apply(null, arguments);
							}
						}, errorUpdatecb);
					},

					$updateaddToSet: function(data, updatecb, errorUpdatecb) {
						var mdata = {
							$addToSet: {}
						};
						angular.extend(mdata.$addToSet, data);
						
						var _this = this;
						return this.$updatedata(mdata, {}, function() {
							_.each(_.keys(mdata.$addToSet), function(key){
								_this[key] = _this[key] || [];
								_this[key].push(mdata.$addToSet[key]);
							});
							
							if (updatecb) {
								updatecb.apply(null, arguments);
							}
						}, errorUpdatecb);
					},
					
					$remove: function(successcb, errorcb) {
						var httpPromise = $http["delete"](collectionUrl + "/" + this.$id(), {
							params: resourceReqTransform()
						});
						
						return promiseThen(httpPromise, successcb, errorcb, resourceRespTransform);
					},
					
					$saveOrUpdate: function(savecb, updatecb, errorSavecb, errorUpdatecb) {
						if (this.$id()) {
							return this.$update(updatecb, errorUpdatecb);
						}
						
						return this.$save(savecb, errorSavecb);
					}
					
				});
				
				return Resource;
			};
		}];
	}
	
	app.provider("$resourceHttp", ResourceHttpProvider);

})(angular);