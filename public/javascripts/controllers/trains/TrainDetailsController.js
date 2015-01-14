angular.module("train")
    .controller("TrainDetailsController", function ($scope, $location, trainServices, helperServices, $routeParams) {

        $scope.afterAdd = false;

        var trainNumber = $routeParams["trainNumber"];

        $scope.trainNumber = trainNumber;
        trainServices.getTrain(trainNumber)
            .then(function(res){
                $scope.train = res.data;
                var stopCount = $scope.train.stops.length;
                if (stopCount > 0) {
                    $scope.stopTime = new Date($scope.train.stops[stopCount - 1].time);
                }
            });

        //for the select control
        trainServices.getStations()
            .then(function(res){
                $scope.stations = res.data;
            });

        $scope.addStop = function(stopTime, station) {
            if (!validateStop(stopTime, station)) {
                return;
            }
            trainServices.addStop($scope.trainNumber, stopTime, station)
                .then(function(res){
                    return trainServices.getTrain($scope.trainNumber);
                })
                .then(function(res){
                    $scope.train = res.data;
                    $scope.afterAdd = true;
                });
        };

        $scope.deleteStop = function (trainNumber, stop) {
            trainServices.deleteStop(trainNumber, stop)
                .then(function (res) {
                    return trainServices.getTrain($scope.trainNumber);
                })
                .then(function (res) {
                    $scope.train = res.data;
                });
        };

        var validateStop = function(stopTime, stationAbbr) {
            var inCommon;
            var stops = $scope.train.stops;
            if (stops.length == 0) {
                return true;
            }
            var timeMatch = _.find(stops, function(stop) {
                var trainStopTime = new Date(stop.time);
                return trainStopTime.valueOf() == stopTime.valueOf();
            });
            if (timeMatch) {
                alert("You are already stopping at " + timeMatch.station + " at " + stopTime);
                return false;
            };

            var stationMatch = _.find(stops, function(stop){
                return stop.station === stationAbbr;
            });

            if (stationMatch) {
                alert("You are already stopping at station " + stationMatch.station);
                return false;
            }
            
            var priorStops = _.filter(stops, function(stop){
                var trainStopTime = new Date(stop.time);
                return trainStopTime.valueOf() < stopTime.valueOf();
            });

            if (priorStops.length > 0) {
                var previousStop = priorStops[priorStops.length - 1];
                inCommon = helperServices.linesInCommon(previousStop.station, stationAbbr);
                if (inCommon.length == 0) {
                    alert("All stations stops must connect via common station lines.  No line in common with previous stop " + previousStop.station);
                    return false;
                }
            }

            var laterStops = _.filter(stops, function(stop){
                var trainStopTime = new Date(stop.time);
                return trainStopTime.valueOf() > stopTime.valueOf();
            });

            if (laterStops.length > 0) {
                var nextStop = laterStops[0];
                inCommon = helperServices.linesInCommon(nextStop.station, stationAbbr);
                if (inCommon.length == 0) {
                    alert("All stations stops must connect via common station lines.  No line in common with next stop " + nextStop.station);
                    return false;
                }
            }

            return true;
        }
    });