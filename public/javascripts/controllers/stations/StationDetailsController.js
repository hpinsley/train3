angular.module("train")
    .controller("StationDetailsController", function ($scope, $location, trainServices, $routeParams) {

        var trainNumber = $routeParams["trainNumber"];
        var stationAbbr = $routeParams["stationAbbr"];

        $scope.stationAbbr = stationAbbr;

        trainServices.getStationTrains(stationAbbr)
            .then(function(res){
                $scope.trains = res.data;
            });
    });