angular.module("train")
    .controller("TripController", function ($scope, $q, $location, trainServices, helperServices, $routeParams) {

        $scope.trainNumber = $routeParams["trainNumber"];
        $scope.startStation = $routeParams["start"];
        $scope.endStation = $routeParams["end"];
        $scope.showStop = "names";

        var map;
        var mapWidth = 600;
        var mapHeight = 600;

        function drawMap() {
            if (map) {
                map.erase();
            }
            map = new Maps.LineMap(trainServices, $q, $scope.train, $scope.stations, "tripMap", mapWidth, mapHeight);
            map.tooltipOffset = 40;
            map.cropFeaturesAtStations = true;
            map.labelFeatures = true;

            return map.plotMap().then(function(){
                map.showLinePath();
                $scope.showStopChanged();
            });
        }

        function showStopTime(station) {
            var index = stopIndex(station.abbr);
            var stop = $scope.train.stops[index];

            return helperServices.formatTime(stop.time);
        }

        function showStopStationName(station) {
            var index = stopIndex(station.abbr);
            var stop = $scope.train.stops[index];

            return station.name;
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
                $scope.stations = _.sortBy(filteredStations, function(station){
                    return stopIndex(station.abbr);
                });
                drawMap();

                $scope.distanceInMiles = trainServices.distanceInMilesBetweenStations(_.first($scope.stations), _.last($scope.stations)).toFixed(2);
            });

        trainServices.getPois()
            .then(function(res){
                $scope.pois = res.data;
            });


        $scope.stopFilter = function(stop) {
            var index = _.findIndex($scope.train.stops, function(tripStop) {
                return tripStop.station == stop.station;
            });

            return index >= $scope.startIndex && index <= $scope.endIndex;
        };

        $scope.showPoiClick = function() {
            if ($scope.showPoi) {
                map.mapPointsOfInterest($scope.pois);
            }
            else {
                map.removePointsOfInterest();
            }
        }

        $scope.showMapFeaturesClick = function() {
            if ($scope.showMapFeatures) {
                map.drawFeatureLabels();
            }
            else {
                map.removeFeatureLabels();
            }
        }

        $scope.showStopChanged = function() {
            if ($scope.showStop === "times") {
                map.registerLabelCallback(showStopTime);
                map.showStationLabels();
            }
            else {
                map.registerLabelCallback(showStopStationName);
                map.showStationLabels();
            }
        }

    });