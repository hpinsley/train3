angular.module("train")
    .controller("TrainsController", function($scope, trainServices, helperServices, $location){
        $scope.title = "This is from trains controller";

        trainServices.getStations()
            .success(function(stations){
                $scope.stations = stations;
            });

        trainServices.getTrains()
            .then(function(res){
                $scope.trains = res.data;
            }, function(err) {
                for (var prop in err) {
                    alert("Prop: " + prop + " = " + err[prop]);
                }
            });

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
        }

        $scope.newTrain = function() {
            trainServices.addTrain()
                .then(function(res){
                    var train = res.data[0];
                    $location.path("/trains/" + train.number);
                });
        }
    });