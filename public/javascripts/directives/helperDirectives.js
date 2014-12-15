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
                var target = iAttrs.target;
                var increment = parseInt(iAttrs.increment);
                var targetCtl = $("#" + target);

                iElement.click(function(){

                    var timeVal = targetCtl.val();
                    if (!timeVal) {
                        targetCtl.val("09:00");
                    }
                    else {
                        var parts = timeVal.split(":");
                        var hour = parseInt(parts[0]);
                        var minutes = parseInt(parts[1]);
                        minutes += increment;
                        if (minutes >= 60) {
                            minutes -= 60;
                            hour += 1;
                            if (hour == 24) {
                                hour = 0;
                            }
                        }
                        var hourStr = hour.toString();
                        if (hourStr.length === 1) {
                            hourStr = "0" + hourStr;
                        }

                        var minStr = minutes.toString();
                        if (minStr.length === 1) {
                            minStr = "0" + minStr;
                        }
                        var newVal = hourStr + ":" + minStr;
                        targetCtl.val(newVal);
                        $scope.apply();
                        targetCtl.focus();
                    }
                });
            }
        }
    });
