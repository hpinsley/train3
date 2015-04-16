/// <reference path="../../../../d.ts/lodash.d.ts" />
/// <reference path="../../../../d.ts/traindefs.d.ts" />
/// <reference path="../../../../d.ts/angular.d.ts" />
angular.module("train").controller("newPointOfInterestController", function ($scope, $modal, $log, $location, trainServices, helperServices, $routeParams, $q) {
    $scope.poi = {};
    $scope.addPoi = function () {
        $scope.poi.lnglat = _.map($scope.latlng.split(",").reverse(), function (coord) {
            return parseFloat(coord);
        });
        trainServices.addPoi($scope.poi).then(function (res) {
            console.log(res);
            $scope.poi = res.data[0];
            delete $scope.poi._id;
        }, function (err) {
            console.error(err);
        });
    };
});
//# sourceMappingURL=newPointOfInterestController.js.map