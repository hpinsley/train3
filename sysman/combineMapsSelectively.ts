/// <reference path="../d.ts/lodash.d.ts" />
/// <reference path="../d.ts/node.d.ts" />
/// <reference path="../d.ts/geojson.d.ts" />

import fs = require('fs');
import _ = require("lodash");

class MapFile {

    data: any;
    features: GeoJSON.Feature[];

    constructor(public mapfile:string, public desiredFeatures: string[]) {

    }

    load() {
        var buff = fs.readFileSync(this.mapfile, "utf-8");
        console.log(buff.length);
        this.data = JSON.parse(buff);
        this.features = this.data.features;
    }

    listFeatures() {
        console.log("Features of " + this.mapfile);
        _.each(this.features, (feature: GeoJSON.Feature) => {
            console.log(feature.properties.NAME);
        });
    }

    getDesiredFeatures() : GeoJSON.Feature[] {

        var result = _.filter(this.features, (feature) => {
            if (this.desiredFeatures.length == 1 && this.desiredFeatures[0] == "all") {
                return true;
            }
            return _.any(this.desiredFeatures, (df) => {
                return feature.properties.NAME === df;
            });
        });

        return result;
    }

    listDesiredFeatures() {
        console.log("Desired Features of " + this.mapfile);
        _.each(this.getDesiredFeatures(), (feature: GeoJSON.Feature) => {
            console.log(feature.properties.NAME);
        });
    }
}

class OutputMapfile {

    constructor(public mapfile: string, public maps:MapFile[]) {

    }

    writeFile() {
        var data = this.maps[0].data;
        data.features = [];
        _.each(this.maps, (map) => {
            _.each(map.getDesiredFeatures(), (f) => {
                data.features.push(f);
            });
        });

        fs.writeFileSync(this.mapfile, JSON.stringify(data));
        console.log("Wrote " + this.mapfile);
    }
}

var westchester = new MapFile("../public/data/wcmun-2.json", ["all"]);
westchester.load();
westchester.listDesiredFeatures();

var nystate = new MapFile("../public/data/nystate.json", ["New York","Bronx","Putnam"]);
nystate.load();
nystate.listDesiredFeatures();

var outputMap = new OutputMapfile("../public/data/harlem-1.json", [westchester, nystate]);
outputMap.writeFile();
