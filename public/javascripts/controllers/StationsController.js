angular.module("train")
    .controller("StationsController", function($scope, trainServices){
        $scope.stations = trainServices.getStations();
    });