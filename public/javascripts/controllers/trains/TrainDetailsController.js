angular.module("train")
    .controller("TrainDetailsController", function ($scope, $location, trainServices, $routeParams) {

        var trainNumber = $routeParams["trainNumber"];

        $scope.trainNumber = trainNumber;
        trainServices.getTrain(trainNumber)
            .then(function(res){
                $scope.train = res.data;

                trainServices.getStation($scope.train.originStation).then(function(res){
                    $scope.originStation = res.data;
                });
                trainServices.getStation($scope.train.terminalStation).then(function(res){
                    $scope.terminalStation = res.data;
                });
            });

        trainServices.getStations()
            .then(function(res){
                $scope.stations = res.data;
            });

        $scope.addStop = function(stopTime, station) {
            //alert("Adding stop at " + stopTime + " for station " + station);
            trainServices.addStop($scope.trainNumber, stopTime, station)
                .then(function(res){
                    return trainServices.getTrain($scope.trainNumber);
                }, function(err){
                    alert(err);
                })
                .then(function(res){
                    $scope.train = res.data;
                });
        }
    });