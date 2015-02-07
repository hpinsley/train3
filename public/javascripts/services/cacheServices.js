angular.module("train").factory('cacheServices', ["trainServices", function (trainServices) {

    var cache = {
        stations :{

        }
    };

    var init = function() {
        refreshStations();
    };

    var getStation = function(stationAbbr) {
        return cache.stations[stationAbbr];
    };

    var getStations = function() {
        var list = [];
        for (var prop in cache.stations) {
            list.push(cache.stations[prop]);
        }
        return list;
    };

    var refreshStations = function() {
        console.log("Refreshing station cache.");
        trainServices.getStations()
            .success(function(stations) {
                cache.stations = {};
                console.log("Caching " + stations.length + " stations.");
                _.each(stations, function(station) {
                    cache.stations[station.abbr] = station;
                });
            });
    };

    return {
        init: init,
        refreshStations: refreshStations,
        getStation: getStation,
        getStations: getStations
    };
}]);