angular.module("train").factory('trainServices', function () {

    var getStations = function() {
        return [
            { station: 'Katonah', abbr: 'kat' },
            { station: 'Mount Kisco', abbr: 'mtk'}
        ];
    };

    return {
        getStations: getStations
    };
});