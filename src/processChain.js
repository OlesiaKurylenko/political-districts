const DisctrictCoordinates = require('./disctrictCoordinates.class');
const FileHelper = require('./file.helper');
const DistrictPoints = require('./DistrictPoints.class');
const Convertor = require('./convertor.class');
const fs = require('fs');
const path = require('path');
const round = require('lodash.round');

const path_folders = '/states';

let radius = 0.4;
let fileHelper = null;

const getFiles = (directory) => {
    if (!fileHelper) {
        fileHelper = new FileHelper();
    }
    if (!directory) {
        directory = __dirname + path_folders;
    }
    let files = fileHelper.getFiles(directory).map(file => file.replace(__dirname, ''));
    return files
}

const processFile = (originalfile, setRadius, isСrossing, message) => {

    console.log(`start processFile with param: file:${originalfile} radius: ${setRadius} isСrossing:${isСrossing} message: ${message}`)

    let file = '';

    if (!fileHelper) {
        fileHelper = new FileHelper();
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
        message: message,
        isСrossing: isСrossing,
        crossingRadius: 0
    };

    //** process file by default */
    if (!originalfile) {
        let files = getFiles(__dirname + path_folders);
        if (files.length === 0) {
            return ({ ...response, message: 'No files in default directory' });
        }
        file = fileHelper.fileList[0];
    }
    else
        file = __dirname + originalfile;

    //** read data from file *.geojson */
    let data = fileHelper.readFile(file);

    let distCoordinates = new DisctrictCoordinates();

    //** parse Data to json and return coordinates */
    let parseData = distCoordinates.parseGeoJson(data);
    if (!parseData) return ({ ...response, message: 'No points after parse' });

    let preperedCoordinates = distCoordinates.prepareCoordinates();

    //** saved poligon data to json file */
    fileHelper.writeFile2(__dirname + '/static/json/poligon.json', JSON.stringify({ data: Convertor.convertToPoligonGM(distCoordinates.origDistrictArray) }));
    response.urlPoligon = 'json/poligon.json';

    //** create instance GeoJsonData  class */
    let filename = file.split('states/')[1].replace('./', '').split("/").join("_").replace('.geojson', '');
    let districtPoints = new DistrictPoints(filename, response.radius, preperedCoordinates, distCoordinates);
    response.fileName = filename;

    let dist1 = districtPoints.rectangel.sideAB.dist;
    let dist2 = districtPoints.rectangel.sideAC.dist;

    response.dist1 = dist1;
    response.dist2 = dist2;

    //** set default radius */
    if (!setRadius)
        response.radius = round((dist1 * 0.3) / 5, 3);

    if (dist1 < response.radius || dist2 < response.radius) {
        response.radius = round((dist1 * 0.3) / 5, 3);
        response.isRadiusDefault = true;
        response.message = 'Radius more then one side of direct. Set default radius ' + response.radius;
    }

    districtPoints.radius = response.radius;

    if (isСrossing) {
        response.crossingRadius = Math.sqrt(response.radius * response.radius + response.radius * response.radius);
        districtPoints.crossingRadius = response.crossingRadius;
    }

    //** calculate The Distance of rectangle */
    districtPoints.preperedDirects()

    //** generated Array Points */
    let points = districtPoints.generatedArrayPoints(response.crossingRadius, isСrossing);

    let pointsForCsv = Convertor.convertToCsv(points);

    let pointsForJson = Convertor.convertToPointsForGM(points);

    response.countPoints = pointsForCsv.length;
    if (response.countPoints > 20000) {
        console.log('response.countPoints > 20 000')
        return processFile(originalfile, round((dist1 * 0.3) / 5, 2), isСrossing, 'To many records, more then 20 000')
    }

    fileHelper.writeFile2(__dirname + '/static/json/points.json', JSON.stringify(pointsForJson));
    response.urlPoints = 'json/points.json';

    let pathFile = __dirname + '/static/csv/' + districtPoints.fileName + '.csv';


    fileHelper.writeFile2(pathFile, pointsForCsv.join('\n'));
    response.urlCsv = 'csv/' + districtPoints.fileName + '.csv';

    return response;
}


module.exports.getFiles = getFiles;
module.exports.processFile = processFile;