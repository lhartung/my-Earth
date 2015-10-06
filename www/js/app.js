
var app = angular.module('earthApp', [
    'ionic',
    'ngCordova',
    'controllers.login',
    'controllers.register',
    'controllers.main',
    'controllers.timeline',
    'controllers.impact',
    'controllers.profile',
    'services.activityModel',
    'services.offerModel',
    'controllers.about',
    'controllers.calc'
]);


app.run(function($ionicPlatform,$rootScope,$state,$http,$cordovaLocalNotification,$offerModel) {

    //invite user to rate app after he uses it for 10 times
    $offerModel.createOffer({
            showOnCount  : 10,
            title        : 'A Special Offer',
            text         : 'If you enjoy this app please take a moment to rate it',
            agreeLabel   : 'Rate App',
            remindLabel  : 'Remind Me Later',
            declineLabel : 'Not interested'
    });


   // When the user is going to another page!
    $rootScope.$on('$stateChangeStart',function(event, toState, toParams, fromState, fromParams) {
        // redirect to mainPage if logged in
        if (window.localStorage['globals']) {
            $rootScope.globals = JSON.parse(window.localStorage['globals']);
            if (toState.name == 'login' && $rootScope.globals.currentUser) {
                event.preventDefault();
                $state.go('app.timeline');
                console.log("We're going to the loginPage!");

            }
        }
    });

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    $ionicPlatform.ready(function() {

        if(device.platform === "iOS") {
            $cordovaLocalNotification.promptForPermission();
        }


        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }


        if(typeof analytics !== "undefined") {
            analytics.startTrackerWithId('UA-61409067-1');
          console.log('loaded google analytics');
      } else {
          console.log("Google Analytics Unavailable");
      }

    });

    //Convert the HTTP method to a format that php can understand
    //http://victorblog.com/2012/12/20/make-angularjs-http-service-behave-like-jquery-ajax/
    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    var param = function(obj) {
        var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

        for(name in obj) {
            value = obj[name];

            if(value instanceof Array) {
                for(i=0; i<value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if(value instanceof Object) {
                for(subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if(value !== undefined && value !== null)
                query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }

        return query.length ? query.substr(0, query.length - 1) : query;
    };

    // Override $http service's default transformRequest
    $http.defaults.transformRequest = [function(data) {
        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];
});


app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('login', {
            url:"/",
            templateUrl:"templates/login.html",
            controller:"loginCtrl"
        })

        .state('app', {
            url: "/app",
            abstract: true,
            templateUrl: "templates/menu.html",
            controller:"mainCtrl"
        })

        .state('app.timeline', {
            url: "/timeline",
            views: {
                "menuContent" :{
                    templateUrl: "templates/timeline.html",
                    controller:'timelineCtrl'
                }
            }
        })

        .state('app.about', {
            url: "/about",
            views: {
                "menuContent" :{
                    templateUrl: "templates/about.html",
                    controller: 'aboutCtrl'
                }
            }
        })

        .state('app.calculations', {
            url: "/calculations",
            views: {
                "menuContent" :{
                    templateUrl: "templates/calculations.html",
                    controller: 'calcCtrl'
                }
            }
        })

        .state('app.impact', {
            url: "/impact",
            views: {
                "menuContent" :{
                    templateUrl: "templates/impact.html",
                    controller:'impactCtrl'
                }
            },
            resolve: {
                activityDoneList: function(activityModel) {
                    return activityModel.getUserActivityDoneList();
                }
            }
        })

        .state('app.profile', {
            url: "/profile",
            views: {
                "menuContent": {
                    templateUrl: "templates/profile.html",
                    controller: 'profileCtrl'
                }
            },
            resolve: {
                activityDoneList: function(activityModel) {
                    return activityModel.getUserActivityDoneList();
                }
            }
        });

    // if none of the above states are matched, use this as the fallback
    if(Parse.User.current()) {
      $urlRouterProvider.otherwise('/app/timeline');
    } else {
      $urlRouterProvider.otherwise('/');
    }
});

