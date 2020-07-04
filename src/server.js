const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const processChain = require('./processChain');
const dotenv = require('dotenv');
dotenv.config();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/static'));

const { PORT } = process.env;

router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/html/index.html'));
    //__dirname : It will resolve to your project folder.
});
app.post('/points', function (req, res) {
    let { fileName, radius, isRadiusDefault, isСrossing } = (req.body);

    res.json(processChain.processFile(fileName, !isRadiusDefault ? radius : null, isСrossing));
});
router.get('/init', function (req, res) {
    res.json(processChain.processFile());
});

router.get('/files-name', function (req, res) {
    res.json({ files: processChain.getFiles() });
});

app.use('/', router);
app.listen(process.env.PORT || 3003);

console.log('Running at Port ' + PORT);
