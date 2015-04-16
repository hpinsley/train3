/// <reference path="../../../../d.ts/lodash.d.ts" />
/// <reference path="../../../../d.ts/traindefs.d.ts" />
/// <reference path="../../../../d.ts/angular.d.ts" />
angular.module("train").controller("poiController", function ($scope, $modal, $log, $location, trainServices, helperServices, $routeParams, $q) {

    trainServices.getPois()
        .then(function(res){
            $scope.pois = res.data;
        }, function(err){
            console.error(err);
        });
});
