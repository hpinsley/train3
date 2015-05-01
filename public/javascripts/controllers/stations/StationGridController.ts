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

    getFromTo(fromStation:TrainDefs.Station, toStation:TrainDefs.Station) {
        var key = this.makeKey(fromStation, toStation);
        var fromToInfo:FromToInfo;

        fromToInfo = this.db[key];
        return fromToInfo;
    }

    trainListDisplay(fromStation:TrainDefs.Station, toStation:TrainDefs.Station) : string {
        var fromToInfo = this.getFromTo(fromStation, toStation);
        return (fromToInfo && fromToInfo.trainListDisplay()) || "";
    }
}

class TripsViewModel {

    trains:TrainDefs.Train[];
    stops:string[];

    constructor(public helperServices, public fromToInfo:FromToInfo, public selectedLine:TrainDefs.Line) {
        this.trains = _.cloneDeep(fromToInfo.trains);
        this.filterTrainStops();

    }

    lineIndex(stationAbbr:string) : number {
        return this.selectedLine.stations.indexOf(stationAbbr);
    }
    filterTrainStops() :void {
        var self = this;
        var fromIndex:number = this.lineIndex(this.fromToInfo.fromStation.abbr);
        var toIndex:number = this.lineIndex(this.fromToInfo.toStation.abbr);

        var direction:number = (toIndex - fromIndex) / Math.abs(toIndex - fromIndex);

        var minIndex = Math.min(fromIndex, toIndex);
        var maxIndex = Math.max(fromIndex, toIndex);

        this.stops = _.filter(this.selectedLine.stations, (stationAbbr:string) => {
            var index = self.lineIndex(stationAbbr);
            return index >= minIndex && index <= maxIndex;
        });

        this.stops = _.sortBy(this.stops, (stationAbbr) => {
            var index = self.lineIndex(stationAbbr);
            return direction * index;
        });

        //Take the stops out of these train clones if the stop is not between the
        //two stations on the selected line.

        this.trains.forEach((train) => {
            var realStops = train.stops;   //Save the real stops
            train.stops = [];

            //Create a new stop entry for each top in this.stops
            this.stops.forEach((lineStop) => {
                var realStop = _.find(realStops, (stop:TrainDefs.Stop) =>{
                    return lineStop === stop.station;
                });
                var stopTime:string;
                if (realStop) {
                    var d:Date = this.helperServices.translateZuluString(realStop.time);
                    stopTime = this.helperServices.formatTime(d);
                }
                else {
                    stopTime = undefined;
                }

                var newStop:TrainDefs.Stop = {
                    station: lineStop,
                    time: stopTime
                };
                train.stops.push(newStop);
            });
        });

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
    getCellClass(fromStation:TrainDefs.Station, toStation:TrainDefs.Station) : string;
    tripViewModel: TripsViewModel;
    frozen: boolean;
    toggleFreeze():void;
}

angular.module("train")
    .controller("StationGridController", function ($scope:StationGridControllerScope, $q:ng.IQService, trainServices, helperServices) {

        $scope.collector = new Collector();
        $scope.frozen = false;

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

        $scope.toggleFreeze = function() {
            $scope.frozen = !$scope.frozen;
        }

        $scope.mouseOver = function(fromStation:TrainDefs.Station,toStation:TrainDefs.Station) :void {

            if ($scope.frozen) {
                return;
            }

            $scope.fromStation = fromStation;
            $scope.toStation = toStation;

            var fromTo = $scope.collector.getFromTo(fromStation, toStation);
            if (fromTo && $scope.selectedLine) {
                $scope.tripViewModel = new TripsViewModel(helperServices, fromTo, $scope.selectedLine);
            }
        }

        $scope.getCellClass = function(fromStation:TrainDefs.Station, toStation:TrainDefs.Station) : string {

            if (fromStation === toStation) {
                return "Disallowed"
            }
            if (fromStation === $scope.fromStation && toStation === $scope.toStation) {
                return "MatchBoth";
            }
            if (fromStation === $scope.fromStation) {
                return "MatchFrom";
            }
            if (toStation === $scope.toStation) {
                return "MatchTo";
            }
            return null;
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