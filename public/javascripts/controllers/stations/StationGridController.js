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
    Collector.prototype.getFromTo = function (fromStation, toStation) {
        var key = this.makeKey(fromStation, toStation);
        var fromToInfo;
        fromToInfo = this.db[key];
        return fromToInfo;
    };
    Collector.prototype.trainListDisplay = function (fromStation, toStation) {
        var fromToInfo = this.getFromTo(fromStation, toStation);
        return (fromToInfo && fromToInfo.trainListDisplay()) || "";
    };
    return Collector;
})();
var TripsViewModel = (function () {
    function TripsViewModel(helperServices, fromToInfo, selectedLine) {
        this.helperServices = helperServices;
        this.fromToInfo = fromToInfo;
        this.selectedLine = selectedLine;
        this.trains = _.cloneDeep(fromToInfo.trains);
        this.filterTrainStops();
    }
    TripsViewModel.prototype.lineIndex = function (stationAbbr) {
        return this.selectedLine.stations.indexOf(stationAbbr);
    };
    TripsViewModel.prototype.filterTrainStops = function () {
        var _this = this;
        var self = this;
        var fromIndex = this.lineIndex(this.fromToInfo.fromStation.abbr);
        var toIndex = this.lineIndex(this.fromToInfo.toStation.abbr);
        var direction = (toIndex - fromIndex) / Math.abs(toIndex - fromIndex);
        var minIndex = Math.min(fromIndex, toIndex);
        var maxIndex = Math.max(fromIndex, toIndex);
        this.stops = _.filter(this.selectedLine.stations, function (stationAbbr) {
            var index = self.lineIndex(stationAbbr);
            return index >= minIndex && index <= maxIndex;
        });
        this.stops = _.sortBy(this.stops, function (stationAbbr) {
            var index = self.lineIndex(stationAbbr);
            return direction * index;
        });
        //Take the stops out of these train clones if the stop is not between the
        //two stations on the selected line.
        this.trains.forEach(function (train) {
            var realStops = train.stops; //Save the real stops
            train.stops = [];
            //Create a new stop entry for each top in this.stops
            _this.stops.forEach(function (lineStop) {
                var realStop = _.find(realStops, function (stop) {
                    return lineStop === stop.station;
                });
                var stopTime;
                if (realStop) {
                    var d = _this.helperServices.translateZuluString(realStop.time);
                    stopTime = _this.helperServices.formatTime(d);
                }
                else {
                    stopTime = undefined;
                }
                var newStop = {
                    station: lineStop,
                    time: stopTime
                };
                train.stops.push(newStop);
            });
        });
    };
    return TripsViewModel;
})();
angular.module("train").controller("StationGridController", function ($scope, $q, trainServices, helperServices) {
    $scope.collector = new Collector();
    $scope.frozen = false;
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
    $scope.toggleFreeze = function () {
        $scope.frozen = !$scope.frozen;
    };
    $scope.notePosition = function (id, eventObj) {
        console.log("Controller: id:%s Client: %d,%d; Offset: %d,%d; Page: %d,%d", id, eventObj.clientX, eventObj.clientY, eventObj.offsetX, eventObj.offsetY, eventObj.pageX, eventObj.pageY);
        if (!$scope.frozen) {
            $scope.overX = eventObj.clientX;
            $scope.overY = eventObj.clientY;
        }
    };
    $scope.mouseOver = function (fromStation, toStation) {
        if ($scope.frozen) {
            return;
        }
        $scope.fromStation = fromStation;
        $scope.toStation = toStation;
        var fromTo = $scope.collector.getFromTo(fromStation, toStation);
        if (fromTo && $scope.selectedLine) {
            $scope.tripViewModel = new TripsViewModel(helperServices, fromTo, $scope.selectedLine);
        }
    };
    $scope.getCellClass = function (fromStation, toStation) {
        if (fromStation === toStation) {
            return "Disallowed";
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