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
    .directive("hpSecondsElapsed", ["helperServices","secondsToElapsedFilter","$interval", function(helperServices, secondsToElapsed, $interval){
        return {
            restrict: 'A',
            link: function(scope, iElement, iAttrs) {
                var expr = iAttrs.expr;
                var stopTime = scope.$eval(expr);
                var updateTime = function() {
                    console.log("Update time fired");
                    var seconds = helperServices.elapsedSecondsUntil(stopTime);
                    iElement.text(secondsToElapsed(seconds));
                    if (seconds < 3600) {
                        iElement.css("color", "red");
                    }
                }
                var timer = $interval(updateTime, 1000);
                iElement.on("$destroy", function(){
                    console.log("Cancelling timer");
                    $interval.cancel(timer);
                });
            }
        };
    }])
    .directive("hpTimeUp", function() {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template: '<button class="btn" ng-transclude></button>',
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
                    timeStr = "1970-01-01 " + timeStr;
                    var m = moment(timeStr);
                    var d = m.toDate();
                    scope.scopeItem = d;
                    scope.$apply();
                    target.focus();
                });
            }
        }
    })
    .directive("hpCheckboxList", function(){
        return {
            restrict: 'E',
            link: function(scope, iElement, iAttrs) {
                var objectArray = [];       //Set to the scope item array
                var items = [];             //Set to the list of all values corresponding to the checkboxes

                //Handler used when a checkbox is checked/unchecked
                var updateFunc = function(ev) {
                    var target = ev.target;
                    var checked = target.checked;
                    var id = target.id;
                    var i = id.lastIndexOf("_");
                    if (i > 0) {
                        var indexStr = id.slice(i+1);
                        var index = parseInt(indexStr);
                        var value = items[index];
                        if (checked) {
                            objectArray.push(value);
                            objectArray.sort();
                        }
                        else {
                            var index = objectArray.indexOf(value);
                            if (index >= 0) {
                                objectArray.splice(index, 1);
                            }
                        }
                        scope.$apply();
                    }

                };

                if (!iElement[0].id) {
                    throw { msg: "The element containing the hpCheckboxList directive must have an id."};
                }
                var prefix = iElement[0].id + "_hpcbl_";
                var listSource = iAttrs.listsource; //It gets lowercased for some reason
                var listSourceProperty = iAttrs.listsourceproperty;
                var objectSource = iAttrs.objectsource;
                var objectProperty = iAttrs.objectproperty;
                if (!listSource || !objectSource || !objectProperty) {
                    throw new { msg: "You must specify listSource, objectSource, and objectProperty"}
                }

                scope.$watch(listSource, function(listItems){

                    if (listSourceProperty) {   //Array of objects, transform with the property
                        items = _.map(listItems, function(item) { return item[listSourceProperty]; });
                    }
                    else {
                        items = listItems;  //Array contains direct values
                    }

                    var div = $("<div>");

                    if (scope[objectSource]) {
                        objectArray = scope[objectSource][objectProperty];
                    }
                    else {
                        objectArray = [];
                    }

                    _.each(items, function(item, i){
                        var line = item;
                        var input = $("<input type='checkbox' id='" + prefix + i + "'>" + line + "</input>");
                        if (_.any(objectArray, function(v) { return v == line})) {
                            input[0].checked = true;
                        }
                        input.change(updateFunc);
                        div.append(input);
                        div.append("<br/>");
                    });
                    iElement.append(div);
                });
            }
        };
    })
    .directive("hpStationSelect", function(cacheServices, helperServices) {
        return {
            restrict: 'E',
            link: function(scope, iElement, iAttrs) {
                var startStation = scope.$eval("station");
                var select = $("<select>");
                var p = helperServices.destinationStations(startStation.abbr);
                p.then(function(stations){
                    _.each(stations, function(station){
                        var option = $("<option val='" + station.abbr + "'>" + station.name + "</option>");
                        select.append(option);
                    });
                    iElement.append(select);
                })
            }
        }
    });

