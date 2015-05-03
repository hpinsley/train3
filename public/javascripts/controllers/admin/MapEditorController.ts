/// <reference path="../../../../d.ts/lodash.d.ts" />
/// <reference path="../../../../d.ts/traindefs.d.ts" />
/// <reference path="../../../../d.ts/d3.d.ts" />
/// <reference path="../../../../d.ts/angular.d.ts" />
/// <reference path="../../services/mapEditor.ts" />

interface MapEditorControllerScope extends ng.IScope {
    mapFiles:string[];
    selectedMapFile:string;
    loadGeoFile():void;
    refreshMap():void;
    saveMap():void;
    outputFile:string;
}

angular.module("train")
    .controller("MapEditorController", function ($scope:MapEditorControllerScope, $q:ng.IQService, trainServices, helperServices) {

        var mapEditor = new Maps.MapEditor("map", 800, 800);

        trainServices.getMapFileList()
            .then(function(res){
                $scope.mapFiles = res.data;
            });

        $scope.loadGeoFile = function() : void {
            mapEditor.loadGeoFile($scope.selectedMapFile);
        }

        $scope.refreshMap = function() : void {
            mapEditor.refreshMap();
        }

        $scope.saveMap = function() : void {
            if (confirm("Do you want to save the map data to " + $scope.outputFile)) {
                console.log("Saving map data to %s.", $scope.outputFile);
                var mapData = mapEditor.getMapData();
                trainServices.saveGeoFile(mapData, $scope.outputFile)
                    .then(function(res) {
                        console.log("Success:", res);
                    }, function(err){
                        console.log("Error:", err);
                    });
            }
        }
    });



