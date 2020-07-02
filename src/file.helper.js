const fs = require('fs');

class FileHelper {

    constructor() {
        this.fileList = [];
    }

    getFileNameByIndex(index) {
        if (index < 0 || index > this.fileList.length)
            return '';
        let file = this.fileList[index];
        let filename = file.replace('./', '').split("/").join("_").replace('.geojson', '');
        return filename;
    }


    getFiles(dir, files_) {

        files_ = files_ || [];
        let files = fs.readdirSync(dir);
        for (let i in files) {
            let name = dir + '/' + files[i];
            if (fs.statSync(name).isDirectory()) {
                this.getFiles(name, files_);
            } else {
                if (!name.includes('shape'))
                    files_.push(name);
            }
        }
        this.fileList = files_;
        return files_;
    };

    readFile(path) {
        let data = fs.readFileSync(path);
        return data;
    }

    writeFile(path, data) {
        let logger = null;

        console.log(path, data);

        logger = fs.createWriteStream(path)

        logger
            .on('open', () => {
                data.forEach(element => {
                    logger.write(element);
                });
                logger.end();
            })
            .on('finish', () => {
                console.log('finish write stream, moving along');
                return true;
            })
            .on('error', (err) => { console.log(err); return false; });

    }

    writeFile2(path, data) {
        fs.writeFileSync(path, data);
        return true;
    }
}

module.exports = FileHelper;