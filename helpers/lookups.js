var db;
var stationsCollection;
var stationCache = {};

var init = function(mdb) {
    db = mdb;
    stationsCollection = db.collection("stations");
    refreshStationCache();
};

var refreshStationCache = function() {
    stationCache = {};
    stationsCollection.find({}).toArray(function(e, stations) {
        if (e) {
            throw e;
        }
        stations.forEach(function(station){
            stationCache[station.abbr] = station;
        });
    })
};

var stationName = function(abbr) {
    var station = stationCache[abbr];
    return (station == null) ? "" : station.name;
}

module.exports = {
    init: init,
    stationName: stationName,
    refreshStationCache: refreshStationCache
};