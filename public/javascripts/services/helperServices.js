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

    var elapsedSecondsUntil = function(t) {
        var now = new moment();
        now.year(1970);
        now.dayOfYear(1);
        var then = new moment(t);
        var diff = then - now;
        var seconds = diff / 1000;
        if (seconds < 0) {
            seconds += 24 * 3600;
        }
        return seconds;
    };

    var d2 = function(i) {
        var s = i.toString();
        return (s.length == 1) ? "0" + s : s;
    }

    return {
        linesInCommon: linesInCommon,
        elapsedMinutes: elapsedMinutes,
        elapsedSecondsUntil: elapsedSecondsUntil,
        d2: d2
    };
}]);