angular.module("train")
    .controller("TrainDetailsController", function ($scope, $location, trainServices, $routeParams) {

        var trainNumber = $routeParams["trainNumber"];

        $scope.trainNumber = trainNumber;
    });