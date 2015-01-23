angular.module("train")
    .controller("StationsController", function($scope, $location, $route, trainServices, cacheServices){

        var setLineLists = function(stations) {
            _.each(stations, function(station){
                station.lineList = station.lines.join(", ");
            });
        };

        var addTrainCountToStations = function() {
            _.each($scope.stations, function(station){
                var trains = _.filter($scope.trains, function(train){
                    return _.any(train.stops, function(stop){
                        return stop.station == station.abbr;
                    });
                });
                station.trainCount = trains.length;
            });
        };

        trainServices.getStations()
            .success(function(stations){
                $scope.stations = stations;
                setLineLists($scope.stations);
                console.log("Set stations");
            })
            .then(trainServices.getTrains)
            .then(function(res){
                console.log("Setting trains");
                $scope.trains = res.data;
                addTrainCountToStations();
            })

        trainServices.getLines()
            .success(function(res){
                $scope.lines = res;
            });


        $scope.selectedLineFn = function(station) {
            if ($scope.selectedLine == null) {
                return true;
            }

            //console.log('Station ' + station.abbr + " has " + station.lines.length + " lines.");

            return _.any(station.lines, function(line) {
                return line === $scope.selectedLine}
            );
        };

        $scope.deleteStation = function(station) {
            if (confirm("Do you really want to delete " + station.name + "?")) {
                trainServices.deleteStation(station)
                    .success(function(result){
                        cacheServices.refreshStations();
                        $route.reload();
                    })
                    .error(function(e){
                        alert(e.msg || e);
                    });
            }
        }
    });