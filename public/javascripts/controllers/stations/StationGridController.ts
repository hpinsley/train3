/// <reference path="../../../../d.ts/lodash.d.ts" />
/// <reference path="../../../../d.ts/traindefs.d.ts" />
/// <reference path="../../../../d.ts/angular.d.ts" />

interface StationGridControllerScope extends ng.IScope {

    trains: TrainDefs.Train[];
    stations: TrainDefs.Station[];

}
angular.module("train")
    .controller("StationGridController", function ($scope:StationGridControllerScope, $q:ng.IQService, trainServices) {

        var stationsPromise = trainServices.getStations();
        var trainsPromise = trainServices.getTrains();

        function buildGrid() : void {
            $scope.stations.forEach((fromStation) => {
                $scope.stations.forEach((toStation) => {
                    getFromToStationInfo(fromStation, toStation);
                });
            });
        };

        function getFromToStationInfo(from:TrainDefs.Station, to:TrainDefs.Station) {
            console.log("From %s to %s", from.abbr, to.abbr);
        }

        $q.all([stationsPromise, trainsPromise])
            .then(function(resVector:any[]) {
                $scope.stations = <TrainDefs.Station[]> _.sortBy(resVector[0].data, "abbr");
                $scope.trains = resVector[1].data;

                buildGrid();
            }
        );


    });