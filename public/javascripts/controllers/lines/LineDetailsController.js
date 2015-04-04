angular.module("train")
    .controller("LineDetailsController", function ($scope, $modal, $log, $location, trainServices, helperServices, $routeParams, $q, $timeout) {

        $log.debug("Start of LineDetailsController");
        var map;

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

        $q.all([linePromise,stationPromise])
            .then(function(){
                map = new Maps.LineMap(trainServices, $q, $scope.line, $scope.stations, "graph", 900, 600);
                map.plotMap()
                    .then(function(){
                        map.showLinePath();
                        $scope.showLine = true;
                    });
            });

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

        $scope.stationChange = function(stationAbbr) {
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