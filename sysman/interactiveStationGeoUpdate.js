var fs = require('fs');
var d3 = require('d3');
var mongoskin = require('mongoskin');
var _ = require('lodash');
var prompt = require('prompt');

var db = mongoskin.db('mongodb://@localhost:27017/trains', {safe:true})
var coll = db.collection("stations");

var properties = [
    {
        name: 'Station'
    },
    {
        name: 'latlng'
    }
];

prompt.start();

prompt.get(properties, function (err, result) {
    if (err) { return onErr(err); }


    console.log('Station: ' + result.Station);
    console.log('latlng: ' + result.latlng);

    var latlng = result.latlng.split(",");
    var lnglat = [parseFloat(latlng[1]),parseFloat(latlng[0])];
    console.log(lnglat);

    coll.update({name: result.Station}, {$set: {lnglat:lnglat}}, function(err) {
        if (err)
            return onErr(err);
        console.log("Station " + result.Station + " updated to " + lnglat);
    });
    return 0;
});


function onErr(err) {
    console.log(err);
    return 1;
}

