var fs = require('fs');
var d3 = require('d3');
var mongoskin = require('mongoskin');
var _ = require('lodash');

var db = mongoskin.db('mongodb://@localhost:27017/trains', {safe:true})
var coll = db.collection("stations");

var geoFile = "../public/data/wcmun-2.json";

fs.readFile(geoFile, 'utf8', function(err, data){
    if (err) {
        console.log(err);
        process.exit(1);
    }
    var geoData = JSON.parse(data);
    _.each(geoData.features, function (feature) {
        var name = feature.properties.NAME;
        console.log("Found feature " + name);
        var centroid = d3.geo.centroid(feature);
        console.log("The center of the feature is at [" + centroid[0] + "," + centroid[1] + ")");

        coll.findOne({name:name}, function(e, station) {
            if (e) {
                console.log(e);
            }
            else {
                if (station) {
                    console.log("Found match for " + station.name);
                    station.lnglat = centroid;
                    coll.save(station, function(e, writeData){
                        if (e) {
                            console.log("Write failed for " + station.name);
                        }
                        else {
                            console.log("Write succeeded for " + station.name);
                        }
                    });
                }
            }
        });
    });

    //process.exit(0);
});




