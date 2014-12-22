angular.module("train")
    .filter('stationName', function(trainServices){

        var stationCache = {};

        trainServices.getStations()
            .then(function(res){
                var stations = res.data;
                stations.forEach(function(station){
                    stationCache[station.abbr] = station;
                });
            });

        var stationName = function(abbr) {
            var station = stationCache[abbr];
            if (!station) {
                return "Unknown station " + abbr;
            }
            return station.name;
        }

        var stationNameFilter = function(abbr) {
            return stationName(abbr);
        };

        return stationNameFilter;
    })
    .filter("timeDisplay", function() {
        return function(time) {
            if (!time) {
                return "Not Specified";
            }
            var m = moment(time);
            if (m.isValid()) {
                return m.format("hh:mm A");
            }
            return "Invalid time";
        }
    });