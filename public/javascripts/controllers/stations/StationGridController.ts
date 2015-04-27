/// <reference path="../../../../d.ts/lodash.d.ts" />
/// <reference path="../../../../d.ts/traindefs.d.ts" />
/// <reference path="../../../../d.ts/angular.d.ts" />

class FromToInfo {

    constructor(fromStation:TrainDefs.Station, toStation:TrainDefs.Station) {
        this.fromStation = fromStation;
        this.toStation = toStation;
        this.trains = [];
    }

    fromStation: TrainDefs.Station;
    toStation: TrainDefs.Station;
    trains: TrainDefs.Train[];

    addTrain(train:TrainDefs.Train) : void {
        this.trains.push(train);
    }

    trainCount() : number {
        return this.trains.length;
    }

    trainListDisplay() : string {
        var display = _.map(this.trains, (train:TrainDefs.Train) => {
            return train.description;
        }).join("\n");

        return display;
    }
}

class Collector {

    db = {};

    clearDb() : void {
        this.db = {}
    }

    makeKey(fromStation:TrainDefs.Station, toStation:TrainDefs.Station) : string {
        return fromStation.abbr + "-" + toStation.abbr;
    }

    addTrain(fromStation:TrainDefs.Station, toStation:TrainDefs.Station, train:TrainDefs.Train) {
        var key = this.makeKey(fromStation, toStation);
        var fromToInfo:FromToInfo;

        fromToInfo = this.db[key];
        if (!fromToInfo) {
            fromToInfo = new FromToInfo(fromStation, toStation);
            this.db[key] = fromToInfo;
        }
        fromToInfo.addTrain(train);
    }

    trainCount(fromStation:TrainDefs.Station, toStation:TrainDefs.Station) : number {
        var key = this.makeKey(fromStation, toStation);
        var fromToInfo:FromToInfo;

        fromToInfo = this.db[key];
        return (fromToInfo && fromToInfo.trainCount()) || 0;
    }

    trainListDisplay(fromStation:TrainDefs.Station, toStation:TrainDefs.Station) : string {
        var key = this.makeKey(fromStation, toStation);
        var fromToInfo:FromToInfo;

        fromToInfo = this.db[key];
        return (fromToInfo && fromToInfo.trainListDisplay()) || "";
    }
}

interface StationGridControllerScope extends ng.IScope {

    lines: TrainDefs.Line[];
    trains: TrainDefs.Train[];
    stations: TrainDefs.Station[];
    stationFilterFn(station:TrainDefs.Station):boolean;
    selectLine(line:TrainDefs.Line):void
    selectedLine: TrainDefs.Line;
    mouseOver(fromStation:TrainDefs.Station,toStation:TrainDefs.Station) :void;
    fromStation: TrainDefs.Station;
    toStation: TrainDefs.Station;
    collector: Collector;
}

angular.module("train")
    .controller("StationGridController", function ($scope:StationGridControllerScope, $q:ng.IQService, trainServices) {

        $scope.collector = new Collector();

        var stationsPromise = trainServices.getStations();
        var trainsPromise = trainServices.getTrains();
        var linesPromise = trainServices.getLines();

        $q.all([linesPromise, stationsPromise, trainsPromise])
            .then(function(resVector:any[]) {
                $scope.lines = resVector[0].data;
                $scope.stations = resVector[1].data;
                $scope.trains = resVector[2].data;
                $scope.selectedLine = $scope.lines[0];

                buildGrid();
            }
        );

        $scope.mouseOver = function(fromStation:TrainDefs.Station,toStation:TrainDefs.Station) :void {
            $scope.fromStation = fromStation;
            $scope.toStation = toStation;
        }

        $scope.stationFilterFn = function(station:TrainDefs.Station) : boolean {
            if (!$scope.selectedLine) {
                return false;
            }
            return _.contains($scope.selectedLine.stations, station.abbr);
        }

        $scope.selectLine = function(line:TrainDefs.Line) {
            $scope.selectedLine = line;
            $scope.fromStation = null;
            $scope.toStation = null;
        }

        function getStation(abbr:string) : TrainDefs.Station {
            return _.find($scope.stations, (station) => {
                return station.abbr === abbr;
            });
        }

        function buildGrid() : void {
            _.forEach($scope.trains, (train:TrainDefs.Train) => {
                console.log("buildGrid starting train %d", train.number);
                for (var i = 0; i<train.stops.length - 1; ++i) {
                    var fromStation = getStation(train.stops[i].station);
                    for (var j = i + 1; j < train.stops.length; ++j) {
                        var toStation = getStation(train.stops[j].station);
                        $scope.collector.addTrain(fromStation, toStation, train);
                    }
                }
            });
        }
    });