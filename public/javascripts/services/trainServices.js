angular.module("train").factory('trainServices', ["$http", function ($http) {

    var getStations = function() {
        return $http.get("/api/stations");
    };

    var addStation = function(station) {
        return $http.post("/api/stations", station);
    }

    var updateStation = function(station) {
        return $http.put("/api/stations/" + station.abbr, station);
    }

    var deleteStation = function(station) {
        return $http.delete("/api/stations/" + station.abbr);
    }

    var getStationTrains = function(stationAbbr) {
        return $http.get("/api/stations/" + stationAbbr + "/trains");
    }
    var getStation = function(abbr) {
        return $http.get("/api/stations/" + abbr);
    }

    var getTrains = function() {
        return $http.get("/api/trains");
    };

    var getLines = function() {
        return $http.get("/api/lines");
    };

    var addTrain = function() {
        return $http.post("/api/trains");
    }

    var getTrain = function(trainNumber) {
        return $http.get("/api/trains/" + trainNumber);
    }

    var addStop = function(trainNumber, stopTime, station) {
        return $http.post("/api/trains/" + trainNumber + "/stops", {
            stopTime: stopTime,
            station: station
        });
    }

    var deleteStop = function(trainNumber, stop) {
        var url = "/api/trains/" + trainNumber + "/stops";
        var data =  {stop: stop}
        return $http({
            method: "DELETE",
            url: url,
            data: data,
            headers: {
                "Content-Type" : "application/json"
            }
        });
    }
    return {
        getStation: getStation,
        getStations: getStations,
        addStation: addStation,
        deleteStation: deleteStation,
        getTrains: getTrains,
        addTrain: addTrain,
        getTrain: getTrain,
        addStop: addStop,
        deleteStop: deleteStop,
        getStationTrains: getStationTrains,
        getLines: getLines,
        updateStation: updateStation
    };
}]);