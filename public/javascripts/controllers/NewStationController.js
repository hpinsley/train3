angular.module("train")
    .controller("NewStationController", function ($scope, $location, trainServices) {

        $scope.addStation = function () {
            console.log("Adding station " + $scope.station.name);
            trainServices.addStation($scope.station)
                .then(function() {
                    $location.path("/stations");
                });
        }
    });