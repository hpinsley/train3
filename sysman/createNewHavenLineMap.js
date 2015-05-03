var fs = require('fs');
var _ = require('lodash');

var interestedCounties = ["Fairfield","New Haven"];

var geoFile1 = "../public/data/harlem-1.json";
var geoFile2 = "../public/data/connecticut-01.json";
var outputFile = "../public/data/newHaven-01.json";

fs.readFile(geoFile1, function(err, data) {
    if (err) throw err;
    var mapData = JSON.parse(data);
    fs.readFile(geoFile2, function(err,data){
        if (err) throw err;
        var additional = JSON.parse(data);
        var counties = _.filter(additional.features, function(feature) {
            return _.contains(interestedCounties, feature.properties.NAME);
        });

        counties.forEach(function(county){
            mapData.features.push(county);
        });

        fs.writeFile(outputFile, JSON.stringify(mapData), function(err){
            if (err)
                throw err;
            console.log("Wrote " + outputFile);
            process.exit(0);
        });
    });
});
