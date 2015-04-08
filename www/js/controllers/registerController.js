var myEarthCtrl = angular.module('controllers.register',[]);


myEarthCtrl.controller('registerCtrl',
    function($scope, $ionicLoading, $ionicPopup, $state) {

    // initialization for certain vars

    $scope.registerData = {};

    // ---------------------- Sign up ---------------------

    $scope.signUp = function () {

        $ionicLoading.show({
          template: 'Loading...'
        });
        if (($scope.registerData) && ($scope.registerData.password) && ($scope.registerData.username) ) {

            var user = new Parse.User();
            var isBearImage = false;

            if (Math.random() > .5) {
                isBearImage = true;
            }

            user.set("username", $scope.registerData.username);
            user.set("email", $scope.registerData.username);
            user.set("password", $scope.registerData.password);
            user.set('todoList', []);
            user.set('bearImage', isBearImage);

            console.log('parse request: user signup');

            user.signUp(null, {
                success: function(user) {

                    $localStorage.set('lastUserEmail', $scope.registerData.username);

                    $ionicLoading.hide();
                    $scope.closeSignUp();
                    console.log('signup successful');
                    $state.go('app.timeline');

                },

                error: function(user, error) {

                  $ionicLoading.hide();
                  $scope.closeSignUp();
                  $ionicPopup.alert({
                    title: 'Error',
                    template: "<p>Error in account creation. Please try again.</p>",
                    okText: 'OK'
                  });

                }
            });

        } else {

            $ionicLoading.hide();
            $ionicPopup.alert({
              title: 'Blank fields',
              template: "<p>You missed one or more entries</p>",
              okText: 'OK'
            });
        }
    }

});