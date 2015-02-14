angular.module("train")
    .controller("TrainDetailsController", function ($scope, $modal, $log, $location, trainServices, helperServices, $routeParams) {

        $log.debug("Start of TrainDetailController");

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

        $scope.dupTrain = function(train) {
            var modalInstance = $modal.open({
                templateUrl: 'views/trains/dupTrainDialog.html',
                controller: 'TrainDetailsDialogController',
                scope: $scope,
                size: 'lg'
            });

            modalInstance.result.then(function(res){
                $log.debug("Will duplicate train " + $scope.train.description + " " + res.trainCount + " time(s) offset by " + res.minutes + " minutes.");
                trainServices.dupTrain($scope.train.number, res.trainCount, res.minutes);
                $location.path("/trains");
            });
        };

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

            //Are we stopping at this station already?
            var stationMatch = _.find(stops, function(stop){
                return stop.station === stationAbbr;
            });

            if (stationMatch) {
                alert("You are already stopping at station " + stationMatch.station);
                return false;
            }

            //Break the stops by time into three buckets -- prior stops(-1), later stops(1)
            //and equal stop times (0)

            var stopGroups = _.groupBy(stops, function(stop) {
                var trainStopTime = new Date(stop.time);
                if (trainStopTime.valueOf() === stopTime.valueOf()) {
                    return 0;
                }
                if (trainStopTime.valueOf() < stopTime.valueOf()) {
                    return -1;
                }
                return 1;
            });

            var timeMatch = stopGroups[0] ? stopGroups[0][0] : null;

            if (timeMatch) {
                alert("You are already stopping at " + timeMatch.station + " at " + stopTime);
                return false;
            };


            var priorStops = stopGroups[-1];

            if (priorStops) {
                var previousStop = priorStops[priorStops.length - 1];
                inCommon = helperServices.linesInCommon(previousStop.station, stationAbbr);
                if (inCommon.length == 0) {
                    alert("All stations stops must connect via common station lines.  No line in common with previous stop " + previousStop.station);
                    return false;
                }
            }

            var laterStops = stopGroups[1];

            if (laterStops) {
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