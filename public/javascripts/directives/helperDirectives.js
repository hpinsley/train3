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
                        target.focus();
                        var c = $.Event("change");
                        target.trigger(c);
                    }
                    else {
                        target.focus();
                    }

                    return;
                });
            }
        }
    })
    .directive("hpOpenList", function(){
        return {
            restrict: 'A',
            link: function(scope, iElement, iAttrs) {
                iElement.focus(function(){
                    console.log("got the focus at " + new Date());
                    setTimeout(function(){
                        var e = $.Event("keypress");
                        e.which = 40;   //40 keydown
                        e.keyCode = 40;
                        iElement.trigger(e);
                    }, 1000);

                });
            }
        }
    })
    .directive("hpTimeDisplay", function(){
        return {
            restrict: 'E',
            replace: true,
            template: '<div style="font-size: 24pt; width: 300px; margin-left: auto; margin-right: auto" id="timeDisplay"></div>',
            link: function(scope, iElement, iAttrs) {
                var watchItem = iAttrs.watchitem;
                if (!watchItem) {
                    throw {msg: "You must specify watchitem as the scope item to watch"};
                }
                scope.$watch(watchItem, function(newVal, oldVal){
                    if (newVal) {
                        var m = moment(newVal);
                        $("#timeDisplay").text(m.format("hh:mm A"));
                    }
                });
            }
        }
    })
    .directive("hpCopytime", function(){
        return {
            restrict: 'A',
            scope: {
                scopeItem: '=hpCopytime'
            },
            link: function(scope, iElement, iAttrs) {
                var targetName = iAttrs.target;
                if (!targetName) {
                    throw { msg: "You must specify the control target with targetName"}
                }
                var target = $("#" + targetName);
                iElement.click(function(){
                    var timeStr = iElement.text();
                    timeStr = "2014-01-01 " + timeStr;
                    var m = moment(timeStr);
                    var d = m.toDate();
                    scope.scopeItem = d;
                    scope.$apply();
                    target.focus();
                });
            }
        }
    });
