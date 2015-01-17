angular.module("train")
    .filter('stationName', function(cacheServices){

        var stationName = function(abbr) {
            var station = cacheServices.getStation(abbr);
            if (!station) {
                return "Unknown station " + abbr;
            }
            return station.name;
        }

        return stationName;
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