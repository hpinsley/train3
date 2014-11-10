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

    var getTrains = function() {
        return $http.get("/api/trains");
    };

    var addTrain = function(train) {
        return $http.post("/api/trains", train);
    }

    return {
        getStations: getStations,
        addStation: addStation,
        deleteStation: deleteStation,
        getTrains: getTrains,
        addTrain: addTrain
    };
}]);