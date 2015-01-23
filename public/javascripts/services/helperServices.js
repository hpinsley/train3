angular.module("train").factory('helperServices', ["cacheServices", function (cacheServices) {

    var linesInCommon = function(station1Abbr, station2Abbr) {
        var inCommon = [];
        var station1 = cacheServices.getStation(station1Abbr);
        var station2 = cacheServices.getStation(station2Abbr);
        if (!station1 || !station2) {
            return inCommon;
        }
        _.each(station1.lines, function(station1Line){
            _.each(station2.lines, function(station2Line){
                if (station1Line === station2Line) {
                    inCommon.push(station1Line);
                }
            });
        });
        return inCommon;
    };

    var elapsedMinutes = function(t1, t2) {
        var m1 = moment(t1);
        var m2 = moment(t2);
        return (m2 - m1) / 60000;
    };

    return {
        linesInCommon: linesInCommon,
        elapsedMinutes: elapsedMinutes
    };
}]);