/// <reference path="../../../../d.ts/lodash.d.ts" />
/// <reference path="../../../../d.ts/traindefs.d.ts" />
/// <reference path="../../../../d.ts/angular.d.ts" />
angular.module("train").controller("StationGridController", function ($scope, $q, trainServices) {
    var stationsPromise = trainServices.getStations();
    var trainsPromise = trainServices.getTrains();
    var linesPromise = trainServices.getLines();
    $q.all([linesPromise, stationsPromise, trainsPromise]).then(function (resVector) {
        $scope.lines = resVector[0].data;
        $scope.stations = resVector[1].data;
        $scope.trains = resVector[2].data;
        buildGrid();
    });
    $scope.mouseOver = function (fromStation, toStation) {
        $scope.fromStation = fromStation;
        $scope.toStation = toStation;
    };
    $scope.stationFilterFn = function (station) {
        if (!$scope.selectedLine) {
            return false;
        }
        return _.contains($scope.selectedLine.stations, station.abbr);
    };
    $scope.selectLine = function (line) {
        $scope.selectedLine = line;
        $scope.fromStation = null;
        $scope.toStation = null;
    };
    function buildGrid() {
        $scope.selectedLine = $scope.lines[0];
        $scope.stations.forEach(function (fromStation) {
            $scope.stations.forEach(function (toStation) {
                getFromToStationInfo(fromStation, toStation);
            });
        });
    }
    ;
    function getFromToStationInfo(from, to) {
        console.log("From %s to %s", from.abbr, to.abbr);
    }
});
//# sourceMappingURL=StationGridController.js.map