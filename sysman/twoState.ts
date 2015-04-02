/// <reference path="../d.ts/lodash.d.ts" />
/// <reference path="../d.ts/node.d.ts" />
/// <reference path="../d.ts/geojson.d.ts" />

import maps = require("combineMapsSelectively");

var us = new maps.MapFile("../public/data/us.json", ["New York","Connecticut"]);
us.load();
us.listDesiredFeatures();

var outputMap = new maps.OutputMapfile("../public/data/region1.json", [us]);
outputMap.writeFile();
