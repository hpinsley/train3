angular.module("train")
    .controller("LinesController", function($scope, trainServices) {
        $scope.title = "Lines";

        trainServices.getLines()
            .success(function (lines) {
                $scope.lines = lines;
            });
    });
