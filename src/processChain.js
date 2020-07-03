const GeoHelper = require('./geo.helper');
const FileHelper = require('./file.helper');
const GeoJsonData = require('./geo.json.data');
const fs = require('fs');
const path = require('path');
const testFolder = './states';
const savedFolder = './static/';
let radius = 0.4;

let fileHelper = null;

const getFiles = (directory) => {
    if (!fileHelper) {
        fileHelper = new FileHelper();
    }
    if (!directory) {
        directory = __dirname + '/states'
    }
    let files = fileHelper.getFiles(directory).map(file => file.replace(__dirname, ''));
    return files
}
const processFile = (originalfile, setRadius, message) => {
    let file = '';
    if (!fileHelper) {
        fileHelper = new FileHelper();
        getFiles(__dirname + '/states');
    }
    if (fileHelper.fileList.length === 0) {
        return { error: 'Now records' }
    }
    let response = {
        fileName: '',
        urlPoligon: '',
        urlPoints: '',
        urlCsv: '',
        radius: setRadius,
        isRadiusDefault: setRadius ? false : true,
        dist1: '',
        dist2: '',
        countPoints: '',
        message: message
    };

    //** process file by default */
    if (!originalfile && fileHelper.fileList.length > 0)
        file = fileHelper.fileList[0];
    else
        file = __dirname + originalfile;

    //** read data from file *.geojson */
    let data = fileHelper.readFile(file);

    //** parse Data to json and return coordinates */
    let parseData = GeoHelper.parseGeoJson(data);
    let preperedData = GeoHelper.preparationData(parseData);

    //** generated poligon data */
    const poligonData = parseData.reduce((acc, el, index) => {
        acc.push({ lng: el[0], lat: el[1] });
        return acc;
    }, []);

    //** saved poligon data to json file */
    fileHelper.writeFile2(__dirname + '/static/json/poligon.json', JSON.stringify({ data: poligonData }));
    response.urlPoligon = 'json/poligon.json';

    //** create instance GeoJsonData  class */
    let filename = file.split('states/')[1].replace('./', '').split("/").join("_").replace('.geojson', '');
    let geoJsonData = new GeoJsonData(filename, preperedData, response.radius);
    response.fileName = filename;

    //** return sides of rectangle */
    let sides = geoJsonData.getSidesRectangle();

    //** calculate The Distance of rectangle */
    let dist1 = GeoHelper.calculateTheDistance(sides.side1.B[1], sides.side1.B[0], sides.side1.A[1], sides.side1.A[0]);
    let dist2 = GeoHelper.calculateTheDistance(sides.side2.A[1], sides.side2.A[0], sides.side2.C[1], sides.side2.C[0]);
    if (dist1 < response.radius || dist2 < response.radius) {
        response.radius = (dist1 * 0.3) / 5;
        response.isRadiusDefault = true;
        response.message = 'Radius more then one side of direct. Set default radius ' + response.radius;
    }

    response.dist1 = dist1;
    response.dist2 = dist2;

    //** set default radius */
    if (!setRadius)
        response.radius = (dist1 * 0.3) / 5;

    geoJsonData.radius = response.radius;

    //** set distan of rectangle */
    geoJsonData.setDistSide(dist1, dist2);

    //** generated Array Points */
    let preArrayPoint = geoJsonData.generatedArrayPoints();
    //** proccesed preArrayPoint, set value=1 if point contain Poligon */
    let arrayPoints = preArrayPoint.map(el => {
        el.isContainsLocation = (GeoHelper.containsLocation(
            el.coordinate[1],
            el.coordinate[0],
            geoJsonData.coordinates.preperedMas.longitude,
            geoJsonData.coordinates.preperedMas.latitude
        ));
        return el;
    });

    let pointsForCsv = arrayPoints.filter(data => data.isContainsLocation === 1)
        .map(el => `${geoJsonData.fileName};${el.coordinate};${response.radius};`);

    let pointsForJson = arrayPoints.filter(data => data.isContainsLocation === 1)
        .reduce((acc, el, index) => {
            acc[`point${index}`] = {
                center: {
                    lng: el.coordinate[1],
                    lat: el.coordinate[0]
                },
                radius: response.radius
            }
            return acc;
        }, {}
        );
    response.countPoints = pointsForCsv.length;
    if (pointsForCsv.length > 50000) {
        processFile(originalfile, (dist1 * 0.3) / 5, 'To many records, more then 50 000')
    }

    fileHelper.writeFile2(__dirname + '/static/json/points.json', JSON.stringify(pointsForJson));
    response.urlPoints = 'json/points.json';

    let pathFile = __dirname + '/static/csv/' + geoJsonData.fileName + '.csv';


    fileHelper.writeFile2(pathFile, pointsForCsv.join('\n'));
    response.urlCsv = 'csv/' + geoJsonData.fileName + '.csv';

    return response;
}


module.exports.getFiles = getFiles;
module.exports.processFile = processFile;