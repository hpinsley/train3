angular.module("train")
    .controller("LinesController", function($scope, trainServices) {
        $scope.title = "Lines";

        trainServices.getStations()
            .then(function(res) {
                $scope.stations = res.data;
            })
            .then(function() {
                trainServices.getLines()
                    .success(function (lines) {
                        $scope.lines = lines;
                    });

            })
    });
