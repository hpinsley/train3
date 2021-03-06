angular.module("train")
    .controller("LineDetailsController", function ($scope, $modal, $log, $location, trainServices, helperServices, $routeParams, $q, $timeout) {

        $log.debug("Start of LineDetailsController");
        var map;
        var mapWidth = 870;
        var mapHeight = 620;

        $scope.lineName = $routeParams["lineName"];

        trainServices.getMapFileList()
            .then(function(res){
                $scope.mapFiles = res.data;
            })

        var linePromise = trainServices.getLine($scope.lineName)
            .then(function(res){
                $scope.line = res.data;
            });

        var stationPromise = trainServices.getStations()
            .then(function(res){
                $scope.stations = res.data;
            });

        var poiPromise = trainServices.getPois()
            .then(function(res){
                $scope.pois = res.data;
            });

        $q.all([linePromise,stationPromise,poiPromise])
            .then(function(){
                map = new Maps.LineMap(trainServices, $q, $scope.line, $scope.stations, "graph", mapWidth, mapHeight);
                map.tooltipOffset = 10;
                map.plotMap()
                    .then(function(){
                        map.showLinePath();
                        $scope.showLine = true;
                    });
            });

        $scope.showPoiClicked = function() {
            if ($scope.showPoi) {
                map.mapPointsOfInterest($scope.pois);
            }
            else {
                map.removePointsOfInterest();
            }
        }
        $scope.showStationLabelsClicked = function() {
            if (!map) {
                return;
            }

            $scope.showStationLabels ? map.showStationLabels() : map.removeStationLabels();
        }

        $scope.showLineClicked = function() {
            if (!map) {
                return;
            }

            if ($scope.showLine) {
                map.showLinePath();
            }
            else {
                map.removeLinePath();
            }
        }

        $scope.showMapFeaturesClicked = function() {
            if ($scope.showMapFeatures) {
                map.drawFeatureLabels();
            }
            else {
                map.removeFeatureLabels();
            }
        }

        $scope.stationChange = function(stationAbbr) {
            $scope.$apply(function(){                   //Needed if we come from the mouse enter event
                $scope.selectedStation = stationAbbr;   //That will change the radio button if we use the hover directive to invoke this method
            });
            var station = _.find($scope.stations, function(station){
                return station.abbr === stationAbbr;
            });
            map.plotStationLoc(station);
        }

        $scope.lineStationFilter = function(station) {
            //Make sure the station is on the line
            var matchingStation = _.find($scope.stations, function(stn){
                return stn.abbr == station.abbr;
            });

            if (!matchingStation) {
                return false;
            }

            var matchingLine = _.find(matchingStation.lines, function(lineName){
                return lineName == $scope.line.name;
            });

            if (!matchingLine) {
                return false;
            }

            //Now make sure we haven't already added the station to the line

            matchingStation = _.find($scope.line.stations, function(stationAbbr){
                return stationAbbr == station.abbr;
            });

            return !matchingStation;
        };



        $scope.updateLine = function(line) {
            trainServices.updateLine(line)
                .then(function(res) {
                    alert("Updated " + res.data.updateResult + " lines.");
                }, function(err){
                    alert(err.data || err);
                });
        };

        $scope.addStation = function() {
            if (!$scope.selectedStationAbbr) {
                return;
            }
            trainServices.addStationToLine($scope.lineName, $scope.selectedStationAbbr)
                .success(function(line) {
                    $scope.line = line;
                });
        };

        $scope.moveStationInLine = function(lineName, stationAbbr, direction) {

            trainServices.moveStationInLine(lineName, stationAbbr, direction)
                .success(function(line){
                    $scope.line = line;
                });
        };

        $scope.deleteStation = function(lineName, stationAbbr) {
            trainServices.deleteStationFromLine(lineName, stationAbbr)
                .success(function(line){
                    $scope.line = line;
                });
        };
    });