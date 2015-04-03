angular.module("train")
    .controller("StationMapController", function($scope, trainServices, helperServices, cacheServices, $timeout, $q) {

        var map;

        $scope.title = "Station Map";

        trainServices.getLines()
            .then(function(res){
                $scope.lines = res.data;
            })
            .then(function(){
                return trainServices.getStations()
                    .success(function(stations) {
                        $scope.stations = stations;
                        $scope.selectedLine = $scope.lines[0];
                        $scope.lineChange($scope.selectedLine);
                    });
            });

        $scope.stationInLineFn = function(station) {
            return _.any(station.lines, function(line){
                return line === $scope.selectedLine.name;
            });
        }

        $scope.stationChange = function(station) {
            if (!station || !station.lnglat) {
                return;
            }
            plotStationLoc(station);
        };

        $scope.changeShowLinePath = function() {
            $scope.showLineCheck ? showLinePath() : removeLinePath();
        };

        $scope.stationOrder = function(station) {
            return _.findIndex($scope.selectedLine.stations, function(lineStation){
                return station.abbr === lineStation;
            });
        }

        $scope.lineChange = function(line) {
            if (map) {
                map.erase();
            }
            map = new Maps.LineMap($q, $scope.selectedLine, $scope.stations, "svgContainer", 900, 600);
            map.tooltipOffset = 8;
            map.plotMap()
                .then(function(){
                    map.showLinePath();
                    $scope.showLineCheck = true;
                });
        };


        var showLinePath = function() {
            if (!map) {
                return;
            }
            map.showLinePath();
        };

        var removeLinePath = function() {
            if (!map) {
                return;
            }
            map.removeLinePath();
        };

        var plotSelectedLineMap = function() {
            plotMap($scope.selectedLine.map);
        }


        var plotStationLoc = function(station) {

            if (!map) {
                return;
            }
            map.plotStationLoc(station);

        }

    });
