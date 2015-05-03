/// <reference path="../../../d.ts/d3.d.ts" />
/// <reference path="../../../d.ts/lodash.d.ts" />
/// <reference path="../../../d.ts/traindefs.d.ts" />
/// <reference path="../../../d.ts/angular.d.ts" />
/// <reference path="maps.ts" />

module Maps {

    export class MapEditor {

        private mapId:string;
        private lngScale:D3.Scale.LinearScale;
        private latScale:D3.Scale.LinearScale;
        private svg:D3.Selection;       //Wish I could declare this as D3.Svg.Svg.  But it doesn't expose an append method?
        private mapData;
        private palette1:string[] = ['rgb(244,109,67)','rgb(253,174,97)','rgb(254,224,144)','rgb(255,255,191)','rgb(224,243,248)','rgb(171,217,233)','rgb(116,173,209)'];


        constructor(public elementId:string, public w:number, public h:number) {
            this.mapId = _.uniqueId("mapEditor");
            this.createSvgElement();
        }

        createSvgElement() {
            this.svg = d3.select("#" + this.elementId).append("svg").attr({
                id: this.mapId,
                width: this.w,
                height: this.h
            });
        }

        public loadGeoFile(geoFile:string):void {

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
        }

        public refreshMap() : void {
            this.plotMapData();
        }

        public getMapData() {
            return this.mapData;
        }

        private plotMapData() {

            var self = this;
            this.svg.selectAll("*").remove();

            var bounds = getBoundsOfFeatures(this.mapData.features, null);

            var minLng = bounds[0][0];
            var minLat = bounds[0][1];
            var maxLng = bounds[1][0];
            var maxLat = bounds[1][1];

            //var padding = 30;
            var padding = 0;

            this.lngScale = d3.scale
                .linear()
                .domain([minLng, maxLng])
                .range([padding, this.w - padding]);

            this.latScale = d3.scale
                .linear()
                .domain([minLat, maxLat])
                .range([this.h - padding, padding]);

            var customProjection:D3.Geo.Projection = <D3.Geo.Projection> function (lngLat) {
                var lng = lngLat[0];
                var lat = lngLat[1];
                var result = [this.lngScale(lng), this.latScale(lat)];
                return result;
            }.bind(this);

            //Define path generator
            var path = d3.geo.path()
                .projection(customProjection);

            this.svg.selectAll("path")
                .data(self.mapData.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("fill", function(d,i) {
                    return self.palette1[i % self.palette1.length];
                })
                .attr("stroke", "black")
                .on("mousedown", function (feature) {
                    var featureSegment = d3.select(this);
                    featureSegment.remove();
                    self.removeFeature(feature);
                })

        }

        private removeFeature(feature) : void {
            this.mapData.features = _.filter(this.mapData.features, function(f){
                return f !== feature;
            });
        }
    }
}
