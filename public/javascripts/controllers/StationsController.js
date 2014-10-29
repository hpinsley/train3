angular.module("train")
    .controller("StationsController", function($scope){
        $scope.title = "This is from the stations controller";

        $scope.items = ["apple", "banana", "orange"]
    });