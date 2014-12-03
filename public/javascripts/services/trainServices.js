angular.module("train").factory('trainServices', ["$http", function ($http) {

    var getStations = function() {
        return $http.get("/api/stations");
    };

    var addStation = function(station) {
        return $http.post("/api/stations", station);
    }

    var deleteStation = function(station) {
        return $http.delete("/api/stations/" + station._id);
    }

    var getStation = function(abbr) {
        return $http.get("/api/stations/" + abbr);
    }

    var getTrains = function() {
        return $http.get("/api/trains");
    };

    var addTrain = function(train) {
        return $http.post("/api/trains", train);
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

    return {
        getStation: getStation,
        getStations: getStations,
        addStation: addStation,
        deleteStation: deleteStation,
        getTrains: getTrains,
        addTrain: addTrain,
        getTrain: getTrain,
        addStop: addStop
    };
}]);