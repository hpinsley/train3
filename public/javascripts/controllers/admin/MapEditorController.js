/// <reference path="../../../../d.ts/lodash.d.ts" />
/// <reference path="../../../../d.ts/traindefs.d.ts" />
/// <reference path="../../../../d.ts/d3.d.ts" />
/// <reference path="../../../../d.ts/angular.d.ts" />
/// <reference path="../../services/mapEditor.ts" />
angular.module("train").controller("MapEditorController", function ($scope, $q, trainServices, helperServices) {
    var mapEditor = new Maps.MapEditor("map", 800, 800);
    trainServices.getMapFileList().then(function (res) {
        $scope.mapFiles = res.data;
    });
    $scope.loadGeoFile = function () {
        mapEditor.loadGeoFile($scope.selectedMapFile);
    };
    $scope.refreshMap = function () {
        mapEditor.refreshMap();
    };
    $scope.saveMap = function () {
        if (confirm("Do you want to save the map data to " + $scope.outputFile)) {
            console.log("Saving map data to %s.", $scope.outputFile);
            var mapData = mapEditor.getMapData();
            trainServices.saveGeoFile(mapData, $scope.outputFile).then(function (res) {
                console.log("Success:", res);
            }, function (err) {
                console.log("Error:", err);
            });
        }
    };
});
//# sourceMappingURL=MapEditorController.js.map