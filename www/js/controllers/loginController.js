var myEarthCtrl = angular.module('controllers.login',['ionic.utils']);

myEarthCtrl.controller('loginCtrl', function ($scope, $rootScope, $ionicPopup, $ionicLoading,$state, $ionicModal, $localStorage) {

    if (window.analytics) {
        window.analytics.setCurrentScreen("Login");
    }

    var lastUserEmail = $localStorage.get('lastUserEmail');
    console.log('last user email: ' + lastUserEmail);

    $scope.loginData = {};

    if (lastUserEmail) {
        $scope.loginData.username = lastUserEmail;
    }


    // ---------------------- Login Function ---------------------
    $scope.login = function () {
        // Loading...
        $ionicLoading.show({
            template: 'Loading...'
        });

        if ($scope.loginData && $scope.loginData.username && $scope.loginData.password) {

            console.log('parse request: user login');
            Parse.User.logIn($scope.loginData.username, $scope.loginData.password, {
                success: function(privUser) {
                    $scope.closeLogin()
                    $localStorage.set('lastUserEmail', $scope.loginData.username);

                    var user = Parse.User.current();
                    if (window.analytics) {
                      window.analytics.setUserProperty("parse_user_id", user.id);

                      window.analytics.logEvent("myearth_login", {
                        parse_user_id: user.id,
                      });
                    }

                    $ionicLoading.hide();
                    $state.go('app.timeline');

                },

                error: function(user, error) {
                    // The login failed. Check error to see why.
                    $ionicLoading.hide();

                    $ionicPopup.alert({
                        title: 'Login Failed',
                        template: "<p class= \"center\">Username/Password combination is incorrect.</p>",
                        okText: 'OK'
                    });

                    console.log("login failed: " + error.message);
                }
            });


        } else {
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: 'Blank Fields',
                template: "<p class= \"center\">You must enter a username and password to log in.</p>",
                okText: 'OK'
            });
        }
    };


    // ---------------------- Loading Signup Modal ---------------------
    $ionicModal.fromTemplateUrl('templates/register.html', function($ionicModal) {

        $scope.registerModal = $ionicModal;
    }, {
        // Use our scope for the scope of the modal to keep it simple
        scope: $scope,
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'
    });

    // ---------------------- Loading Forgot Modal ---------------------
    $ionicModal.fromTemplateUrl('templates/forgot.html', function($ionicModal) {

        $scope.forgotData = {};
        $scope.forgotmodal = $ionicModal;
    }, {
        // Use our scope for the scope of the modal to keep it simple
        scope: $scope,
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'
    });

    // ---------------------- Loading Terms Modal ---------------------
    $ionicModal.fromTemplateUrl('templates/terms.html', function($ionicModal) {

        $scope.termsModal = $ionicModal;
    }, {
        // Use our scope for the scope of the modal to keep it simple
        scope: $scope,
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'
    });


        // ---------------------- Loading Login Modal ---------------------
    $ionicModal.fromTemplateUrl('templates/loginModal.html', function($ionicModal) {

        $scope.loginModal = $ionicModal;
    }, {
        // Use our scope for the scope of the modal to keep it simple
        scope: $scope,
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'
    });



        // ---------------------- close forgot Modal ---------------------
    $scope.closeLogin = function () {
        $scope.loginModal.hide();
    }


    // ---------------------- close forgot Modal ---------------------
    $scope.closeForgot = function () {
        $scope.forgotmodal.hide();
    }



    // ---------------------- send email to forgot password ---------------------
    $scope.sendNewPasswordEmail = function () {


        var email = $scope.forgotData.email;
        console.log('parse request: send password reset email');
        Parse.User.requestPasswordReset(email, {
            success:function() {
                $scope.closeForgot();
                $ionicPopup.alert({
                    title: 'Email Sent Successfully'
                });
            },
            error:function(error) {
                $ionicPopup.alert({
                  title: error.message
                });
            }
        });
    }
    



    // ---------------------- close Modal ---------------------
    $scope.closeSignUp = function () {
        $scope.registerModal.hide();
    }

    // ---------------------- close Modal ---------------------
    $scope.closeTerms = function () {
        $scope.termsModal.hide();
    }

});
