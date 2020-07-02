const fs = require('fs');
const EARTH_RADIUS = 6372795;

class GeoHelper {

    static calculateTheDistance(ln, lt, ln1, lt1) {
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

    static parseGeoJson(data) {
        let district = null;
        try {
            district = JSON.parse(data);
        }
        catch (err) {
            console.log('######eee', err.stack)
        }
        if (Array.isArray(district.geometry.coordinates[0][0][0]))
            return district.geometry.coordinates[0][0];
        return district.geometry.coordinates[0];
    }

    static preparationData(mass) {
        let result = {
            longitude: {
                min: {
                    value: null, index: null
                },
                max: {
                    value: null, index: null
                }
            },
            latitude: {
                min: {
                    value: null, index: null
                },
                max: {
                    value: null, index: null
                }
            },
            preperedMas: { longitude: [], latitude: [] }
        }
        return mass.reduce((acc, value, index) => {
            let ln = value[0];
            let lt = value[1];

            acc.preperedMas.longitude.push(ln);
            acc.preperedMas.latitude.push(lt);

            if (index === 0) {
                acc.longitude.min.value = ln;
                acc.longitude.min.index = index;

                acc.longitude.max.value = ln;
                acc.longitude.max.index = index;

                acc.latitude.min.value = lt;
                acc.latitude.min.index = index;

                acc.latitude.max.value = lt;
                acc.latitude.max.index = index;
            }

            if (acc.longitude.min.value > ln) {
                acc.longitude.min.value = ln;
                acc.longitude.min.index = index;
            }
            if (acc.longitude.max.value <= ln) {
                acc.longitude.max.value = ln;
                acc.longitude.max.index = index;
            }
            if (acc.latitude.min.value > lt) {
                acc.latitude.min.value = lt;
                acc.latitude.min.index = index;
            }
            if (acc.latitude.max.value <= lt) {
                acc.latitude.max.value = lt;
                acc.latitude.max.index = index;
            }
            return acc;
        }, result);
    }

    static getMinMax(mass) {
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
    }

    static containsLocation(x, y, cornersX, cornersY) {

        let i, j = cornersX.length - 1;
        let oddNodes = false;

        let polyX = cornersX;
        let polyY = cornersY;

        for (i = 0; i < cornersX.length; i++) {
            if ((polyY[i] < y && polyY[j] >= y || polyY[j] < y && polyY[i] >= y) && (polyX[i] <= x || polyX[j] <= x)) {
                oddNodes ^= (polyX[i] + (y - polyY[i]) / (polyY[j] - polyY[i]) * (polyX[j] - polyX[i]) < x);
            }
            j = i;
        }

        return oddNodes;
    }


}

module.exports = GeoHelper;