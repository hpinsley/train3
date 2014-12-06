var moment = require('moment');
var lookups = require("./lookups");

/**
 * Created by howard.pinsley on 12/3/14.
 */
var stopCompare = function(stop1, stop2) {
    if (stop1.time === stop2.time) {
        return 0;
    }
    if (stop1.time < stop2.time) {
        return -1;
    }
    return 1;
};

var adjustTrainSummary = function(train) {
    if (!train.stops || train.stops.length == 0) {
        return;
    }
    train.originStation = train.stops[0].station;
    train.terminalStation = train.stops[train.stops.length-1].station;

    var startTime = new Date(train.stops[0].time);
    var t = moment(startTime);
    train.description = t.format("hh:mm A") + " to " + lookups.stationName(train.terminalStation);
};

module.exports = {
    stopCompare: stopCompare,
    adjustTrainSummary: adjustTrainSummary
}
