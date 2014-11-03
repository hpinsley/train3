angular.module("train").factory('trainServices', ["$http", function ($http) {

    var getStations = function() {
        return $http.get("/api/stations");
    };

    return {
        getStations: getStations
    };
}]);