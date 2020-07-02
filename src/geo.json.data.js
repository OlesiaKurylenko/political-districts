
class GeoJsonData {

    constructor(fileName, coordinates, radius) {
        this.fileName = fileName;
        this.distAB = 0;
        this.distAC = 0;

        this.coordinates = coordinates;
        this.data = [];
        this.radius = radius;

        this.stepLongitude = 0;
        this.stepLatitude = 0;

        this.firstStepLongitude = 0;
        this.firstStepLatitude = 0;

        this.sides = this.getSidesRectangle();
    }

    setDistSide(distAB, distAC) {
        this.distAB = distAB;
        this.distAC = distAC;

        let sides = this.sides;


        let step1 = sides.side1.B[0] - sides.side1.A[0]; // hor
        let step2 = sides.side2.C[1] - sides.side2.A[1]; // vertical

        this.stepLongitude = (step1 / distAB) * this.radius;
        this.stepLatitude = (step2 / distAC) * this.radius;

        this.firstStepLongitude = (sides.side1.B[0] - (sides.side1.A[0] + Math.floor(step1 / (this.stepLongitude * 2)) * (this.stepLongitude * 2))) / 2;
        this.firstStepLatitude = (sides.side2.C[1] - (sides.side2.A[1] + Math.floor(step2 / (this.stepLatitude * 2)) * (this.stepLatitude * 2))) / 2;

    }
    getSidesRectangle() {

        return {
            side1: {
                A: [this.coordinates.longitude.min.value, this.coordinates.latitude.min.value],
                B: [this.coordinates.longitude.max.value, this.coordinates.latitude.min.value]
            },
            side2: {
                A: [this.coordinates.longitude.min.value, this.coordinates.latitude.min.value],
                C: [this.coordinates.longitude.min.value, this.coordinates.latitude.max.value]
            }
        }
    }

    generatedArrayPoints() {
        let k = 0;

        for (let i = this.coordinates.longitude.min.value + this.firstStepLongitude; i < this.coordinates.longitude.max.value; i += this.stepLongitude * 2) {
            for (let j = this.coordinates.latitude.min.value + this.firstStepLatitude; j < this.coordinates.latitude.max.value; j += this.stepLatitude * 2) {
                // console.log('LAT ', j, '\tLON ', i)
                this.data.push({
                    coordinate: [j, i],
                    isContainsLocation: false
                });
            }
        }
        return this.data;
    }

    updateData(data) {
        this.data = data;
    }
}
module.exports = GeoJsonData;