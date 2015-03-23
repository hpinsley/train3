angular.module("train")
    .controller("StationMapController", function($scope, trainServices, helperServices, cacheServices) {
        $scope.title = "Station Map";

        trainServices.getLines()
            .success(function(lines){
                $scope.lines = lines;
                $scope.selectedLine = "Harlem";
            });
        trainServices.getStations()
            .success(function(stations) {
                $scope.stations = stations;
            });

        $scope.stationInLineFn = function(station) {
            return _.any(station.lines, function(line){
                return line === $scope.selectedLine;
            });
        }

    });
