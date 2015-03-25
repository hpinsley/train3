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

    var translateZuluString = function(zString) {
        var m = moment(zString);
        return m.toDate();
    }

    var elapsedMinutes = function(t1, t2) {
        var m1 = moment(t1);
        var m2 = moment(t2);
        return (m2 - m1) / 60000;
    };

    var formatTime = function(time) {
        var m = moment(time);
        return m.format("hh:mm A");
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
    };

    var getBoundsOfFeatures = function(features) {
        for (var i = 0; i < features.length; ++i) {
            var bounds = d3.geo.bounds(features[i]);
            var gbounds;

            if (i == 0) {
                gbounds = [
                            [bounds[0][0],bounds[0][1]],
                            [bounds[1][0],bounds[1][1]]
                          ];
            }
            else {
                var minLng = bounds[0][0];
                var minLat = bounds[0][1];
                var maxLng = bounds[1][0];
                var maxLat = bounds[1][1];

                if (minLng < gbounds[0][0])
                    gbounds[0][0] = minLng;
                if (minLat < gbounds[0][1])
                    gbounds[0][1] = minLat;
                if (maxLng > gbounds[1][0])
                    gbounds[1][0] = maxLng;
                if (maxLat > gbounds[1][1])
                    gbounds[1][1] = maxLat;
            }
        }
        return gbounds;
    }

    return {
        linesInCommon: linesInCommon,
        elapsedMinutes: elapsedMinutes,
        elapsedSecondsUntil: elapsedSecondsUntil,
        d2: d2,
        destinationStations: destinationStations,
        translateZuluString: translateZuluString,
        formatTime: formatTime,
        getBoundsOfFeatures: getBoundsOfFeatures
    };
}]);