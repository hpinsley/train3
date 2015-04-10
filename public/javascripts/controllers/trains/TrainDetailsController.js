angular.module("train")
    .controller("TrainDetailsController", function ($scope, $modal, $log, $location, trainServices, helperServices, $routeParams, $q) {

        var trainMapWidth = 500;
        var trainMapHeight = 400;
        var lineMapWidth = 700;
        var lineMapHeight = 500;
        var zoomedTrainMapWidth = 1000;
        var zoomedTrainMapHeight = 700;

        $log.debug("Start of TrainDetailController");

        $scope.afterAdd = false;
        $scope.zoomClass = "unzoomed";
        $scope.trainMapClass = "";

        var trainNumber = $routeParams["trainNumber"];
        var map;
        var lineMap;
        var zoomedTrainMap;

        function setBlackoutStops() {
            if (!lineMap) {
                return;
            }
            lineMap.setBlackoutStops(_.map($scope.train.stops, function(stop){
                return stop.station;
            }));
        }

        function redrawBlackoutStops() {
            if (!lineMap) {
                return;
            }
            lineMap.updateStopColors();
        }
        function onStationSelect(station) {
            $scope.$apply(function(){
                $scope.station = station.abbr;
            });
        }

        function drawLineMap(line) {
            if (lineMap) {
                lineMap.erase();
            }
            lineMap = new Maps.LineMap(trainServices, $q, line, $scope.stations, "lineMap", lineMapWidth,lineMapHeight);
            lineMap.tooltipOffset = 150;
            lineMap.plotMap().then(function(){
                setBlackoutStops();
                lineMap.showLinePath();
                lineMap.showStationLabels();
            });
            lineMap.registerStationClick({ selectStation: onStationSelect});
        }
        function drawMap() {
            if (map) {
                map.erase();
            }
            map = new Maps.LineMap(trainServices, $q, $scope.train, $scope.stations, "trainMap", trainMapWidth,trainMapHeight);
            map.tooltipOffset = 20;

            return map.plotMap().then(function(){
                map.showLinePath();
            });
        }

        $scope.trainNumber = trainNumber;
        trainServices.getTrain(trainNumber)
            .then(function(res){
                $scope.train = res.data;
                var stopCount = $scope.train.stops.length;
                if (stopCount > 0) {
                    $scope.stopTime = new Date($scope.train.stops[stopCount - 1].time);
                }
            })
            .then(function(){
                //for the select control
                trainServices.getStations()
                    .then(function(res){
                        $scope.stations = res.data;

                        //Here we have both the train and stations.  Enough to prime our map
                        drawMap().then(selectLineFromLastStop);
                    });

            });


        trainServices.getLines()
            .success(function(lines){
                $scope.lines = lines;
            });

        $scope.zoomTrainMap = function() {
            $scope.zoomClass = "zoomed";
            $scope.trainMapClass = "goaway";

            drawZoomedTrainMap();
        };

        $scope.unZoomTrainMap = function() {
            $scope.zoomClass = "unzoomed";
            $scope.trainMapClass = "";

            if (zoomedTrainMap) {
                zoomedTrainMap.erase();
                zoomedTrainMap = null;
            }
        };

        //If we hover over the name of a station in the list of stops for the train
        //hightlight it on the map
        $scope.stationHover = function(stationAbbr) {
            if (!map) {
                return;
            }

            var station = _.find($scope.stations, function(station){
                return station.abbr === stationAbbr;
            });

            map.plotStationLoc(station);
        }


        drawZoomedTrainMap = function() {
            if (zoomedTrainMap) {
                zoomedTrainMap.erase();
            }
            zoomedTrainMap = new Maps.LineMap(trainServices, $q, $scope.train, $scope.stations, "zoomedMapMap", zoomedTrainMapWidth,zoomedTrainMapHeight);
            zoomedTrainMap.tooltipOffset = 40;
            zoomedTrainMap.plotMap().then(function(){
                zoomedTrainMap.showLinePath();
                zoomedTrainMap.showStationLabels();
            });

        };

        function selectLineFromLastStop() {
            if ($scope.train.stops.length == 0 || !$scope.lines) {
                return;
            }

            var lastStopAbbr = _.last($scope.train.stops).station;

            var line = _.find($scope.lines, function(line){
                return _.any(line.stations, function(stationAbbr){
                    return stationAbbr == lastStopAbbr;
                });
            });

            if (line) {
                $scope.line = line;
                $scope.lineChange(line);
            }
        }

        $scope.lineChange = function(line) {
            drawLineMap(line);
        };

        $scope.selectStation = function(stationAbbr) {
            $scope.station = stationAbbr;
            if (lineMap) {
                lineMap.plotStationLoc(_.find($scope.stations, function(station){
                    return station.abbr === stationAbbr;
                }));
            }
        };

        $scope.stationFilterFn = function(station) {
            if (!$scope.line) {
                return true;
            }
            return _.any(station.lines, function(lineName){
                return lineName === $scope.line.name;
            });
        };

        $scope.unusedStationsFn = function(station) {
            return !_.any($scope.train.stops, function(stop){
                return stop.station == station;
            });
        };

        $scope.dupTrain = function(train) {
            var modalInstance = $modal.open({
                templateUrl: 'views/trains/dupTrainDialog.html',
                controller: 'TrainDetailsDialogController',
                scope: $scope,
                size: 'lg'
            });

            modalInstance.result.then(function(res){
                $log.debug("Will duplicate train " + $scope.train.description + " " + res.trainCount + " time(s) offset by " + res.minutes + " minutes.");
                trainServices.dupTrain($scope.train.number, res.trainCount, res.minutes);
                $location.path("/trains");
            });
        };

        $scope.addStop = function(stopTime, station) {
            if (!validateStop(stopTime, station)) {
                return;
            }
            trainServices.addStop($scope.trainNumber, stopTime, station)
                .then(function(res){
                    return trainServices.getTrain($scope.trainNumber);
                })
                .then(function(res){
                    $scope.train = res.data;
                    $scope.afterAdd = true;
                    drawMap();
                    setBlackoutStops();
                    redrawBlackoutStops();
                });
        };

        $scope.deleteStop = function (trainNumber, stop) {
            trainServices.deleteStop(trainNumber, stop)
                .then(function (res) {
                    return trainServices.getTrain($scope.trainNumber);
                })
                .then(function (res) {
                    $scope.train = res.data;
                    drawMap();
                    setBlackoutStops();
                    redrawBlackoutStops();
                });
        };

        var validateStop = function(stopTime, stationAbbr) {
            var inCommon;
            var stops = $scope.train.stops;
            if (stops.length == 0) {
                return true;
            }

            //Are we stopping at this station already?
            var stationMatch = _.find(stops, function(stop){
                return stop.station === stationAbbr;
            });

            if (stationMatch) {
                alert("You are already stopping at station " + stationMatch.station);
                return false;
            }

            //Break the stops by time into three buckets -- prior stops(-1), later stops(1)
            //and equal stop times (0)

            var stopGroups = _.groupBy(stops, function(stop) {
                var trainStopTime = new Date(stop.time);
                if (trainStopTime.valueOf() === stopTime.valueOf()) {
                    return 0;
                }
                if (trainStopTime.valueOf() < stopTime.valueOf()) {
                    return -1;
                }
                return 1;
            });

            var timeMatch = stopGroups[0] ? stopGroups[0][0] : null;

            if (timeMatch) {
                alert("You are already stopping at " + timeMatch.station + " at " + stopTime);
                return false;
            }
            var priorStops = stopGroups[-1];

            if (priorStops) {
                var previousStop = priorStops[priorStops.length - 1];
                inCommon = helperServices.linesInCommon(previousStop.station, stationAbbr);
                if (inCommon.length == 0) {
                    alert("All stations stops must connect via common station lines.  No line in common with previous stop " + previousStop.station);
                    return false;
                }
            }

            var laterStops = stopGroups[1];

            if (laterStops) {
                var nextStop = laterStops[0];
                inCommon = helperServices.linesInCommon(nextStop.station, stationAbbr);
                if (inCommon.length == 0) {
                    alert("All stations stops must connect via common station lines.  No line in common with next stop " + nextStop.station);
                    return false;
                }
            }

            return true;
        }
    });