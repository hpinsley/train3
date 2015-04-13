angular.module("train")
    .controller("TripController", function ($scope, $q, $location, trainServices, helperServices, $routeParams) {

        $scope.trainNumber = $routeParams["trainNumber"];
        $scope.startStation = $routeParams["start"];
        $scope.endStation = $routeParams["end"];

        var map;
        var mapWidth = 500;
        var mapHeight = 500;

        function drawMap() {
            if (map) {
                map.erase();
            }
            map = new Maps.LineMap(trainServices, $q, $scope.train, $scope.stations, "tripMap", mapWidth, mapHeight);
            map.tooltipOffset = 20;

            return map.plotMap().then(function(){
                map.showLinePath();
            });
        }

        function stopIndex(stop) {
            return _.findIndex($scope.train.stops, function(trainStop){
                return trainStop.station == stop;
            });
        }

        trainServices.getTrain($scope.trainNumber)
            .then(function(res){
                $scope.train = res.data;
                $scope.startIndex = stopIndex($scope.startStation);
                $scope.endIndex = stopIndex($scope.endStation);

                //Set the elapsed time for each stop
                if ($scope.startIndex >= 0) {
                    var startTime = $scope.train.stops[$scope.startIndex].time;
                    _.each($scope.train.stops, function(stop){
                        stop.elapsedMinutes = helperServices.elapsedMinutes(startTime, stop.time);
                    });
                }
            })
            .then(trainServices.getStations)
            .then(function(res){
                var allStations = res.data;
                var filteredStations = _.filter(allStations, function(station){
                    var index = stopIndex(station.abbr);
                    return (index >= $scope.startIndex && index <= $scope.endIndex);
                });
                $scope.stations = _.sortBy(filteredStations, function(s1,s2){
                    return stopIndex(s1.abbr) - stopIndex(s2.abbr);
                });
                drawMap();
            });

        $scope.stopFilter = function(stop) {
            var index = _.findIndex($scope.train.stops, function(tripStop) {
                return tripStop.station == stop.station;
            });

            return index >= $scope.startIndex && index <= $scope.endIndex;
        };


    });