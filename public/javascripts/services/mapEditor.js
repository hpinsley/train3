/// <reference path="../../../d.ts/d3.d.ts" />
/// <reference path="../../../d.ts/lodash.d.ts" />
/// <reference path="../../../d.ts/traindefs.d.ts" />
/// <reference path="../../../d.ts/angular.d.ts" />
/// <reference path="maps.ts" />
var Maps;
(function (Maps) {
    var MapEditor = (function () {
        function MapEditor(elementId, w, h) {
            this.elementId = elementId;
            this.w = w;
            this.h = h;
            this.palette1 = ['rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,144)', 'rgb(255,255,191)', 'rgb(224,243,248)', 'rgb(171,217,233)', 'rgb(116,173,209)'];
            this.mapId = _.uniqueId("mapEditor");
            this.createSvgElement();
        }
        MapEditor.prototype.createSvgElement = function () {
            this.svg = d3.select("#" + this.elementId).append("svg").attr({
                id: this.mapId,
                width: this.w,
                height: this.h
            });
        };
        MapEditor.prototype.loadGeoFile = function (geoFile) {
            var self = this;
            var geoFilePath = "data/" + geoFile;
            d3.json(geoFilePath, function (newMap) {
                if (!self.mapData) {
                    self.mapData = newMap;
                }
                else {
                    self.mapData.features = self.mapData.features.concat(newMap.features);
                }
                self.plotMapData();
            });
        };
        MapEditor.prototype.refreshMap = function () {
            this.plotMapData();
        };
        MapEditor.prototype.getMapData = function () {
            return this.mapData;
        };
        MapEditor.prototype.plotMapData = function () {
            var self = this;
            this.svg.selectAll("*").remove();
            var bounds = Maps.getBoundsOfFeatures(this.mapData.features, null);
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
            this.svg.selectAll("path").data(self.mapData.features).enter().append("path").attr("d", path).attr("fill", function (d, i) {
                return self.palette1[i % self.palette1.length];
            }).attr("stroke", "black").on("mousedown", function (feature) {
                var featureSegment = d3.select(this);
                featureSegment.remove();
                self.removeFeature(feature);
            });
        };
        MapEditor.prototype.removeFeature = function (feature) {
            this.mapData.features = _.filter(this.mapData.features, function (f) {
                return f !== feature;
            });
        };
        return MapEditor;
    })();
    Maps.MapEditor = MapEditor;
})(Maps || (Maps = {}));
//# sourceMappingURL=mapEditor.js.map