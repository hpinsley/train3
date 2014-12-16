angular.module('train')
    .directive('hpFocus', function () {
        return {
            restrict:    'A',
            link: function(scope, iElement, iAttrs) {
                var watchItem = iAttrs.hpFocus;

                scope.$watch(watchItem, function(newVal, oldVal){
                    if (newVal === true) {
                        setTimeout(function(){
                            iElement[0].focus();
                            scope[watchItem] = false;
                        }, 0);
                    }
                });

            }
        };
    })
    .directive("hpTimeUp", function() {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template: '<button ng-transclude></button>',
            link: function(scope, iElement, iAttrs) {
                var targetName = iAttrs.target;
                if (!targetName) {
                    throw { msg: "You must specify the target attribute."}
                }
                var target = $("#" + targetName);
                if (target.length === 0) {
                    throw { msg: "The target with id " + targetName + " cannot be found."}
                }

                var modelName = target.attr("ng-model");

                var increment = parseInt(iAttrs.increment);

                iElement.click(function(){
                    //scope.$apply();
                    var stopTime = scope[modelName];
                    if (stopTime) {
                        var ms = stopTime.valueOf();
                        ms = ms + increment * 60 * 1000;
                        scope[modelName] = new Date(ms);
                    }
                    target.focus();
                    return;
                });
            }
        }
    });
