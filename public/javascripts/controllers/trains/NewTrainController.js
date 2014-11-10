angular.module("train")
    .controller("NewTrainController", function ($scope, $location, trainServices) {

        $scope.addTrain = function () {
            console.log("Adding train " + $scope.train.number);
            trainServices.addTrain($scope.train)
                .then(function() {
                    $location.path("/trains");
                });
        }
    });