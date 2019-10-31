var paradropCtrl = angular.module('controllers.impact',[]);



paradropCtrl.controller('impactCtrl',
    function($scope, $state, activityDoneList, $ionicModal, $ionicPopup, $ionicLoading) {

    if (window.analytics) {
      window.analytics.setCurrentScreen("My Impact");
    }

		var getTotalPointsSaved = function () {
			var activity;
			var returnData = [0,0];
			for (i = 0; i < activityDoneList.length; i++) {
				activity = activityDoneList[i].get("activity");
				if (activity.get("pointCategory") == "Pounds of Carbon") {
					returnData[0] = returnData[0] + activity.get("points");
				} else {
					returnData[1] = returnData[1] + activity.get("points");
				}
			}

			return returnData;
		}

		var totalPoints = getTotalPointsSaved();
		console.log(totalPoints);

        //if prestige, then calculate level from the prestige value
        $scope.prestigeLevel = 0;
        var prestigeValue = 0;

        if (Parse.User.current().get('prestigeLevel')) {
            $scope.prestigeLevel = Parse.User.current().get('prestigeLevel');
            prestigeValue = Parse.User.current().get('prestigeValue');
        }

    	var lbsCarbonAllTime = totalPoints[0] - prestigeValue;

    	var conversionMultiplier = .04088171;
    	var secondaryMultiplier = .83;

    	$scope.carbonSaved = Math.round(lbsCarbonAllTime * 100) / 100;

    	$scope.tier = Math.floor(lbsCarbonAllTime * conversionMultiplier * secondaryMultiplier) + 1;

    	if ($scope.tier > 7) {
    		$scope.tier = 7;
    	}

    	$scope.progressToNextLevel = "";

        var percentDone;

    	if ($scope.tier < 7) {
    		var carbonToSaveForNextLevel = ($scope.tier) / conversionMultiplier / secondaryMultiplier;
    		var progressToNext = Math.ceil(carbonToSaveForNextLevel - lbsCarbonAllTime);

            var carbonToSaveForPrevLevel = (($scope.tier) - 1 ) / conversionMultiplier / secondaryMultiplier;
            var thisLevelsBeginning = Math.ceil(carbonToSaveForPrevLevel);

            console.log(carbonToSaveForPrevLevel + " and " + carbonToSaveForNextLevel);
            console.log(progressToNext + " from "  + thisLevelsBeginning);

    		$scope.progressToNextLevel = "Keep up the good work! You have to save " + progressToNext + " more pounds to advance.";

    		if (progressToNext == 1) {
    			$scope.progressToNextLevel = "Keep up the good work! You have to save " + progressToNext + " more pound to advance.";
    		}

            percentDone = 100*(lbsCarbonAllTime - thisLevelsBeginning)/(carbonToSaveForNextLevel - thisLevelsBeginning);

    	} else {
            $scope.congrats = true;
    		$scope.progressToNextLevel = "You've done incredibly well.";
            percentDone = 100;
    	}

        $scope.percentDone = percentDone;

    	//use tier number to change graphic number

        $scope.levels = [];

        for (var i = 0; i < $scope.tier; i++) {
            $scope.levels.push(i);
        }

        // ---------------------- Loading Level Modal ---------------------
        $ionicModal.fromTemplateUrl('templates/levels.html', function($ionicModal) {
            $scope.modal = $ionicModal;
        }, {
            // Use our scope for the scope of the modal to keep it simple
            scope: $scope,
            // The animation we want to use for the modal entrance
            animation: 'slide-in-up'
        });

        // ---------------------- close Modal ---------------------
        $scope.closeLevelModal = function () {
            $scope.modal.hide();
        }

        $scope.attemptPrestige = function () {

            var confirm = $ionicPopup.confirm({
                title: 'Confirm Prestige',
                template: 'Great work! You achieved level 7. Prestige will give you a star and reset your level to 1. Continue?'
            });

            confirm.then(function(result) {

                if (result) {
                    advancePrestige();
                }

                confirm.close();
            });

        }

        var advancePrestige = function () {

            $ionicLoading.show({
                template: 'Loading...'
            });

            var newPrestigeValue = totalPoints[0];
            var newPrestigeLevel = $scope.prestigeLevel + 1;

            Parse.User.current().save({
                prestigeValue: newPrestigeValue, 
                prestigeLevel: newPrestigeLevel
            }, {
                success: function(user) {

                    prestigeValue = newPrestigeValue;
                    $scope.prestigeLevel = newPrestigeLevel;
                    $scope.percentDone = 0;
                    $scope.tier = 1;
                    $scope.progressToNextLevel = "Keep up the good work! You have to save " + 30 + " more pounds to advance.";
                    $ionicLoading.hide();

                },

                error: function(user, error) {

                  $ionicLoading.hide();
                  $ionicPopup.alert({
                    title: 'Error',
                    template: "<p>Error. Please try again.</p>",
                  });

                }
            });
        }

    });
