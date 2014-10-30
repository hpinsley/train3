angular.module("train")
    .controller("StationsController", function($scope, trainServices){

        trainServices.getStations()
            .then(function(stations){
                $scope.stations = stations;
            });
    });