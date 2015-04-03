angular.module("train").factory('graphServices', ["trainServices", function (trainServices) {

    function constructLineMap(line, stations, elementId, w, h) {
        var map = new Maps.LineMap(line, stations, elementId, w, h);
        return map;
    }
    return {
        constructLineMap: constructLineMap
    };
}]);
