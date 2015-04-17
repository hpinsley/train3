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
        }
    });