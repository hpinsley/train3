angular.module("train")
    .controller("TrainDetailsController", function ($scope, $location, trainServices, $routeParams) {

        var displayTrainSummary = function() {
            trainServices.getStation($scope.train.originStation).then(function(res){
                $scope.originStation = res.data;
            });
            trainServices.getStation($scope.train.terminalStation).then(function(res){
                $scope.terminalStation = res.data;
            });
        };

        var trainNumber = $routeParams["trainNumber"];

        $scope.trainNumber = trainNumber;
        trainServices.getTrain(trainNumber)
            .then(function(res){
                $scope.train = res.data;
                displayTrainSummary();
            });

        //for the select control
        trainServices.getStations()
            .then(function(res){
                $scope.stations = res.data;
            });

        $scope.addStop = function(stopTime, station) {
            //alert("Adding stop at " + stopTime + " for station " + station);
            trainServices.addStop($scope.trainNumber, stopTime, station)
                .then(function(res){
                    return trainServices.getTrain($scope.trainNumber);
                })
                .then(function(res){
                    $scope.train = res.data;
                    displayTrainSummary();
                });
        };

        $scope.deleteStop = function (trainNumber, stop) {
            //alert("Deleting stop for train " + trainNumber + " at " + stop.time + " at " + stop.station);
            trainServices.deleteStop(trainNumber, stop)
                .then(function (res) {
                    return trainServices.getTrain($scope.trainNumber);
                })
                .then(function (res) {
                    $scope.train = res.data;
                    displayTrainSummary();
                });
        }
    });