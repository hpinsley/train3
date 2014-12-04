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

module.exports = {
    stopCompare: stopCompare
}
