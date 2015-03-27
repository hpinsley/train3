var fs = require('fs');
var _ = require('lodash');

var interestedCounties = ["Queens","Kings","New York","Nassau","Suffolk"];

var geoFile = "../public/data/nystate.json";
var outputFile = "../public/data/longIsland.json";

fs.readFile(geoFile, 'utf8', function(err, data){
    if (err)
        throw err;

    var geoData = JSON.parse(data);
    geoData.features = _.filter(geoData.features, function(feature){
        return _.any(interestedCounties, function(county){
            return feature.properties.NAME === county;
        });
    });

    _.each(geoData.features, function (feature) {
        var name = feature.properties.NAME;
        console.log("Found feature " + name);
    });

    var outputJson = JSON.stringify(geoData);
    fs.writeFile(outputFile, outputJson, function(err){
        if (err)
            throw err;
        console.log("Wrote " + outputFile);
        process.exit(0);
    });
});




