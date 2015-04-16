/// <reference path="../../../../d.ts/lodash.d.ts" />
/// <reference path="../../../../d.ts/traindefs.d.ts" />
/// <reference path="../../../../d.ts/angular.d.ts" />
angular.module("train").controller("newPointOfInterestController", function ($scope, $modal, $log, $location, trainServices, helperServices, $routeParams, $q) {

    $scope.poi = {};

    $scope.addPoi = function() {
        $scope.poi.lnglat = $scope.latlng.split(",").reverse().join(",");
        console.log($scope.poi);
    }
});
