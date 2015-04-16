/// <reference path="../d.ts/lodash.d.ts" />
/// <reference path="../d.ts/node.d.ts" />
/// <reference path="../d.ts/geojson.d.ts" />
var fs = require('fs');
var _ = require("lodash");
var MapFile = (function () {
    function MapFile(mapfile, desiredFeatures) {
        this.mapfile = mapfile;
        this.desiredFeatures = desiredFeatures;
    }
    MapFile.prototype.load = function () {
        var buff = fs.readFileSync(this.mapfile, "utf-8");
        console.log(buff.length);
        this.data = JSON.parse(buff);
        this.features = this.data.features;
    };
    MapFile.prototype.listFeatures = function () {
        console.log("Features of " + this.mapfile);
        _.each(this.features, function (feature) {
            console.log(feature.properties.NAME);
        });
    };
    MapFile.prototype.getDesiredFeatures = function () {
        var _this = this;
        var result = _.filter(this.features, function (feature) {
            if (_this.desiredFeatures.length == 1 && _this.desiredFeatures[0] == "all") {
                return true;
            }
            return _.any(_this.desiredFeatures, function (df) {
                return feature.properties.NAME === df;
            });
        });
        return result;
    };
    MapFile.prototype.listDesiredFeatures = function () {
        console.log("Desired Features of " + this.mapfile);
        _.each(this.getDesiredFeatures(), function (feature) {
            console.log(feature.properties.NAME);
        });
    };
    return MapFile;
})();
exports.MapFile = MapFile;
var OutputMapfile = (function () {
    function OutputMapfile(mapfile, maps) {
        this.mapfile = mapfile;
        this.maps = maps;
    }
    OutputMapfile.prototype.writeFile = function () {
        var data = this.maps[0].data;
        data.features = [];
        _.each(this.maps, function (map) {
            _.each(map.getDesiredFeatures(), function (f) {
                data.features.push(f);
            });
        });
        fs.writeFileSync(this.mapfile, JSON.stringify(data));
        console.log("Wrote " + this.mapfile);
    };
    return OutputMapfile;
})();
exports.OutputMapfile = OutputMapfile;
function buildTwoMaps() {
    var westchester = new MapFile("../public/data/wcmun-2.json", ["all"]);
    westchester.load();
    westchester.listDesiredFeatures();
    var nystate = new MapFile("../public/data/nystate.json", ["New York", "Bronx", "Putnam"]);
    nystate.load();
    nystate.listDesiredFeatures();
    var outputMap = new OutputMapfile("../public/data/harlem-1.json", [westchester, nystate]);
    outputMap.writeFile();
}
function buildTwoStates() {
    var us = new MapFile("../public/data/us.json", ["New York", "Connecticut"]);
    us.load();
    us.listDesiredFeatures();
    var outputMap = new OutputMapfile("../public/data/region1.json", [us]);
    outputMap.writeFile();
}
//# sourceMappingURL=combineMapsSelectively.js.map