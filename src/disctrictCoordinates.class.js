const fs = require('fs');
const EARTH_RADIUS = 6372795;

class DisctrictCoordinates {
    constructor() {
        this.origDistrictArray = [];
        this.poligon = { longitude: [], latitude: [] };
        this.minMaxCoordinates = {
            longitude: {
                min: null,
                max: null
            },
            latitude: {
                min: null,
                max: null
            },
        }

    }

    calculateTheDistance(ln, lt, ln1, lt1) {
        // перевести координаты в радианы
        let lat1 = ln * Math.PI / 180;
        let lat2 = ln1 * Math.PI / 180;
        let long1 = lt * Math.PI / 180;
        let long2 = lt1 * Math.PI / 180;

        // косинусы и синусы широт и разницы долгот
        let $cl1 = Math.cos(lat1);
        let $cl2 = Math.cos(lat2);
        let $sl1 = Math.sin(lat1);
        let $sl2 = Math.sin(lat2);
        let $delta = long2 - long1;
        let $cdelta = Math.cos($delta);
        let $sdelta = Math.sin($delta);

        // вычисления длины большого круга
        let $y = Math.sqrt(Math.pow($cl2 * $sdelta, 2) + Math.pow($cl1 * $sl2 - $sl1 * $cl2 * $cdelta, 2));
        let $x = $sl1 * $sl2 + $cl1 * $cl2 * $cdelta;

        //
        let $ad = Math.atan2($y, $x);
        let $dist = $ad * EARTH_RADIUS;

        return $dist / 1000;
    }

    parseGeoJson(data) {
        let district = null;
        try {
            district = JSON.parse(data);
        }
        catch (err) {
            console.log('######eee', err.stack)
        }
        if (Array.isArray(district.geometry.coordinates[0][0][0]))
            return this.origDistrictArray = district.geometry.coordinates[0][0];
        return this.origDistrictArray = district.geometry.coordinates[0];
    }

    prepareCoordinates() {
        if (this.origDistrictArray.length <= 0) return null;

        this.origDistrictArray.forEach((value, index) => {
            let ln = value[0];
            let lt = value[1];

            this.poligon.longitude.push(ln);
            this.poligon.latitude.push(lt);

            if (index === 0) {
                this.minMaxCoordinates.longitude.min = ln;

                this.minMaxCoordinates.longitude.max = ln;

                this.minMaxCoordinates.latitude.min = lt;

                this.minMaxCoordinates.latitude.max = lt;
            }

            if (this.minMaxCoordinates.longitude.min > ln) {
                this.minMaxCoordinates.longitude.min = ln;
            }
            if (this.minMaxCoordinates.longitude.max <= ln) {
                this.minMaxCoordinates.longitude.max = ln;
            }
            if (this.minMaxCoordinates.latitude.min > lt) {
                this.minMaxCoordinates.latitude.min = lt;
            }
            if (this.minMaxCoordinates.latitude.max <= lt) {
                this.minMaxCoordinates.latitude.max = lt;
            }
        });
        return this.minMaxCoordinates;
    }

    containsLocation(longitude, latitude) {
        let i, j = this.poligon.longitude.length - 1;
        let oddNodes = false;
        let polyX = this.poligon.longitude;
        let polyY = this.poligon.latitude;

        for (i = 0; i < this.poligon.longitude.length; i++) {
            if ((polyY[i] < latitude && polyY[j] >= latitude || polyY[j] < latitude && polyY[i] >= latitude) && (polyX[i] <= longitude || polyX[j] <= longitude)) {
                oddNodes ^= (polyX[i] + (latitude - polyY[i]) / (polyY[j] - polyY[i]) * (polyX[j] - polyX[i]) < longitude);
            }
            j = i;
        }

        return oddNodes;
    }

}

module.exports = DisctrictCoordinates;

/*
    getMinMax(mass) {
        return mass.reduce((acc, value, index) => {
            let x = value[0];
            let y = value[1];

            acc.arr.x.push(x);
            acc.arr.y.push(y);

            if (acc.x.xmin === null) {
                acc.x.xmin = x;
                acc.x.xmin_index = index;
            }
            if (acc.x.xmax === null) {
                acc.x.xmax = x;
                acc.x.xmax_index = index;
            }
            if (acc.y.ymin === null) {
                acc.y.ymin = y;
                acc.y.ymin_index = index;
            }
            if (acc.y.ymax === null) {
                acc.y.ymax = y;
                acc.y.ymax_index = index;
            }

            if (acc.x.xmin > x) {
                acc.x.xmin = x;
                acc.x.xmin_index = index;
            }
            if (acc.x.xmax <= x) {
                acc.x.xmax = x;
                acc.x.xmax_index = index;
            }
            if (acc.y.ymin > y) {
                acc.y.ymin = y;
                acc.y.ymin_index = index;
            }
            if (acc.y.ymax <= y) {
                acc.y.ymax = y;
                acc.y.ymax_index = index;
            }
            return acc;
        }, { x: { xmin: null, xmin_index: null, xmax: null, xmax_index: null }, y: { ymin: null, ymin_index: null, ymax: null, ymax_index: null }, arr: { x: [], y: [] } });
    }*/
