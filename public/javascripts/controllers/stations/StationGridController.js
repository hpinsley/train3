/// <reference path="../../../../d.ts/lodash.d.ts" />
/// <reference path="../../../../d.ts/traindefs.d.ts" />
/// <reference path="../../../../d.ts/angular.d.ts" />
angular.module("train").controller("StationGridController", function ($scope, $q, trainServices) {
    var stationsPromise = trainServices.getStations();
    var trainsPromise = trainServices.getTrains();
    function buildGrid() {
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
    $q.all([stationsPromise, trainsPromise]).then(function (resVector) {
        $scope.stations = _.sortBy(resVector[0].data, "abbr");
        $scope.trains = resVector[1].data;
        buildGrid();
    });
});
//# sourceMappingURL=StationGridController.js.map