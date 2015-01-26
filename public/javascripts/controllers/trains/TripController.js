angular.module("train")
    .controller("TripController", function ($scope, $location, trainServices, helperServices, $routeParams) {

        $scope.trainNumber = $routeParams["trainNumber"];
        $scope.startStation = $routeParams["start"];
        $scope.endStation = $routeParams["end"];

        trainServices.getTrain($scope.trainNumber)
            .then(function(res){
                $scope.train = res.data;
                $scope.startIndex = _.findIndex($scope.train.stops, function(stop){
                    return stop.station == $scope.startStation;
                });
                $scope.endIndex = _.findIndex($scope.train.stops, function(stop){
                    return stop.station == $scope.endStation;
                });

                if ($scope.startIndex >= 0) {
                    var startTime = $scope.train.stops[$scope.startIndex].time;
                    _.each($scope.train.stops, function(stop){
                        stop.elapsedMinutes = helperServices.elapsedMinutes(startTime, stop.time);
                    });
                }
            });

        $scope.stopFilter = function(stop) {
            var index = _.findIndex($scope.train.stops, function(tripStop) {
                return tripStop.station == stop.station;
            });

            return index >= $scope.startIndex && index <= $scope.endIndex;
        }

    });