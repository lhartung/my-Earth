var paradropCtrl = angular.module('controllers.profile',['services.activityModel']);

paradropCtrl.controller('profileCtrl',
	function($scope,$ionicModal,$ionicPopup, $cordovaLocalNotification, activityModel, activityDoneList) {

		$scope.notEnoughData = false;

    if (window.analytics) {
        window.analytics.setCurrentScreen("Profile");
    }

		if (activityDoneList.length == 0) {

			console.log('no items in the activityDoneList');
			document.getElementById('textIfNoItems').style.display = 'block';
		} else {
			$scope.showData = true;
			$scope.totalActivities = Parse.User.current().get('activityCount') || activityDoneList.length;
		}
		// Type 0 = Carbon Points
		// Type 1 = Water Points
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

			if (Parse.User.current().get('carbonSaved')){
				returnData = [Parse.User.current().get('carbonSaved'),Parse.User.current().get('waterSaved')];
			}

			return returnData;
		}
		var totalPoints = getTotalPointsSaved();

		var overallPoundsCarbonSaved = totalPoints[0];

		$scope.poundsCarbon = Math.round(overallPoundsCarbonSaved * 100) / 100;

		var treesPerPoundOfCarbon = 5.2;

		var galsOfWaterSaved = totalPoints[1];

		$scope.treesSaved = Math.round(overallPoundsCarbonSaved * treesPerPoundOfCarbon);
		$scope.waterSaved = Math.round(galsOfWaterSaved * 100) / 100;

		var data = {
		  labels: ["air", "water", "wind", "fire"],
		  datasets: [
		    {
		      label: "Carbon Usage",
		      fillColor: "rgba(130,255,180,0.2)",
		      strokeColor: "rgba(130,255,180,1)",
		      pointColor: "rgba(130,255,180,1)",
		      pointStrokeColor: "#fff",
		      pointHighlightFill: "#fff",
		      pointHighlightStroke: "rgba(130,255,180,1)",
		      data: [32, 46, 37, 85]
		    },
		    {
		      label: "Water Usage",
		      fillColor: "rgba(151,187,255,0.2)",
		      strokeColor: "rgba(151,187,255,1)",
		      pointColor: "rgba(151,187,255,1)",
		      pointStrokeColor: "#fff",
		      pointHighlightFill: "#fff",
		      pointHighlightStroke: "rgba(151,187,255,1)",
		      data: [46, 86, 85, 36]
		    }
		  ]
		};

		var options = {

		    bezierCurve : false,
		    animation: false,
		    showTooltips: false

		};

	  	var ctx = document.getElementById("myChart").getContext("2d");
	  	var myLineChart = new Chart(ctx).Line(data, options);

		var removeOldData = function(numNewDataPoints) {

			var numPoints = myLineChart.datasets[0].points.length;

			for (var i = 0; i < numPoints - numNewDataPoints; i++) {

				myLineChart.removeData();

			}

		}


		//------------------------ BEST AND WORST WEEK DATA -----------------------------------------


		var belongsCurrentWeek = function(date, dateFromCurrentWeek) {
			var dateToBeChecked = moment(date);

			if (dateToBeChecked.isSame(dateFromCurrentWeek,"week")) {
				return true;
			} else {
				return false;
			}

		}

		var calculatePointsByByWeek = function () {
			var finalData = [];
			var currentActivity;
			var currentWeekData = null;
			var currentWeekKey = 0;
			var firstDateCurrentWeek;

			for (i = 0; i < activityDoneList.length; i++) {
				//First array interaction
				if (i == 0) {
					//Creating the currentWeekData object
					currentActivity = activityDoneList[i].get("activity");
					currentWeekData = {"totalPoints":currentActivity.get("points"),"startActivity":0,"endActivity":0};
					finalData[currentWeekKey] = currentWeekData;
					firstDateCurrentWeek = activityDoneList[i].createdAt;
				}
				else {
					 if (belongsCurrentWeek(activityDoneList[i].createdAt, firstDateCurrentWeek)) {
						 currentActivity = activityDoneList[i].get("activity");
						 finalData[currentWeekKey].totalPoints = finalData[currentWeekKey].totalPoints + currentActivity.get("points");
					 } else {
						 //End Activity is the previous one
						 currentWeekData.endActivity = i -1;
						 currentActivity = activityDoneList[i].get("activity")
						 //Getting Ready to the next interaction
						 currentWeekKey++;
						 currentWeekData = {"totalPoints":currentActivity.get("points"),"startActivity":i,"endActivity":i};
						 finalData[currentWeekKey] = currentWeekData;
						 firstDateCurrentWeek = activityDoneList[i].createdAt;
					 }
				}
			}

			if (currentWeekData) {
				currentWeekData.endActivity = i -1;
			}

			//console.log(activityDoneList.length);
			//console.log(finalData);
			return finalData;


		}

		var joinActivityByWeek  = function (initialPosition, lastPosition){
			var dayKey;
			var pointsCategory;
			var pointsWeek = {};
			var finalData = {};
			var currentActivity;


			finalData.startDate = moment(activityDoneList[initialPosition].createdAt).day(0);
			finalData.endDate = moment(activityDoneList[initialPosition].createdAt).day(6);

			//Initialize Day of the week
			for (i = 0; i < 7; i++) {
				pointsWeek[i] = [0,0];
			}

			for (i = initialPosition; i <= lastPosition; i++) {
				dayKey = activityDoneList[i].createdAt.getDay();
				currentActivity = activityDoneList[i].get("activity");
				pointsCategory = pointsWeek[dayKey];
				if (currentActivity.get("pointCategory") == "Pounds of Carbon") {
					pointsCategory[0] = pointsCategory[0] + currentActivity.get("points");
				} else {
					pointsCategory[1] = pointsCategory[1] + currentActivity.get("points");
				}
			}

			finalData.data = pointsWeek;
			//console.log(finalData);
			return finalData;
		}


		var getWorstWeek = function (allWeeksData) {
			
			if (allWeeksData.length > 0) {
				var lowerValue = allWeeksData[0].totalPoints;
				var index = 0;
			}

			for (i = 1; i < allWeeksData.length; i++) {
				if (allWeeksData[i].totalPoints <= lowerValue) {
					index = i;
					lowerValue = allWeeksData[i].totalPoints;
				}
			}
			return allWeeksData[index];
		}


		var getBestWeek = function (allWeeksData) {

			if (allWeeksData.length > 0) {
				var higherValue = allWeeksData[0].totalPoints;
				var index = 0;
			}

			for (i = 1; i < allWeeksData.length; i++) {
				if (allWeeksData[i].totalPoints >= higherValue) {
					index = i;
					higherValue = allWeeksData[i].totalPoints;
				}
			}
			return allWeeksData[index];
		}

		if (activityDoneList.length > 0) {
			var allWeeksData = calculatePointsByByWeek();
			var worstWeek = getWorstWeek(allWeeksData);
			var bestWeek = getBestWeek(allWeeksData);
			var worstWeekData = joinActivityByWeek(worstWeek.startActivity,worstWeek.endActivity);
			var bestWeekData = joinActivityByWeek(bestWeek.startActivity,bestWeek.endActivity);
			$scope.startEndWorstWeek = worstWeekData.startDate.format("MMM D") + " - " + worstWeekData.endDate.format("MMM D");
			$scope.startEndBestWeek = bestWeekData.startDate.format("MMM D") + " - " + bestWeekData.endDate.format("MMM D");
		}



	  	$scope.worstWeek = function() {

	  		$scope.notEnoughData = false;

			var pointsThisWeek = worstWeekData.data;
			var numNewDataPoints = Object.keys(pointsThisWeek).length;

			for (var weekDay in pointsThisWeek) {
				myLineChart.addData(pointsThisWeek[weekDay], getDayTitle(weekDay));
			}

			removeOldData(numNewDataPoints);

			myLineChart.update();



		}

		$scope.bestWeek = function() {
			
			$scope.notEnoughData = false;
			
			var pointsThisWeek = bestWeekData.data;
			var numNewDataPoints = Object.keys(pointsThisWeek).length;

			for (var weekDay in pointsThisWeek) {
				myLineChart.addData(pointsThisWeek[weekDay], getDayTitle(weekDay));
			}

			removeOldData(numNewDataPoints);

			myLineChart.update();


		}








		//------------------------ ALL TIME DATA -----------------------------------------


		// Join activity by month
		//var test = new Date(2015, 07, 20, 3, 45, 60, 30);
		//var test2 = new Date(2015, 06, 20, 3, 45, 60, 30);
		//var test2 = new Date(2015, 05, 20, 3, 45, 60, 30);
		//var test3 = new Date(2015, 04, 20, 3, 45, 60, 30);
		//var test4 = new Date(2015, 03, 20, 3, 45, 60, 30);
		//var test5 = new Date(2015, 02, 20, 3, 45, 60, 30);
		//activityDoneList[activityDoneList.length-1].createdAt = test;
		//activityDoneList[activityDoneList.length-2].createdAt = test2;
		//activityDoneList[activityDoneList.length-3].createdAt = test3;
		//activityDoneList[activityDoneList.length-4].createdAt = test4;
		//activityDoneList[activityDoneList.length-5].createdAt = test5;

		var getMonthTitle = function(thisMonth) {

			switch(thisMonth) {
				case 1: return "Jan";
				case 2: return "Feb";
				case 3: return "Mar";
				case 4: return "Apr";
				case 5: return "May";
				case 6: return "Jun";
				case 7: return "Jul";
				case 8: return "Aug";
				case 9: return "Sept";
				case 10: return "Oct";
				case 11: return "Nov";
				case 12: return "Dec";
			}

		}

		var joinActivityByMonth = function () {
			var pointsMonth = {};
			//Getting first month and year
			var month = activityDoneList[0].createdAt.getMonth();
			var year = activityDoneList[0].createdAt.getFullYear();
			//Getting first activity
			var monthYear = getMonthTitle(month+1) +" " + year.toString();
			var activity = activityDoneList[0].get("activity");
			//adding points to the first activity according to the category, //category 0 = Pounds of carbon , category 1 = Water
			if (activity.get("pointCategory") == "Pounds of Carbon") {
				pointsMonth[monthYear] = [activity.get("points"),0];
			} else {
				pointsMonth[monthYear] = [0,activity.get("points")];
			}

			//going through all the activities, except the first one
			var pointsCategory;
			for (i = 1; i < activityDoneList.length; i++) {
				//if it still the same month and year, join the activity according to its category
				if (month == activityDoneList[i].createdAt.getMonth() && activityDoneList[i].createdAt.getYear()) {
					activity = activityDoneList[i].get("activity");

					//category 0 = Pounds of carbon , category 1 = Water
					pointsCategory = pointsMonth[monthYear];
					if (activity.get("pointCategory") == "Pounds of Carbon") {
						pointsCategory[0] = pointsCategory[0] + activity.get("points");
					} else {
						pointsCategory[1] = pointsCategory[1] + activity.get("points");
					}
				} else {
					month = activityDoneList[i].createdAt.getMonth();
					year = activityDoneList[i].createdAt.getFullYear();
					//New month and year
					monthYear = getMonthTitle(month+1) +" " +year.toString();

					//category 0 = Pounds of carbon , category 1 = Water
					//Initializing this new month
					if (activity.get("pointCategory") == "Pounds of Carbon") {
						pointsMonth[monthYear] = [activity.get("points"),0];
					} else {
						pointsMonth[monthYear] = [0,activity.get("points")];
					}
				}
			}
			return pointsMonth;
		}

		$scope.allTime = function() {

			$scope.notEnoughData = false;

			//console.log(joinActivityByMonth());
			var activityByMonth = joinActivityByMonth();
			var numNewDataPoints = Object.keys(activityByMonth).length;//h2o.length;

			//if its just 1 month - add another one
			if (numNewDataPoints <= 1) {
				var month = activityDoneList[activityDoneList.length-1].createdAt.getMonth();
				var year = activityDoneList[activityDoneList.length-1].createdAt.getFullYear();
				if (month == 0) {
					month = 12;
					year = year - 1;
				}
				var monthYear = getMonthTitle(month) + " " +year.toString();
				myLineChart.addData([0,0], monthYear);
				numNewDataPoints++;
			}

			for (var monthYear in activityByMonth) {
				myLineChart.addData(activityByMonth[monthYear], monthYear);
			}
		  removeOldData(numNewDataPoints);

		  myLineChart.update();

		}

		

		//------------------------ THIS WEEK DATA -----------------------------------------

		var getFirstDayWeek = function () {
			var d = new Date();
			var curr = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);// get current date
			var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
			firstday = new Date(curr.setDate(first));

			return firstday;

		}


			//Day Object = {0: Carbon Points, 1: Water Points}
		//The key os the day of the week - 0: Sunday --  Saturday
		var getPointsThisWeek = function () {
			var d = new Date();
			var activity;
			var pointsWeek = {};
			var curr = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 59);// get current date
			var firstDay = getFirstDayWeek();
			var pointsCategory;
			var dayKey;

			//Initialize Day of the week
			for (i = 0; i <= curr.getDay(); i++) {
				pointsWeek[i] = [0,0];
			}


            //
			for (i = 0; i < activityDoneList.length; i++) {
			//	//  FirstDay < createdAt < CurrentTime
				if ((activityDoneList[i].createdAt.getTime() < curr.getTime()) && (activityDoneList[i].createdAt.getTime() > firstDay.getTime())) {
					activity = activityDoneList[i].get("activity");
					dayKey = activityDoneList[i].createdAt.getDay();
					pointsCategory = pointsWeek[dayKey];
					if (activity.get("pointCategory") == "Pounds of Carbon") {
						pointsCategory[0] = pointsCategory[0] + activity.get("points");
					} else {
						pointsCategory[1] = pointsCategory[1] + activity.get("points");
					}
				}
			}
			return pointsWeek;



		}

		var getDayTitle = function(thisDay) {
			switch(thisDay) {
				case "0": return "Sunday";
				case "1": return "Monday";
				case "2": return "Tuesday";
				case "3": return "Wednesday";
				case "4": return "Thursday";
				case "5": return "Friday";
				case "6": return "Saturday";
			}

		}



		$scope.thisWeek = function() {

			var pointsThisWeek = getPointsThisWeek();
			var numNewDataPoints = Object.keys(pointsThisWeek).length;//h2o.length;

			for (var weekDay in pointsThisWeek) {
				myLineChart.addData(pointsThisWeek[weekDay], getDayTitle(weekDay));
			}

			//
			if (numNewDataPoints == 1){
				$scope.notEnoughData = true;
				return
			}


			//If we remo
			removeOldData(numNewDataPoints);

		  myLineChart.update();

		}

		var firstDayWeek = getFirstDayWeek();
		firstDate = getMonthTitle(getFirstDayWeek().getMonth() + 1) + " " + firstDayWeek.getDate();
		d = new Date();
		lastDate = getMonthTitle(d.getMonth() +1) + " " + d.getDate();
		$scope.startEndThisWeek = firstDate + " - " + lastDate;

		// change the period of time text
		if (activityDoneList.length > 0) {
			var month = activityDoneList[0].createdAt.getMonth() + 1;
			var firstDate = getMonthTitle(month) + " " + (activityDoneList[0].createdAt.getFullYear());
			month = activityDoneList[activityDoneList.length-1].createdAt.getMonth() +1;
			var lastDate = getMonthTitle(month)  + " " + (activityDoneList[activityDoneList.length-1].createdAt.getFullYear());
			$scope.startEndMonthAllTime = firstDate + " - " + lastDate;
			$scope.thisWeek();
		}

		var d = new Date();
		$scope.data = {time: d.getHours() + ":" + d.getMinutes()};

		$scope.showAlarmView = function() {

			var alertPopup = $ionicPopup.show({
		        scope: $scope,
		        title: 'Reminder',
		        templateUrl: 'templates/alarm.html',
		        buttons: 
		        [{ text: 'Cancel' }, 
		        	{text: 'Save', 
		        	type: 'button-balanced',
			        onTap: function(e) {

			        	var hrs = $scope.data.time.substring(0, 2);
			        	var min = $scope.data.time.substring(3, 5);

			        	var desiredDate = moment();
			        	desiredDate.set({'hour': hrs, 'minute': min});

			        	console.log(desiredDate);

			        	//Cancel Previous Notification
			        	window.plugin.notification.local.cancel(1, function() {});
			          	window.plugin.notification.local.schedule({
		                     id: 1,
		                     text: 'Remember to complete your carbon activities!',
		                     every: 'day',
		                     firstAt: desiredDate.toDate()
			          	});

						alertPopup.close();

			        }
			    }]
		    });

		}

});
