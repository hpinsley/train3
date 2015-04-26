/// <reference path="../../../../d.ts/lodash.d.ts" />
/// <reference path="../../../../d.ts/traindefs.d.ts" />
/// <reference path="../../../../d.ts/angular.d.ts" />

interface StationGridControllerScope extends ng.IScope {

    lines: TrainDefs.Line[];
    trains: TrainDefs.Train[];
    stations: TrainDefs.Station[];
    stationFilterFn(station:TrainDefs.Station):boolean;
    selectLine(line:TrainDefs.Line):void
    selectedLine: TrainDefs.Line;
}

angular.module("train")
    .controller("StationGridController", function ($scope:StationGridControllerScope, $q:ng.IQService, trainServices) {

        var stationsPromise = trainServices.getStations();
        var trainsPromise = trainServices.getTrains();
        var linesPromise = trainServices.getLines();

        $q.all([linesPromise, stationsPromise, trainsPromise])
            .then(function(resVector:any[]) {
                $scope.lines = resVector[0].data;
                $scope.stations = resVector[1].data;
                $scope.trains = resVector[2].data;

                buildGrid();
            }
        );

        $scope.stationFilterFn = function(station:TrainDefs.Station) : boolean {
            if (!$scope.selectedLine) {
                return false;
            }
            return _.contains($scope.selectedLine.stations, station.abbr);
        }

        $scope.selectLine = function(line:TrainDefs.Line) {
            $scope.selectedLine = line;
        }

        function buildGrid() : void {
            $scope.selectedLine = $scope.lines[0];
            $scope.stations.forEach((fromStation) => {
                $scope.stations.forEach((toStation) => {
                    getFromToStationInfo(fromStation, toStation);
                });
            });
        };

        function getFromToStationInfo(from:TrainDefs.Station, to:TrainDefs.Station) {
            console.log("From %s to %s", from.abbr, to.abbr);
        }

    });