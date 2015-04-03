angular.module("train")
    .controller("LineDetailsController", function ($scope, $modal, $log, $location, trainServices, helperServices, $routeParams) {

        $log.debug("Start of LineDetailsController");

        $scope.lineName = $routeParams["lineName"];

        trainServices.getLine($scope.lineName)
            .success(function(line){
                $scope.line = line;
            });

        trainServices.getStations()
            .success(function(stations){
                $scope.stations = stations;
            });

        $scope.drawMap = function() {
            var map = new Maps.LineMap($scope.line, $scope.stations, "graph", 500, 500);
            map.plotMap();
        };

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