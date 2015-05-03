var fs = require('fs');
var mongoskin = require('mongoskin');
var _ = require('lodash');

var db = mongoskin.db('mongodb://@localhost:27017/trains', {safe:true})
var coll = db.collection("stations");

var stationFile = "/Users/howard.pinsley/new-stations.txt";

fs.readFile(stationFile, 'utf8', function(err, data){
    if (err) {
        console.log(err);
        process.exit(1);
    }

    var lines = data.split("\n");
    lines.forEach(function(line){
        if (!line) {
            return;
        }
        var parts = line.split(",");
        var station = {};
        station.abbr = parts[0];
        station.name = parts[1];
        station.lnglat = [parseFloat(parts[3]),parseFloat(parts[2])];
        station.lines = ["New Haven"];
        station.image = "HowardPinsley.jpg";

        console.log(station);
        coll.save(station, function(err, res){
            if (err) {
                console.log(err);
                process.exit(1);
            }
            console.log(station.abbr, res);
        });
    });
});




