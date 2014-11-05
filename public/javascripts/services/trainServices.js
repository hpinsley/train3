angular.module("train").factory('trainServices', ["$http", function ($http) {

    var getStations = function() {
        return $http.get("/api/stations");
    };

    var addStation = function(station) {
        return $http.post("/api/stations", station);
    }

    return {
        getStations: getStations,
        addStation: addStation
    };
}]);