/// <reference path="../../../d.ts/d3.d.ts" />
/// <reference path="../../../d.ts/lodash.d.ts" />
/// <reference path="../../../d.ts/traindefs.d.ts" />
/// <reference path="../../../d.ts/angular.d.ts" />
var Maps;
(function (Maps) {
    var EarthRadiusMiles = 3959;
    var LineMap = (function () {
        function LineMap(trainServices, $q, lineOrTrain, allStations, elementId, w, h) {
            this.trainServices = trainServices;
            this.$q = $q;
            this.elementId = elementId;
            this.w = w;
            this.h = h;
            this.tooltipOffset = 30;
            this.cropFeaturesAtStations = false;
            this.transitionTime = 1000;
            this.blackoutStops = [];
            this.startDrag = [0, 0];
            this.palette0 = ['rgb(215,48,39)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,144)', 'rgb(255,255,191)', 'rgb(224,243,248)', 'rgb(171,217,233)', 'rgb(116,173,209)', 'rgb(69,117,180)'];
            this.palette1 = ['rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,144)', 'rgb(255,255,191)', 'rgb(224,243,248)', 'rgb(171,217,233)', 'rgb(116,173,209)'];
            var self = this;
            this.stationClickHandlers = [];
            this.mapId = _.uniqueId("map");
            if (lineOrTrain.hasOwnProperty("stops")) {
                this.train = lineOrTrain;
                this.getDataForTrain(allStations, self);
            }
            else {
                this.line = lineOrTrain;
                this.getDataForLine(allStations, self);
            }
            this.createTooltip();
        }
        LineMap.prototype.registerStationClick = function (stationClickHandler) {
            this.stationClickHandlers.push(stationClickHandler);
        };
        LineMap.prototype.registerLabelCallback = function (callback) {
            this.labelCallback = callback;
        };
        LineMap.prototype.setBlackoutStops = function (stationAbbrs) {
            this.blackoutStops = stationAbbrs;
        };
        LineMap.prototype.getNormalStopColor = function (station) {
            var self = this;
            var blackoutStop = _.any(self.blackoutStops, function (stationAbbr) {
                return station.abbr === stationAbbr;
            });
            return (blackoutStop) ? "black" : "green";
        };
        LineMap.prototype.getHoverStopColor = function (station) {
            return "yellow";
        };
        LineMap.prototype.getDataForLine = function (allStations, self) {
            self.map = self.line.map;
            var stationList = _.filter(allStations, function (station) {
                return self.line.stations.indexOf(station.abbr) >= 0;
            });
            self.stations = _.sortBy(stationList, function (station) {
                return self.line.stations.indexOf(station.abbr);
            });
        };
        LineMap.prototype.getDataForTrain = function (allStations, self) {
            //Get the sorted list of stations for this train and put it in this.stations
            var stationList = _.filter(allStations, function (station) {
                return _.any(self.train.stops, function (stop) {
                    return stop.station === station.abbr;
                });
            });
            var abbrList = _.map(self.train.stops, function (stop) {
                return stop.station;
            });
            self.stations = _.sortBy(stationList, function (station) {
                var result = abbrList.indexOf(station.abbr);
                return result;
            });
            //Figure out what maps to use.  We will go through all the stations and select any
            //of them that are on a single line.  We will use only those lines.  We use
            //a "set" to avoid duplicate lines
            var linesToUse = {};
            _.each(self.stations, function (station) {
                if (station.lines.length === 1) {
                    linesToUse[station.lines[0]] = true;
                }
            });
            self.lineNames = [];
            for (var prop in linesToUse) {
                if (linesToUse.hasOwnProperty(prop)) {
                    self.lineNames.push(prop);
                }
            }
        };
        LineMap.prototype.createTooltip = function () {
            this.tooltip = d3.select("#" + this.elementId).append("div").attr("id", "tooltip").style({
                opacity: 0,
                left: 0,
                top: 0
            });
        };
        LineMap.prototype.hideTooltip = function () {
            this.tooltip.transition().duration(500).style("opacity", 0);
            //this.tooltip.style("opacity", 0);
        };
        LineMap.prototype.erase = function () {
            this.hideTooltip();
            d3.select("svg#" + this.mapId).remove();
            this.svg = null;
        };
        LineMap.prototype.plotMap = function () {
            var self = this;
            var defer = this.$q.defer();
            if (this.map) {
                var geoFile = "data/" + this.map;
                d3.json(geoFile, function (json) {
                    this.plotMapData(json);
                    defer.resolve(true);
                }.bind(this));
            }
            else {
                self.getGeoFilesForLines(self.lineNames).then(function (geoFiles) {
                    return self.readGeoFiles(geoFiles);
                }).then(function (geoData) {
                    self.plotMapData(geoData);
                    defer.resolve(true);
                });
            }
            return defer.promise;
        };
        LineMap.prototype.getGeoFilesForLines = function (lines) {
            var self = this;
            var mapFiles = [];
            var fileCount = 0;
            var defer = this.$q.defer();
            lines.forEach(function (lineName) {
                self.trainServices.getLine(lineName).then(function (res) {
                    ++fileCount;
                    var line = res.data;
                    mapFiles.push(line.map);
                    if (fileCount === lines.length) {
                        defer.resolve(mapFiles);
                    }
                }, function (err) {
                    defer.reject(err);
                });
            });
            return defer.promise;
        };
        LineMap.prototype.readGeoFiles = function (geoFiles) {
            var defer = this.$q.defer();
            var fileCount = 0;
            var mapObj;
            geoFiles.forEach(function (geoFile) {
                var geoFilePath = "data/" + geoFile;
                d3.json(geoFilePath, function (json) {
                    ++fileCount;
                    if (fileCount === 1) {
                        mapObj = json;
                    }
                    else {
                        mapObj.features = mapObj.features.concat(json.features);
                    }
                    if (fileCount === geoFiles.length) {
                        defer.resolve(mapObj);
                    }
                });
            });
            return defer.promise;
        };
        LineMap.prototype.plotMapData = function (json) {
            var self = this;
            this.mapData = json; //save the list of features
            this.hideTooltip();
            if (this.svg) {
                this.svg.selectAll("*").remove();
            }
            var bounds = getBoundsOfFeatures(json.features, self.cropFeaturesAtStations ? self.stations : null);
            var minLng = bounds[0][0];
            var minLat = bounds[0][1];
            var maxLng = bounds[1][0];
            var maxLat = bounds[1][1];
            //var padding = 30;
            var padding = 0;
            this.lngScale = d3.scale.linear().domain([minLng, maxLng]).range([padding, this.w - padding]);
            this.latScale = d3.scale.linear().domain([minLat, maxLat]).range([this.h - padding, padding]);
            var customProjection = function (lngLat) {
                var lng = lngLat[0];
                var lat = lngLat[1];
                var result = [this.lngScale(lng), this.latScale(lat)];
                return result;
            }.bind(this);
            //Define path generator
            var path = d3.geo.path().projection(customProjection);
            //Create SVG element if we haven't already
            if (!this.svg) {
                this.svg = d3.select("#" + this.elementId).append("svg").attr({
                    id: self.mapId,
                    width: this.w,
                    height: this.h
                });
            }
            this.svg.selectAll("path").data(json.features).enter().append("path").attr("d", path).attr("fill", function (d, i) {
                return self.palette1[i % self.palette1.length];
            }).attr("stroke", "black");
            this.lineFun = d3.svg.line().x(function (station) {
                return this.lngScale(station.lnglat[0]);
            }).y(function (station) {
                return this.latScale(station.lnglat[1]);
            }).interpolate("linear");
            this.createDistanceLineBehavior();
        };
        LineMap.prototype.createDistanceLineBehavior = function () {
            var self = this;
            this.dragLine = this.svg.append("line").style({
                stroke: "black",
                "stroke-width": "2px"
            }).attr({
                id: "dragLine",
                class: "dragLine",
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 0
            });
            this.svg.on("mousedown", function () {
                var pos = d3.mouse(this); //this is the svg element
                console.log("mousedown", pos);
                self.dragging = true;
                self.startDrag = pos;
                self.dragLine.attr({
                    x1: pos[0],
                    y1: pos[1],
                    x2: pos[0],
                    y2: pos[1]
                });
                if (self.distanceLabel) {
                    self.distanceLabel.remove();
                }
            }).on("mousemove", function () {
                var pos = d3.mouse(this); //this is the svg element
                if (self.dragging) {
                    var x1 = self.startDrag[0];
                    var y1 = self.startDrag[1];
                    var x2 = pos[0];
                    var y2 = pos[1];
                    var lng1 = self.lngScale.invert(x1);
                    var lng2 = self.lngScale.invert(x2);
                    var lat1 = self.latScale.invert(y1);
                    var lat2 = self.latScale.invert(y2);
                    //console.log("Drawing line from ", x1, y1, x2, y2);
                    //console.log("Drawing line from ", lng1, lat1, lng2, lat2);
                    //console.log("Distance:", dist);
                    self.dragLine.attr({
                        x1: x1,
                        y1: y1,
                        x2: x2,
                        y2: y2
                    });
                }
            }).on("mouseup", function () {
                console.log("Mouse up");
                self.dragging = false;
                var pos = d3.mouse(this); //this is the svg element
                var x1 = self.startDrag[0];
                var y1 = self.startDrag[1];
                var x2 = pos[0];
                var y2 = pos[1];
                if (x1 === x2 && y1 == y2) {
                    return; //Nothing drawn
                }
                var lng1 = self.lngScale.invert(x1);
                var lng2 = self.lngScale.invert(x2);
                var lat1 = self.latScale.invert(y1);
                var lat2 = self.latScale.invert(y2);
                var dist = d3.geo.distance([lng1, lat1], [lng2, lat2]) * EarthRadiusMiles;
                //alert("Distance: " + dist + " miles.");
                var xMid = (x1 + x2) / 2;
                var yMid = (y1 + y2) / 2;
                var radians;
                if (x1 === x2) {
                    radians = Math.PI / 2;
                }
                else {
                    var slope = (y1 - y2) / (x2 - x1); //Remember that y values increase going down
                    radians = Math.atan(slope);
                }
                var degrees = 180 * (radians / Math.PI);
                var rotation = -1 * degrees;
                var transformText = "translate(" + xMid + "," + yMid + ")rotate(" + rotation + ")translate(0,-5)";
                console.log("Text transform:", transformText);
                self.distanceLabel = self.svg.append("text").text(dist.toFixed(2) + " miles").style("text-anchor", "middle").attr({
                    class: "distanceLabel",
                    transform: transformText
                });
            });
        };
        LineMap.prototype.removeFeatureLabels = function () {
            var featureGroup = this.svg.select("g#featureLabels");
            featureGroup.remove();
        };
        LineMap.prototype.drawFeatureLabels = function () {
            var self = this;
            var features = this.mapData.features;
            self.removeFeatureLabels();
            var featureGroup = self.svg.append("g").attr({ id: "featureLabels" });
            for (var i = 0; i < features.length; ++i) {
                self.drawFeatureLabel(features[i], featureGroup);
            }
        };
        LineMap.prototype.removePointsOfInterest = function () {
            var poiGroup = this.svg.select("g#pois");
            poiGroup.remove();
        };
        LineMap.prototype.XFromPoi = function (poi) {
            return this.LngToX(poi.lnglat[0]);
        };
        LineMap.prototype.YFromPoi = function (poi) {
            return this.LatToY(poi.lnglat[1]);
        };
        LineMap.prototype.mapPointsOfInterest = function (pois) {
            var self = this;
            self.removePointsOfInterest();
            var poiGroup = self.svg.append("g").attr({ id: "pois" });
            for (var i = 0; i < pois.length; ++i) {
                self.drawPointOfInterest(pois[i], poiGroup);
            }
        };
        LineMap.prototype.drawPointOfInterest = function (poi, poiGroup) {
            var self = this;
            var circle = poiGroup.append("circle").datum(poi).attr({
                cx: 5,
                cy: 5,
                r: 1,
                fill: "blue"
            }).on("mouseenter", function (poi) {
                var cx = self.XFromPoi(poi);
                var cy = self.YFromPoi(poi);
                self.tooltip.transition().duration(1000).style("opacity", 1).style("left", cx).style("top", cy + self.tooltipOffset);
                self.tooltip.html(self.buildPoiTooltip(poi));
            }).on("mouseleave", function (poi) {
                self.hideTooltip();
            });
            circle.transition().duration(2000).attr({
                cx: self.XFromPoi.bind(self),
                cy: self.YFromPoi.bind(self),
                r: 10
            }).each("end", function () {
                poiGroup.append("text").attr({
                    x: self.XFromPoi(poi) + 12,
                    y: self.YFromPoi(poi),
                    "text-anchor": "left",
                    //fill: "black",
                    class: "poi-text"
                }).text(poi.name);
            });
        };
        LineMap.prototype.drawFeatureLabel = function (feature, featureGroup) {
            var featureName = feature.properties.NAME;
            var center;
            console.log("Adding label for feature " + featureName);
            var bounds = d3.geo.bounds(feature);
            center = [(bounds[1][0] + bounds[0][0]) / 2, (bounds[1][1] + bounds[0][1]) / 2];
            //center = d3.geo.centroid(feature);
            var x = this.lngScale(center[0]);
            var y = this.latScale(center[1]);
            featureGroup.append("text").attr({
                x: x,
                y: y,
                "text-anchor": "middle",
                fill: "black"
            }).text(featureName).style({
                "font-size": "7pt",
                "font-weight": "bold"
            });
        };
        LineMap.prototype.LngToX = function (lng) {
            return this.lngScale(lng);
        };
        LineMap.prototype.LatToY = function (lat) {
            return this.latScale(lat);
        };
        LineMap.prototype.XFromStation = function (station) {
            return this.lngScale(station.lnglat[0]);
        };
        LineMap.prototype.YFromStation = function (station) {
            return this.latScale(station.lnglat[1]);
        };
        LineMap.prototype.updateStopColors = function () {
            var self = this;
            var lineGroup = this.svg.select("g.linePath");
            lineGroup.selectAll("circle.linePathCircle").attr({
                fill: self.getNormalStopColor.bind(self) //station will be passed
            });
        };
        LineMap.prototype.removeStationLabels = function () {
            this.svg.select("g#stationLabelGroup").remove();
        };
        LineMap.prototype.showStationLabels = function () {
            var self = this;
            this.removeStationLabels();
            var stationLabelGroup = this.svg.append("g").attr("id", "stationLabelGroup");
            stationLabelGroup.selectAll("text").data(this.stations).enter().append("text").text(function (station) {
                if (self.labelCallback) {
                    return self.labelCallback(station);
                }
                return station.abbr;
            }).attr({
                x: function (station) {
                    return self.XFromStation(station) + 10;
                },
                y: function (station) {
                    return self.YFromStation(station) + 15;
                }
            });
        };
        LineMap.prototype.showLinePath = function () {
            var lineGroup = this.svg.append("g").attr("class", "linePath");
            var self = this;
            lineGroup.append("path").attr({
                d: this.lineFun(this.stations),
                "stroke": "black",
                "stroke-width": 3,
                "fill": "none"
            });
            lineGroup.selectAll("circle.linePathCircle").data(this.stations).enter().append("circle").attr({
                class: "linePathCircle",
                cx: function (station) {
                    return self.lngScale(station.lnglat[0]);
                },
                cy: function (station) {
                    return self.latScale(station.lnglat[1]);
                },
                r: self.h < 300 ? 3 : 5,
                fill: self.getNormalStopColor.bind(self)
            }).on("mouseenter", function (station) {
                var circle = d3.select(this);
                circle.transition().duration(self.transitionTime).attr({
                    fill: self.getHoverStopColor.bind(self)
                });
                self.plotStationLoc(station, false);
            }).on("mouseleave", function (station) {
                var circle = d3.select(this);
                circle.transition().duration(self.transitionTime).attr({
                    fill: self.getNormalStopColor.bind(self)
                });
                self.hideTooltip();
            }).on("click", function (station) {
                for (var i = 0; i < self.stationClickHandlers.length; ++i) {
                    self.stationClickHandlers[i].selectStation(station);
                }
            });
            //.append("title").text(function(station) { return station.name; })
        };
        LineMap.prototype.removeLinePath = function () {
            if (!this.svg) {
                return;
            }
            this.svg.select("g.linePath").remove();
        };
        LineMap.prototype.plotStationLoc = function (station, showStopPoint) {
            if (showStopPoint === void 0) { showStopPoint = true; }
            var lng = station.lnglat[0];
            var lat = station.lnglat[1];
            var cx = this.lngScale(lng);
            var cy = this.latScale(lat);
            this.svg.selectAll("circle.stopPoint").remove();
            if (showStopPoint) {
                this.svg.append("circle").attr({
                    class: "stopPoint",
                    cx: cx,
                    cy: cy,
                    r: 5,
                    fill: "red"
                });
            }
            this.tooltip.transition().duration(1000).style("opacity", 1).style("left", cx).style("top", cy + this.tooltipOffset);
            this.tooltip.html(this.buildStationTooltip(station));
        };
        LineMap.prototype.buildStationTooltip = function (station) {
            var str = "<a href='/#/stations/" + station.abbr + "'>" + station.name + "</a><br/>";
            if (station.lines.length == 1) {
                str = str + station.lines[0] + " line";
            }
            else {
                str = str + "on line(s): " + station.lines.join(", ");
            }
            if (station.lnglat) {
                str = str + "<br/>[" + station.lnglat[0].toFixed(2) + "," + station.lnglat[1].toFixed(2) + "]";
            }
            return str;
        };
        LineMap.prototype.buildPoiTooltip = function (poi) {
            var str = "<a href='/#/poi/" + poi.number + "'>" + poi.name + "</a><br/>";
            str += poi.description;
            if (poi.lnglat) {
                str = str + "<br/>[" + poi.lnglat[0].toFixed(2) + "," + poi.lnglat[1].toFixed(2) + "]";
            }
            return str;
        };
        return LineMap;
    })();
    Maps.LineMap = LineMap;
    function getBoundsOfFeatures(features, stations) {
        var gbounds;
        var includeFeature;
        for (var i = 0; i < features.length; ++i) {
            var feature = features[i];
            var bounds = d3.geo.bounds(feature);
            var minLng = bounds[0][0];
            var minLat = bounds[0][1];
            var maxLng = bounds[1][0];
            var maxLat = bounds[1][1];
            if (stations) {
                //Skip the feature if none of the stations are within
                includeFeature = _.any(stations, function (station) {
                    var lng = station.lnglat[0];
                    var lat = station.lnglat[1];
                    return (lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat);
                });
                if (includeFeature) {
                    console.log("Include: " + includeFeature + " Feature: " + feature.properties.NAME + " from " + "[" + minLng + "," + minLat + "] - [" + maxLng + "," + maxLat + "]");
                }
            }
            else {
                includeFeature = true;
            }
            if (includeFeature) {
                if (!gbounds) {
                    gbounds = [
                        [minLng, minLat],
                        [maxLng, maxLat]
                    ];
                }
                else {
                    if (minLng < gbounds[0][0])
                        gbounds[0][0] = minLng;
                    if (minLat < gbounds[0][1])
                        gbounds[0][1] = minLat;
                    if (maxLng > gbounds[1][0])
                        gbounds[1][0] = maxLng;
                    if (maxLat > gbounds[1][1])
                        gbounds[1][1] = maxLat;
                }
            }
        }
        return gbounds;
    }
    Maps.getBoundsOfFeatures = getBoundsOfFeatures;
})(Maps || (Maps = {}));
//# sourceMappingURL=maps.js.map