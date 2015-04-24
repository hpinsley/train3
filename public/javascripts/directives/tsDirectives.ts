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
    .directive("hpLineSelect", function(){
        return {
            restrict: 'E',
            templateUrl: 'views/common/hpLineSelect.html',
            scope: {
                lines: '='
            },
            line: function(scope, iElement, iAttrs) {

            },
            controller: function($scope) {
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
                    }
                    else {
                        $scope.expanded = true;
                    }
                }
            }
        }
});