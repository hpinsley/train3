/// <reference path="../../../d.ts/d3.d.ts" />

module Maps {

    export class LineMap {
        private svg;
        private lngScale : Scale.LinearScale;
        private latScale;

        //private latScale:d3.scale;

        constructor(public line:any, public stations:any[], public elementId:string, public w:number, public h:number) {

        }

        sayHi() {
            alert("hi");
        }

        plotMap() {
            var geoFile = "data/" + this.line.map;

            d3.json(geoFile, function(json) {

                var bounds = getBoundsOfFeatures(json.features);
                var minLng = bounds[0][0];
                var minLat = bounds[0][1];
                var maxLng = bounds[1][0];
                var maxLat = bounds[1][1];

                var padding = 30;

                var lngScale = d3.scale
                    .linear()
                    .domain([minLng, maxLng])
                    .range([padding,this.w-padding]);

                this.latScale = d3.scale
                    .linear()
                    .domain([minLat, maxLat])
                    .range([this.h-padding,padding]);



            });
        }
    }

    export function getBoundsOfFeatures(features) {
        for (var i = 0; i < features.length; ++i) {
            var bounds = d3.geo.bounds(features[i]);
            var gbounds;

            if (i == 0) {
                gbounds = [
                    [bounds[0][0],bounds[0][1]],
                    [bounds[1][0],bounds[1][1]]
                ];
            }
            else {
                var minLng = bounds[0][0];
                var minLat = bounds[0][1];
                var maxLng = bounds[1][0];
                var maxLat = bounds[1][1];

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
        return gbounds;
    }

}
