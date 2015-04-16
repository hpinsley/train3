angular.module("train").factory('trainServices', ["$http", "$log", "$q", function ($http,$log,$q) {

    var getStations = function() {
        return $http.get("/api/stations");
    };

    var addStation = function(station) {
        return $http.post("/api/stations", station);
    }

    var addPoi = function(poi) {
        return $http.post("/api/poi", poi);
    }

    var updateStation = function(station) {
        return $http.put("/api/stations/" + station.abbr, station);
    }

    var updateLine = function(line) {
        return $http.put("/api/lines/" + line.name, line);
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

    var getPois = function() {
        return $http.get("/api/poi");
    }

    var getLine = function(lineName) {
        return $http.get("/api/lines/" + lineName);
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
    };

    var addStationToLine = function(lineName, stationAbbr) {
        return $http.post("/api/lines/" + lineName + "/stations", {
            stationAbbr: stationAbbr
        });
    };

    var moveStationInLine = function(lineName, stationAbbr, direction) {
        return $http.post("/api/lines/" + lineName + "/stations/" + stationAbbr + "/move?direction=" + direction);
    };

    var dupTrain = function(trainNumber, numTimes, offsetMinutes) {
        $log.info("Duplicating train " + trainNumber + " " + numTimes + " time(s) with offset of " + offsetMinutes + " minutes.");
        return $http.post("/api/trains/duplicate",
            {
                trainNumber: trainNumber,
                numTimes: numTimes,
                offsetMinutes: offsetMinutes
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
    };
    var deleteTrains = function(trains) {
        var promises = [];
        _.each(trains, function(trainNumber){
            var url = "/api/trains/" + trainNumber;
            var p = $http.delete(url);
            promises.push(p);
        });
        var allP = $q.all(promises);
        return allP;
    };

    var deleteStationFromLine = function(lineName, stationAbbr) {
        return $http.delete("/api/lines/" + lineName + "/stations/" + stationAbbr);
    };

    var getMapFileList = function() {
        return $http.get("/api/lines/maps");
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
        getLine: getLine,
        updateStation: updateStation,
        dupTrain: dupTrain,
        deleteTrains: deleteTrains,
        addStationToLine: addStationToLine,
        moveStationInLine: moveStationInLine,
        deleteStationFromLine: deleteStationFromLine,
        updateLine: updateLine,
        getMapFileList: getMapFileList,
        addPoi: addPoi,
        getPois: getPois
    };
}]);