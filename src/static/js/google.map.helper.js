let map = null;
let bermudaTriangle = null;
let circleCoords = null;
let triangleCoords = [{ lng: -147.813844, lat: 64.83443999927472 }];
let zoom = 10;

const postData = async (url = '', data = {}) => {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        referrerPolicy: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return await response.json(); // parses JSON response into native JavaScript objects
}

const getData = async (url = '') => {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *client
    });
    return await response.json(); // parses JSON response into native JavaScript objects
}

document.addEventListener("DOMContentLoaded", async () => {
    let data = await getData('/init');
    if (data.error) {
        document.getElementById("information").innerHTML = data.error; return;
    }
    if (data.message)
        document.getElementById("information").innerHTML = data.message;

    let res = await getData('/files-name');
    let files = res.files;
    let select = document.getElementById("selectFile");
    for (let i = 0; i < files.length; i++) {
        var opt = document.createElement('option');
        opt.value = i;
        opt.innerHTML = files[i];
        if (i === 0)
            opt.selected = true;
        select.appendChild(opt);
    }



    setStatistic(data);

    let urlPoligon = await getData(data.urlPoligon);
    let urlPoints = await getData(data.urlPoints);

    setPoligonData(urlPoligon);
    setPointsData(urlPoints);

});

function initMap() {
    // Create the map.
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: zoom,
        center: triangleCoords[0],
        mapTypeId: 'terrain'
    });
    bermudaTriangle = new google.maps.Polygon({
        paths: triangleCoords,
        strokeColor: "#FF1ss00",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "FFF",
        fillOpacity: 0.35
    });
    bermudaTriangle.setMap(map);

    for (let city in circleCoords) {
        console.log(city, circleCoords[city].center, (circleCoords[city].radius) * 1000)
        let cityCircle = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            center: circleCoords[city].center,
            radius: (circleCoords[city].radius) * 1000
        });
        cityCircle.setMap(map);
    }

}

async function generatedPoints() {
    let radius = document.getElementById("radius").value;
    let select = document.getElementById("selectFile");
    let checked = document.getElementById("isRadiusDefault").checked;
    let isСrossing = document.getElementById("isСrossing").checked;
    let fileName = select.options[select.selectedIndex].text;
    document.getElementById("generated").disabled = true;
    let data = await postData('/points', { radius: radius, fileName: fileName, isRadiusDefault: checked, isСrossing: isСrossing });
    console.log(data)
    if (data.error) {
        document.getElementById("information").innerHTML = data.error; return;
    }
    if (data.message)
        document.getElementById("information").innerHTML = data.message;
    setStatistic(data);
    let urlPoligon = await getData(data.urlPoligon);
    let urlPoints = await getData(data.urlPoints);

    setPoligonData(urlPoligon);
    setPointsData(urlPoints);
    document.getElementById("generated").disabled = false;
}
function setPoligonData(data) {
    triangleCoords = data.data;
    initMap();
}
function setPointsData(data) {
    circleCoords = data;
    initMap();
}

function setStatistic(data) {
    setZoom(data.dist1)
    document.getElementById("isRadiusDefault").checked = data.isRadiusDefault;
    document.getElementById("points").value = data.countPoints;
    document.getElementById("dist1").value = data.dist1;
    document.getElementById("dist2").value = data.dist2;
    document.getElementById("urlToCsv").href = data.urlCsv;
    document.getElementById("radius").value = data.radius;
    document.getElementById("isСrossing").checked = data.isRadiusDefault;

    checkDefault();
}

function setZoom(dist1) {
    if (dist1 < 2) {
        zoom = 15;
        return;
    }
    if (dist1 < 10) {
        zoom = 10;
        return;
    }
    if (dist1 < 50) {
        zoom = 9;
        return;
    }
    if (dist1 < 100) {
        zoom = 8;
        return;
    }
    if (dist1 < 150) {
        zoom = 7;
        return;
    }
    if (dist1 >= 150) {
        zoom = 6;

        return;
    }
    zoom = 10;

}

function checkDefault() {
    document.getElementById("radius").disabled = document.getElementById("isRadiusDefault").checked;
}
