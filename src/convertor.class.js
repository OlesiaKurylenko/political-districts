class Convertor {

    static convertToPointsForGM(points) {
        return points.reduce((acc, el, index) => {
            acc[`point${index}`] = {
                center: {
                    lng: el.point[0],
                    lat: el.point[1]
                },
                radius: el.radius
            }
            return acc;
        }, {}
        );
    }
    static convertToCsv(points) {
        return points.map(el => `${el.name};${el.point};${el.radius};`);

    }

    static convertToPoligonGM(points) {
        return points.reduce((acc, el, index) => {
            acc.push({ lng: el[0], lat: el[1] });
            return acc;
        }, []);
    }
}

module.exports = Convertor;