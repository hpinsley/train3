angular.module("train")
    .filter('stationName', function(cacheServices){

        var stationName = function(abbr) {
            return cacheServices.stationName(abbr);
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
    .filter("minutesToElapsed", function(helperServices){
        return function(minutes) {
            var hours = Math.floor(minutes / 60);
            var mins = minutes - (hours * 60);
            var elapsed = hours.toString() + ":" + helperServices.d2(mins);
            return elapsed;
        }
    })
    .filter("secondsToElapsed", function(helperServices){
        return function(seconds) {
            var hours = Math.floor(seconds / 3600);
            var remaining = seconds - 3600 * hours;
            var minutes = Math.floor(remaining / 60);
            var secs = Math.floor(remaining - minutes * 60);

            var elapsed =   helperServices.d2(hours) + ":" +
                            helperServices.d2(minutes) + ":" +
                            helperServices.d2(secs);
            return elapsed;
        }
    });