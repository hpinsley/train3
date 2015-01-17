angular.module("train")
    .controller("NewStationController", function ($scope, $location, trainServices, cacheServices) {

        trainServices.getLines()
            .success(function(res){
                $scope.lines = res;
                $scope.lineSelects = {};
                _.each($scope.lines, function(line){
                    $scope.lineSelects[line.name] = false;
                });

            });

        $scope.parseLineSelects = function() {
            lines = [];
            for (var prop in $scope.lineSelects) {
                if ($scope.lineSelects[prop]) {
                    lines.push(prop)
                }
            }
            return lines;
        };

        $scope.addStation = function () {
            var existingStation = cacheServices.getStation($scope.station.abbr);
            if (existingStation) {
                alert("The abbreviation " + $scope.station.abbr + " is already in use by " + existingStation.name);
                return;
            }

            var lines = $scope.parseLineSelects();
            if (lines.length == 0) {
                alert("You must specify at least one line.")
                return;
            }
            $scope.station.lines = lines;
            console.log("Adding station " + $scope.station.name);
            trainServices.addStation($scope.station)
                .then(function() {
                    cacheServices.refreshStations();
                    $location.path("/stations");
                });
        }
    });