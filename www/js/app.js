
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

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    $ionicPlatform.ready(function() {

        //invite user to rate app after he uses the app for 10 times
        $offerModel.createOffer({
            showOnCount  : 10,
            title        : 'A Special Offer',
            text         : 'If you enjoy this app please take a moment to rate it',
            agreeLabel   : 'Rate App',
            remindLabel  : 'Remind Me Later',
            declineLabel : 'Not interested'
        });

        if(device.platform === "iOS") {
            $cordovaLocalNotification.promptForPermission();
        }


        if(typeof Keyboard !== "undefined") {
            Keyboard.hideFormAccessoryBar(true);
        } else if(window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }

        if(window.StatusBar) {
            StatusBar.styleDefault();
        }


        if (typeof cordova.plugins.firebase.analytics !== "undefined") {
            window.analytics = cordova.plugins.firebase.analytics;
            console.log("Loaded Firebase Analytics.");
        } else {
            console.log("Analytics unavailable.");
        }

    });

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

