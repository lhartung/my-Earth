var myEarthCtrl = angular.module('controllers.calc',[]);


myEarthCtrl.controller('calcCtrl', function($scope) {

    if (window.analytics) {
        window.analytics.setCurrentScreen("Calculations");
    }

    $scope.showBrowserPage = function(url) {
    	window.open(url, '_blank', 'location=yes');
    }

});
