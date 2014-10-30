angular.module("train").factory('trainServices', ["$q", function ($q) {

    var getStations = function() {
        var def = $q.defer();

        def.resolve([
            { station: 'Katonah', abbr: 'kat' },
            { station: 'Mount Kisco', abbr: 'mtk'}
        ]);
        return def.promise;
    };

    return {
        getStations: getStations
    };
}]);