/// <reference path="../../../d.ts/lodash.d.ts" />
/// <reference path="../../../d.ts/traindefs.d.ts" />
/// <reference path="../../../d.ts/angular.d.ts" />

angular.module('train')
    .directive('hpHoverInvoke', function () {
    return {
        restrict: 'A',
        scope: {
            val: '=',
            invoke: '&'
        },
        link: function(scope, iElement, iAttrs) {
            iElement.mouseenter(function(){
                scope["invoke"]({stationAbbr: scope["val"]});
            });

        }
    };
})
.directive("hpPoiDetails", function(){
        return {
            restrict: 'E',
            templateUrl: 'views/poi/poiFields.html'
        };
})
    .directive("hpReportPosition", function(){
        return {
            restrict: 'A',
            scope: {
                notePosition: '&'
            },
            link: function(scope, iElement: JQuery, iAttrs) {
                iElement.mouseover(function(event:JQueryMouseEventObject){
                    scope.notePosition({
                        id: iElement[0].id,
                        eventObj:event
                    });
                });
            }
        };
    })
    .directive("hpLineSelect", function(){
        return {
            restrict: 'E',
            templateUrl: 'views/common/hpLineSelect.html',
            scope: {
                //remember that callers have to use - casing -- not camel casing in their attributes
                lines: '=',
                includeAllSelection: '@',
                lineSelected: '&'
            },
            link: function(scope, iElement, iAttrs) {

            },
            controller: function($scope) {

                function setLineList() {
                    //We don't want to use the callers array of lines because
                    //we may stick an (all) selection at the front
                    if ($scope.lines && !$scope.lineList) {
                        $scope.lineList = _.clone($scope.lines);
                        if ($scope.includeAllSelection === "true") {
                            var allLines:TrainDefs.Line = {
                                name: '(all)',
                                map: null,
                                stations:[]
                            };
                            $scope.lineList.unshift(allLines);
                        }
                    }
                }

                $scope.$watch("lines", setLineList);

                $scope.selectedIndex = 0;
                $scope.expanded = false;
                $scope.stations = [];           //We don't want to pass the map any stations

                $scope.getClass = function() {
                    return $scope.expanded ? "expanded" : "";
                }

                $scope.lineClick = function(line, index) {
                    if ($scope.expanded) {
                        $scope.selectedIndex = index;
                        $scope.expanded = false;

                        $scope.lineSelected({line: line});  //Tell the directive user
                    }
                    else {
                        $scope.expanded = true;
                    }
                }
            }
        }
});