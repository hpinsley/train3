/// <reference path="../../../../d.ts/lodash.d.ts" />
/// <reference path="../../../../d.ts/traindefs.d.ts" />
/// <reference path="../../../../d.ts/angular.d.ts" />
angular.module("train").controller("poiDetailsController", function ($scope, $modal, $log, $location, trainServices, helperServices, $routeParams, $q) {

    var number = $routeParams["number"];

    trainServices.getPoi(number)
        .then(function(res){
            $scope.poi = res.data;
            $scope.latlng = $scope.poi.lnglat.reverse().join(",");
        }, function(err){
            console.error(err);
        });

    $scope.updatePoi = function() {
        $scope.poi.lnglat = _.map($scope.latlng.split(",").reverse(), function(coord:string) {
            return parseFloat(coord);
        });

        trainServices.updatePoi($scope.poi).then(function (res) {
            console.log(res);
            $location.path("/poi");
        }, function (err) {
            console.error(err);
        });

    };
});
