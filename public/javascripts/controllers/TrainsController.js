angular.module("train")
    .controller("TrainsController", function($scope, trainServices, cacheServices, helperServices, $location, $routeParams, $interval){
        $scope.title = "Trains";

        trainServices.getStations()
            .success(function(stations){
                $scope.stations = stations;
            });

        trainServices.getTrains()
            .then(function(res){
                $scope.trains = res.data;
                var startStation = $routeParams["startStation"];
                setTrainStopTooltips();
                $scope.startStation = startStation;
                startTimer();
            }, function(err) {
                for (var prop in err) {
                    alert("Prop: " + prop + " = " + err[prop]);
                }
            });

        var startTimer = function() {
            $interval(function(){
                console.log("Interval fired in trains controller");
                _.each($scope.trains, function(train){
                    if (train.startTime) {
                        train.leavesIn = helperServices.elapsedSecondsUntil(train.startTime);
                    }
                });
            }, 1000);
        };

        var setTrainStopTooltips = function() {
            _.each($scope.trains, function(train){
                train.toolTip = _.map(train.stops, function(stop){
                    return cacheServices.getStation(stop.station).name;
                }).join("\n");
            });
        }
        var stationSelect = function() {
            if (!$scope.startStation && !$scope.endStation) {
                return;
            }
            _.each($scope.trains, function(train){

                if ($scope.startStation) {
                    var startIndex = _.findIndex(train.stops, function (stop) {
                        return stop.station == $scope.startStation;
                    });
                    if (startIndex >= 0) {
                        train.startTime = train.stops[startIndex].time;
                        train.leavesIn = helperServices.elapsedSecondsUntil(train.startTime);
                    }
                }

                if ($scope.endStation) {
                    var endIndex = _.findIndex(train.stops, function(stop){
                        return stop.station == $scope.endStation;
                    });
                    if (endIndex >= 0) {
                        train.stopTime = train.stops[endIndex].time;
                    }
                }

                if ($scope.startStation && $scope.endStation) {
                    if (startIndex >= 0 && endIndex >= 0 && endIndex > startIndex) {
                        train.tripStops = endIndex - startIndex;
                        train.tripTime = helperServices.elapsedMinutes(train.startTime, train.stopTime);
                    }
                    else {
                        train.tripStops = -1;
                    }
                }
            });
        };

        $scope.$watch("startStation", stationSelect);
        $scope.$watch("endStation", stationSelect);

        //For the start station dropdown, only show stations that connect with the selected
        //end station.

        $scope.startStationFilter = function(station) {
            if (!$scope.endStation) {
                return true;
            }

            return _.any($scope.trains, function(train){
                var startIndex = _.findIndex(train.stops, function(stop){
                    return stop.station == station.abbr;
                });
                var endIndex = _.findIndex(train.stops, function(stop){
                    return stop.station == $scope.endStation;
                });
                return (startIndex >= 0 && endIndex >= 0 && endIndex > startIndex);
            });
        };

        // For the end station dropdown, only show stations that connect with the start station

        $scope.endStationFilter = function(station) {
            if (!$scope.startStation) {
                return true;
            }

            return _.any($scope.trains, function(train){
                var startIndex = _.findIndex(train.stops, function(stop){
                    return stop.station == $scope.startStation;
                });
                var endIndex = _.findIndex(train.stops, function(stop){
                    return stop.station == station.abbr;
                });
                return (startIndex >= 0 && endIndex >= 0 && endIndex > startIndex);
            });
        }

        $scope.selectedStopsFn = function(train) {
            var startStation = $scope.startStation;
            var endStation = $scope.endStation;

            if (!startStation && !endStation) {
                return true;
            }

            if (startStation) {
                var startIndex = _.findIndex(train.stops, function(stop) { return stop.station == startStation});
            }

            if (endStation) {
                var endIndex = _.findIndex(train.stops, function(stop) { return stop.station == endStation});
            }

            if (startStation && endStation) {
                return (startIndex >= 0 && endIndex >= 0 && endIndex > startIndex);
            }

            if (startStation) {
                return startIndex >= 0;
            }

            if (endStation) {
                return endIndex >= 0;
            }
        };

        $scope.clearFilters = function() {
            $scope.startStation = null;
            $scope.endStation = null;
        };

        $scope.swapStations = function() {
            var temp = $scope.startStation;
            $scope.startStation = $scope.endStation;
            $scope.endStation = temp;
        };

        $scope.newTrain = function() {
            trainServices.addTrain()
                .then(function(res){
                    var train = res.data[0];
                    $location.path("/trains/" + train.number);
                });
        };

        $scope.getElapsedClass = function(leavesIn) {
            if (leavesIn < 3600) {
                return "text-danger";
            }
            return "";
        };
    });