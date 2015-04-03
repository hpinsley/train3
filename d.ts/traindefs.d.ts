declare module TrainDefs {

    export interface Station {
        abbr: string;
        name: string;
        image: string;
        lnglat: number[];
        lines: string[];
    }

    export interface Line {
        name: string;
        stations: string[];
        map: string;
    }
}
