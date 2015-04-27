/// <reference path="../../../../d.ts/lodash.d.ts" />
/// <reference path="../../../../d.ts/traindefs.d.ts" />
/// <reference path="../../../../d.ts/angular.d.ts" />
var FromToInfo = (function () {
    function FromToInfo(fromStation, toStation) {
        this.fromStation = fromStation;
        this.toStation = toStation;
        this.trains = [];
    }
    FromToInfo.prototype.addTrain = function (train) {
        this.trains.push(train);
    };
    FromToInfo.prototype.trainCount = function () {
        return this.trains.length;
    };
    FromToInfo.prototype.trainListDisplay = function () {
        var display = _.map(this.trains, function (train) {
            return train.description;
        }).join("\n");
        return display;
    };
    return FromToInfo;
})();
var Collector = (function () {
    function Collector() {
        this.db = {};
    }
    Collector.prototype.clearDb = function () {
        this.db = {};
    };
    Collector.prototype.makeKey = function (fromStation, toStation) {
        return fromStation.abbr + "-" + toStation.abbr;
    };
    Collector.prototype.addTrain = function (fromStation, toStation, train) {
        var key = this.makeKey(fromStation, toStation);
        var fromToInfo;
        fromToInfo = this.db[key];
        if (!fromToInfo) {
            fromToInfo = new FromToInfo(fromStation, toStation);
            this.db[key] = fromToInfo;
        }
        fromToInfo.addTrain(train);
    };
    Collector.prototype.trainCount = function (fromStation, toStation) {
        var key = this.makeKey(fromStation, toStation);
        var fromToInfo;
        fromToInfo = this.db[key];
        return (fromToInfo && fromToInfo.trainCount()) || 0;
    };
    Collector.prototype.trainListDisplay = function (fromStation, toStation) {
        var key = this.makeKey(fromStation, toStation);
        var fromToInfo;
        fromToInfo = this.db[key];
        return (fromToInfo && fromToInfo.trainListDisplay()) || "";
    };
    return Collector;
})();
angular.module("train").controller("StationGridController", function ($scope, $q, trainServices) {
    $scope.collector = new Collector();
    var stationsPromise = trainServices.getStations();
    var trainsPromise = trainServices.getTrains();
    var linesPromise = trainServices.getLines();
    $q.all([linesPromise, stationsPromise, trainsPromise]).then(function (resVector) {
        $scope.lines = resVector[0].data;
        $scope.stations = resVector[1].data;
        $scope.trains = resVector[2].data;
        $scope.selectedLine = $scope.lines[0];
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
    function getStation(abbr) {
        return _.find($scope.stations, function (station) {
            return station.abbr === abbr;
        });
    }
    function buildGrid() {
        _.forEach($scope.trains, function (train) {
            console.log("buildGrid starting train %d", train.number);
            for (var i = 0; i < train.stops.length - 1; ++i) {
                var fromStation = getStation(train.stops[i].station);
                for (var j = i + 1; j < train.stops.length; ++j) {
                    var toStation = getStation(train.stops[j].station);
                    $scope.collector.addTrain(fromStation, toStation, train);
                }
            }
        });
    }
});
//# sourceMappingURL=StationGridController.js.map