const round = require('lodash.round');

class DistrictPoints {

    constructor(fileName, radius, minMaxCoordinates, distCoordinateClass) {
        this.distCoord = distCoordinateClass;
        this.fileName = fileName;
        this.minMaxCoordinates = minMaxCoordinates;
        this.rectangel = {
            sideAB: {
                A: { longitude: minMaxCoordinates.longitude.min, latitude: minMaxCoordinates.latitude.min },
                B: { longitude: minMaxCoordinates.longitude.max, latitude: minMaxCoordinates.latitude.min },
                dist: round(this.distCoord.calculateTheDistance(
                    minMaxCoordinates.latitude.min, minMaxCoordinates.longitude.max,
                    minMaxCoordinates.latitude.min, minMaxCoordinates.longitude.min), 2)
            },
            sideAC: {
                A: { longitude: minMaxCoordinates.longitude.min, latitude: minMaxCoordinates.latitude.min },
                C: { longitude: minMaxCoordinates.longitude.min, latitude: minMaxCoordinates.latitude.max },
                dist: round(this.distCoord.calculateTheDistance(
                    minMaxCoordinates.latitude.min, minMaxCoordinates.longitude.min,
                    minMaxCoordinates.latitude.max, minMaxCoordinates.longitude.min), 3)
            }
        }

        this.pointsCoordinates = [];

        this.radius = radius;

        this.crossingRadius = 0;

        this.stepLongitude = 0;
        this.stepLatitude = 0;

        this.firstStepLongitude = 0;
        this.firstStepLatitude = 0;
    }

    preperedDirects() {
        let distAB = this.rectangel.sideAB.dist;
        let distAC = this.rectangel.sideAC.dist;

        let step1 = this.rectangel.sideAB.B.longitude - this.rectangel.sideAB.A.longitude; // hor
        let step2 = this.rectangel.sideAC.C.latitude - this.rectangel.sideAC.A.latitude; // vertical

        this.stepLongitude = (step1 / distAB) * this.radius;
        this.stepLatitude = (step2 / distAC) * this.radius;

        this.firstStepLongitude = (this.rectangel.sideAB.B.longitude - (this.rectangel.sideAB.A.longitude + Math.floor(step1 / (this.stepLongitude * 2)) * (this.stepLongitude * 2))) / 2;
        this.firstStepLatitude = (this.rectangel.sideAC.C.latitude - (this.rectangel.sideAC.A.latitude + Math.floor(step2 / (this.stepLatitude * 2)) * (this.stepLatitude * 2))) / 2;

    }

    generatedArrayPoints(crossingRadius, isСrossing) {
        let k = 0;

        this.crossingRadius = crossingRadius;
        for (let i = this.minMaxCoordinates.longitude.min + this.firstStepLongitude; i < this.minMaxCoordinates.longitude.max; i += this.stepLongitude * 2) {
            for (let j = this.minMaxCoordinates.latitude.min + this.firstStepLatitude; j < this.minMaxCoordinates.latitude.max; j += this.stepLatitude * 2) {

                if (this.distCoord.containsLocation(i, j))
                    this.pointsCoordinates.push({
                        name: this.fileName,
                        point: [i, j],
                        radius: isСrossing ? this.crossingRadius : this.radius
                    });
            }
        }
        return this.pointsCoordinates;
    }
}
module.exports = DistrictPoints;