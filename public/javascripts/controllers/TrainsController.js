angular.module("train")
    .controller("TrainsController", function($scope){
        $scope.title = "This is from trains controller";

        $scope.items = ["apple", "banana", "orange"]
    });