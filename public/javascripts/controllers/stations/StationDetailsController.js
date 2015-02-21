angular.module("train")
    .controller("StationDetailsController", function ($scope, $location, trainServices, $routeParams) {

        var trainNumber = $routeParams["trainNumber"];
        var stationAbbr = $routeParams["stationAbbr"];
        $scope.stationAbbr = stationAbbr;

        trainServices.getStation(stationAbbr)
            .success(function(data){
                $scope.station = data;
                $scope.station.lineString = $scope.station.lines.join(",");

                trainServices.getLines()
                    .success(function(data){
                        $scope.lines = data;
                        $scope.allLinesString = _.map($scope.lines, function(line){
                            return line.name;
                        }).join(",");
                    })
            });

        trainServices.getStationTrains(stationAbbr)
            .then(function(res){
                var trains = res.data;
                _.each(trains, function(train){
                    var stop = _.find(train.stops, function(stop){
                        return stop.station === stationAbbr;
                    })
                    train.stationStop = stop;
                });
                $scope.trains = trains;
            });

        $scope.updateStation = function() {
            if ($scope.station.lines.length == 0) {
                alert("You must specify at least one line for the station.");
                return;
            }
            trainServices.updateStation($scope.station)
                .success(function(data){
                    $location.path("/stations");
                })
                .error(function(err){
                    alert(err.msg || err);
                });
        };

        $scope.testClick = function() {
            alert("Parent scope click");
        }
    });