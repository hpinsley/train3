angular.module("train")
    .controller("LineDetailsController", function ($scope, $modal, $log, $location, trainServices, helperServices, $routeParams) {

        $log.debug("Start of LineDetailsController");

        $scope.lineName = $routeParams["lineName"];

        trainServices.getLine($scope.lineName)
            .success(function(line){
                $scope.line = line;
            });

        trainServices.getStations()
            .success(function(stations){
                $scope.stations = stations;
            });

        $scope.addStation = function() {
            if (!$scope.selectedStationAbbr) {
                return;
            }
            trainServices.addStationToLine($scope.lineName, $scope.selectedStationAbbr)
                .success(function(line) {
                    $scope.line = line;
                });
        };

        $scope.moveStationInLine = function(lineName, stationAbbr, direction) {

            trainServices.moveStationInLine(lineName, stationAbbr, direction)
                .success(function(line){
                    $scope.line = line;
                });
        }
    });