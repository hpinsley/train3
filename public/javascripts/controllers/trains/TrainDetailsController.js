angular.module("train")
    .controller("TrainDetailsController", function ($scope, $location, trainServices, $routeParams) {

        $scope.afterAdd = false;

        var trainNumber = $routeParams["trainNumber"];

        $scope.trainNumber = trainNumber;
        trainServices.getTrain(trainNumber)
            .then(function(res){
                $scope.train = res.data;
            });

        //for the select control
        trainServices.getStations()
            .then(function(res){
                $scope.stations = res.data;
            });

        $scope.addStop = function(stopTime, station) {
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
        }
    });