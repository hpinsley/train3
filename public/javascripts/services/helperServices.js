angular.module("train").factory('helperServices', ["cacheServices", "trainServices", function (cacheServices, trainServices) {

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

    //Returns a promise
    var destinationStations = function(startStation) {
        return trainServices.getTrains()
            .then(function(res){
                var trains = res.data;
                var stations = cacheServices.getStations();
                var selectedStations = _.filter(stations, function(station){
                    console.log("Filtering station " + station.abbr);
                    return _.any(trains, function(train){
                        var startIndex = _.findIndex(train.stops, function(stop){
                            return stop.station == startStation;
                        });
                        var endIndex = _.findIndex(train.stops, function(stop){
                            return stop.station == station.abbr;
                        });
                        return startIndex >=0 && endIndex >=0 && endIndex > startIndex;
                    });
                });
                return selectedStations;
            });
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
        d2: d2,
        destinationStations: destinationStations
    };
}]);