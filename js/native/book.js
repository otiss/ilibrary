(function(angular, _) {
	"use strict";
	var app = angular.module("bookApp", ["ngCookies", "ngRoute", "ajoslin.mobile-navigate", "mobile-angular-ui", "bookResource", "bookLib", "bookDouban", "ngCordova"]);
	
	app.run(["$rootScope", "$location", "$timeout", "$cookies", "$filter", "$document", "$navigate", 
	         "User", "Book", "Library", 'Activity',
	function($rootScope, $location, $timeout, $cookies, $filter, $document, $navigate,
			User, Book, Library, Activity){
		
		$rootScope.go = function(path, options, transition, location){
			if(_.isObject(options)){
				options = options || {};
			}else{
				var location = options;
				options = {
					location: options,
					transition: 'none'
				};
			}
			$navigate.go(path, options.transition || "none");
			if(options.location){
				$rootScope.toggle(options.location, 'off');
			}
		}
		$rootScope.back = function(){
			$navigate.back();
		}
		$rootScope.$on("$stateChangeStart", function(event, route, c){
			if(route.$$route && route.$$route.needLogin && !($rootScope.user && $rootScope.user._id)){
                return $rootScope.go('/');
            }
            $rootScope.loading = true;
		});
		$rootScope.$on("$stateChangeSuccess", function(){
			$rootScope.loading = false;
		});
		$rootScope.$on("loading.start", function(){
			$rootScope.loading = true;
		});
		$rootScope.$on("loading.end", function(){
			$rootScope.loading = false;
		});
		
		var funcClearNoti = function(){
			$timeout(function(){
				$rootScope.$$notification = {};
			}, 3000);
		}
		_.each(['success', 'info', 'warning', 'danger'], function(type){
			$rootScope.$on('notification.' + type, function(event, message){
				$rootScope.$$notification = {
					type: 'alert-' + type,
					content: message
				};
				funcClearNoti();
			});
		})
		
		
		
		var userID = loginedUser && loginedUser._id;
		if(userID){
			$rootScope.user = new User(loginedUser);
		}else if($location.search() && $location.search().userID){
			var func = function(){
				_.extend(loginedUser, $rootScope.user);
				$rootScope.$emit('libraries.refresh');
				$rootScope.$emit('request.refresh');
			}
			
			userID = $location.search().userID;
			User.query({_id: userID}, function(users){
				if(users && users.length > 0){
					$rootScope.user = users[0];
					func();
				}else{
					var newUser = new User({_id: userID, type: 'library'});
					newUser.$save(function(){
						userID = newUser._id;
						$rootScope.user = newUser;
						func();
						$rootScope.go('/users/self/edit');
					});
				}
			});
		}		
		
		$rootScope.libraries = [];
		$rootScope.$on('libraries.refresh', function(){
            var qo = {type: 'library'};
            if($rootScope.user && $rootScope.user._id){
                qo = _.extend({_id: {$ne: $rootScope.user._id}}, qo);
            }
			User.query(qo, function(users){
				var libraries = _.map(users, function(user){
					var lib = new Library(_.pick(user, '_id')); 
					lib.name = user.name;
					return lib;
				});
				$rootScope.libraries = libraries;
			});
		});
        $rootScope.$on('request.refresh', function(){
            if($rootScope.user && $rootScope.user._id){
                Activity.query({verb: 'request.borrow', status: 0, 'context.contextID': $rootScope.user._id, 'context.contextType': 'library'}, function(activities){
                    $rootScope.requests = {
                        items: activities,
                        total: activities.length
                    };
                });
            }
        });

		
	}]);

})(angular, _);