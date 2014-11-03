angular.module("train")
    .controller("StationsController", function($scope, trainServices){

        trainServices.getStations()
            .then(function(res){
                $scope.stations = res.data;
            });
    });