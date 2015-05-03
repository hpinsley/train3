var fs = require('fs');
var _ = require('lodash');

var deleteCounties = ["New Haven", "Putnam"];

var geoFile = "../public/data/newHaven-01.json";
var outputFile = "../public/data/NH-Spur1-01.json";

fs.readFile(geoFile, function(err, data) {
    if (err) throw err;
    var mapData = JSON.parse(data);
    mapData.features = _.filter(mapData.features, function(feature){
        return !_.contains(deleteCounties, feature.properties.NAME);
    });

    fs.writeFile(outputFile, JSON.stringify(mapData), function(err){
        if (err)
            throw err;
        console.log("Wrote " + outputFile);
        process.exit(0);
    });
});
