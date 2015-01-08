angular.module("train")
    .controller("NewStationController", function ($scope, $location, trainServices) {

        trainServices.getLines()
            .success(function(res){
                $scope.lines = res;
            });
        $scope.addStation = function () {
            console.log("Adding station " + $scope.station.name);
            trainServices.addStation($scope.station)
                .then(function() {
                    $location.path("/stations");
                });
        }
    });