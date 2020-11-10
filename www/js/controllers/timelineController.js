var paradropCtrl = angular.module('controllers.timeline',[
    'ionic.utils',
    'services.activityModel'
]);

paradropCtrl.controller('timelineCtrl',
    function($scope, $ionicModal, $state, $localStorage, $ionicLoading, $ionicPopup, activityModel, $window) {

        if (window.analytics) {
            window.analytics.setCurrentScreen("Activities");
        }

        if (!Parse.User.current().get('activityCount')){
            Parse.Cloud.run('migrateActivityCount', {
                success: function() {
                    Parse.User.current().fetch();
                    console.log('migrated');
                },
                error: function(error) {
                    console.log(error);
                }
            })
        }


        //basics

        $scope.activityAddedPhrase = "Added!";
        $scope.activityNotAddedPhrase = "Add Activity";


        // ---------------------- Loading Modal ---------------------
        $ionicModal.fromTemplateUrl('templates/addActivities.html', function($ionicModal) {

            $scope.modal = $ionicModal;
        }, {
            // Use our scope for the scope of the modal to keep it simple
            scope: $scope,
            // The animation we want to use for the modal entrance
            animation: 'slide-in-up'
        });

        // ---------------------- close Modal ---------------------
        $scope.closeModalButton = function () {
            $scope.modal.hide();
        }
        

        $ionicLoading.show({
            template: 'Loading...'
        });
        

        //Get Activity List from Parse, group by activity Category

        $scope.categoryList = [];
        $scope.allActivityList = [];
        $scope.todoList = []; //for the todo list screen

        var query = new Parse.Query('Activity');
        console.log('parse request: get activity list');

        // Override the implicit limit of 100.  If there are more than 1000
        // activities for users to choose from, we will need to use pagination.
        query.limit(1000);

        query.find({
            
            success: function(activities) {

                var activityList = [];

                for (var i = 0; i < activities.length; i++) {

                    var activity = {
                        activityName: activities[i].get('title'), 
                        activityCategory: activities[i].get('category'),
                        points: activities[i].get('points'),
                        pointCategory: activities[i].get('pointCategory'),
                        abbrCategory: 'lbs',
                        description: activities[i].get('Description')
                    };
                      
                    if (activity.pointCategory == 'Gallons of Water'){
                        activity.abbrCategory = 'gal';
                    }  
                    activityList.push(activity);
                }

                $scope.allActivityList = activityList;

                console.log($scope.allActivityList);
                generateCategoryList(activityList);
                $scope.todoList = generateToDoList();

                $ionicLoading.hide();

            },
            
            error: function(error) {
                
                // The connection failed. Check error to see why.
                $ionicLoading.hide();

                $ionicPopup.alert({
                    title: 'Connection Failed',
                    template: '<p>Please try again later.</p><p>Error '+error.code+': '+error.message+'</p>',
                    okText: 'OK'
                });

            }
        
        });


        //generates $scope.categoryList from list of activities
        function generateCategoryList(activList) {

            console.log("generateCategoryList");

            for (var i = 0; i < activList.length; i++) {

                var activity = activList[i];

                if (isInCategoryList(activity.activityCategory)) {
                    
                    for (var j = 0; j < $scope.categoryList.length; j++) {
                        category = $scope.categoryList[j];
                        if (category.title === activity.activityCategory) {

                            var pointCategoryIcon = "leaf";
                            var colorClass = "green-color";

                            if (activity.pointCategory == "Gallons of Water"){
                                pointCategoryIcon = "waterdrop";
                                colorClass = "blue-color";
                            }

                            category.activities.push({name: activity.activityName, points: activity.points, pointCategory: activity.pointCategory, description: activity.description, added: false, addedPhrase: "Add Activity", icon: pointCategoryIcon, colorClass: colorClass});
                            console.log("Update category: " + activity.activityCategory + ", activity: " + activity.activityName);
                            break;
                        }
                    }

                } else {

                    var pointCategoryIcon = "leaf";
                    var colorClass = "green-color";

                    if (activity.pointCategory == "Gallons of Water"){
                        pointCategoryIcon = "waterdrop";
                        colorClass = "blue-color";
                    }

                    console.log("Add category: " + activity.activityCategory + ", activity: " + activity.activityName);
                    $scope.categoryList.push({title: activity.activityCategory, activities: [{name: activity.activityName, points: activity.points, pointCategory: activity.pointCategory, description: activity.description, added: false, addedPhrase: "Add Activity", icon: pointCategoryIcon, colorClass: colorClass}]});
                }

            }
        }


        //returns true if this category exists in the list
        function isInCategoryList(categoryName) {

            for (var i = 0; i < $scope.categoryList.length; i++) {
                if ($scope.categoryList[i].title == categoryName) {
                    return true;
                }
            }
            return false;
        }



        $scope.saveSelections = function() {

            console.log("saveSelections");

            $ionicLoading.show({
                template: 'Loading...'
            });

            var user = Parse.User.current();
            var todoList = user.get('todoList');
            var itemAdded = false;

            for (var i = 0; i < $scope.pendingActivities.length; i++) {
                
                //add activities to user profile. save to parse
                if (!listContainsActivity(todoList, $scope.pendingActivities[i].name)) {

                    itemAdded = true;
                    console.log('add ' + $scope.pendingActivities[i]);
                    todoList.push($scope.pendingActivities[i]);

                } else {

                    for (var j = 0; j < todoList.length; j++) {
                
                        console.log(todoList);
                        console.log($scope.pendingActivities);

                        if (todoList[j].name == $scope.pendingActivities[i].name) {
                            // if (todoList[j].freq != $scope.pendingActivities[i].freq){
                                todoList[j] = $scope.pendingActivities[i];
                                itemAdded = true;
                            // }
                        }

                    }

                }
            }

            console.log("parse request: save todo list");

            if(!itemAdded) {
                console.log('no new item added to todoList');
                $ionicLoading.hide();
                $scope.modal.hide();
                return;
            }

            console.log('todoList: ');
            console.log(todoList);
            user.set('todoList', todoList);

            user.save().then(function(obj) {
                // the object was saved successfully.
                $scope.todoList = generateToDoList();
                console.log("generate to do List:" + generateToDoList());
                $ionicLoading.hide();
                $scope.modal.hide();
                $state.go($state.current, {}, {reload: true});
            }, function(error) {
              // the save failed.
              $ionicLoading.hide();
                $ionicPopup.alert({
                  title: "Couldn't Establish Connection.",
                  okText: 'OK'
                });
            });

        }


        var listContainsActivity = function(list, activity) {

            for (var i = 0; i < list.length; i++) {
                
                if (list[i].name == activity) {
                    return true;
                }

            }

            return false;

        }


        $scope.pendingActivities = [];

        $scope.addActivity = function(categoryName, activityName) {

            console.log("addActivity " + activityName + " to " + categoryName);

            if (listContainsActivity($scope.pendingActivities, activityName)){
                //do not allow duplicates

                console.log('duplicate so it stays ' + $scope.pendingActivities);
                return;
            }

            // var frequency;

            for (var i = 0; i < $scope.categoryList.length; i++) {
                if ($scope.categoryList[i].title == categoryName) {
                    
                    for (var j = 0; j < $scope.categoryList[i].activities.length; j++) {

                        var act = $scope.categoryList[i].activities[j];

                        if (act.added)
                            {act.addedPhrase = 'Added!'} 
                        else {act.addedPhrase='Add Activity'};

                        if (act.name == activityName && act.added) {
                            // frequency = $scope.categoryList[i].activities[j].frequency;
                        }
                    }

                }
            }

            // if (frequency == null) {
            //     frequency = "Just Once";
            // }

            $scope.pendingActivities.push( {name: activityName} );
            console.log($scope.pendingActivities);

        }

        $scope.deleteActivity = function(activityName) {

            console.log("deleteActivity " + activityName);

            $ionicLoading.show({
                template: 'Loading...'
            });


            var user = Parse.User.current();
            var userTodoList = user.get('todoList');

            console.log(userTodoList);

            var todoList = [];
            var activities = $scope.allActivityList;

            for (var i = 0; i < userTodoList.length; i++){
                if (userTodoList[i].name == activityName) {

                    userTodoList.splice(i, 1);

                }
            }


            console.log("parse request: save new todo list");

            console.log('todoList: ');
            console.log(userTodoList);
            user.set('todoList', userTodoList);

            user.save().then(function(obj) {
                // the object was saved successfully.
                $scope.todoList = generateToDoList();
                console.log("generate to do List:" + generateToDoList());
                $ionicLoading.hide();
                $scope.modal.hide();
                $state.go($state.current, {}, {reload: true});
            }, function(error) {
              // the save failed.
              $ionicLoading.hide();
                $ionicPopup.alert({
                  title: "Couldn't Establish Connection.",
                  okText: 'OK'
                });
            });
        }


        function generateToDoList() {

            console.log("generateToDoList");

            var user = Parse.User.current();
            var userTodoList = user.get('todoList');

            console.log(userTodoList);

            var todoList = [];
            var activities = $scope.allActivityList;

            for (var i = 0; i < userTodoList.length; i++){
                for (var j = 0; j < activities.length; j++) {

                    if (userTodoList[i].name == activities[j].activityName) {

                        var thisAct = activities[j];
                        thisAct.added = true;
                        thisAct.addedPhrase = 'Added!';
                        // thisAct.frequency = userTodoList[i].freq;
                        todoList.push(thisAct);

                    }

                }
            }

            if (todoList.length == 0) {

                console.log('no items in todoList');
                document.getElementById('textIfNoItems').style.display = 'block';

            }

            return todoList;

        }


        $scope.reminder = function(activity){


            if ($localStorage.get('reminderExists')){
                var reminderExists = $localStorage.get('reminderExists');
            } else {
                var reminderExists = false;
            }
            
            if (activity.reminder) {
                
                activity.reminder = false;
                deleteReminder();

            } else if (reminderExists) {

                deleteReminder();

                $localStorage.set('reminderExists', false);
                $localStorage.set('reminderName', activity.activityName);
                //todo: alert! / delete reminder if you want

            } else {

                //todo: select between day, week, month
                //todo: select a time

                freq = 'day';
                time = new Date((new Date()).getTime + 8000);
                activity.reminder = true;

                setReminder(activity.activityName, time, freq);

            }

        }

        function setReminder(activityName, time, freq) {

            $localStorage.set('reminderExists', true);

            if (!!cordova)
            cordova.plugins.notification.local.schedule({
                id: 1,
                title: "MyEarth",
                text: "Remember to complete your activity: " + activityName,
                firstAt: time,
                every: freq
            });

        }

        function deleteReminder() {
            if (!!cordova)
            cordova.plugins.notification.local.cancel(1, function () {
            }, null);
        }


        //Do activity
        //TODO: change from name to the real activity
        $scope.doActivity  = function (activityName, category) {
            $ionicLoading.show({
                template: 'Loading...'
            });

            console.log("---- Do activity ------")
            // Getting the activity from Parse
            var promise = activityModel.getUniqueActivityByName(activityName);

            //If we get the activity with the activity Name
            promise.then(function (activity) {
                //Do that activity
                console.log(activity);
                var promise2 = activityModel.doActivity(activity);
                promise2.then(function (message) {
                    console.log(activity);
                    $ionicPopup.alert({
                        title: 'Good Work!',
                        template: activity.get("points") + ' ' + category + ' saved',
                        okText: 'OK'
                    });
                    $ionicLoading.hide();

                    var carbonSaved = 0;
                    var waterSaved = 0;
                    if (category == "Pounds of Carbon") {
                      carbonSaved = activity.get("points");
                    } else if (category == "Gallons of Water") {
                      waterSaved = activity.get("points");
                    }

                    if (window.analytics) {
                      window.analytics.logEvent("myearth_activity", {
                        activity_category: category,
                        activity_id: activity.id,
                        activity_name: activityName,
                        carbon_saved: carbonSaved,
                        water_saved: waterSaved,
                      });
                    }
                }, function (error) {
                    $ionicPopup.alert({
                        title: error,
                        okText: 'OK'
                    });
                    $ionicLoading.hide();
                });

            }, function (message) {
                console.log("Error Message: " + message);
            })

        }

    });
