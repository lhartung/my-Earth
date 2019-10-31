var myEarthCtrl = angular.module('controllers.about',[]);


myEarthCtrl.controller('aboutCtrl',
    function() {

    if (window.analytics) {
        window.analytics.setCurrentScreen("About");
    }

});
