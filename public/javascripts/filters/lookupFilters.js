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
    })
    .filter("showStationLines", function(cacheServices){
        return function(stationAbbr) {
            var station = cacheServices.getStation(stationAbbr);
            if (station) {
                return station.lines.join(",");
            }
            return "";
        }
    })
    .filter("commaSeparate", function(){
        return function(arr) {
            return arr.join(",");
        };
    })
    .filter("minutesToElapsed", function(){
        return function(minutes) {
            var hours = Math.floor(minutes / 60);
            var mins = minutes - (hours * 60);
            var elapsed = hours.toString() + ":" + mins.toString();
            var i = elapsed.indexOf(":");
            if ((elapsed.length - i) == 2) {
                elapsed = elapsed.replace(":", ":0");
            }
            return elapsed;
        }
    });