const fs = require('fs');
const path = require('path');

const lib = {};
// base directory to the data folder
lib.baseDir = path.join(__dirname, '../.data/');

// write data to file
lib.create = (dir, file, data, callback) => {
    fs.open(`${lib.baseDir + dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // convert data to string
            const stringData = JSON.stringify(data);
            // write data to file and close it
            fs.writeFile(fileDescriptor, stringData, (err1) => {
                if (!err1) {
                    fs.close(fileDescriptor, (err2) => {
                        if (!err2) {
                            callback(false);
                        } else {
                            callback('Closing the new file.');
                        }
                    });
                } else {
                    callback('Error writting to new file');
                }
            });
        } else {
            callback(err);
        }
    });
};
// read data from file
lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.baseDir + dir}/${file}.json`, 'utf8', (err, data) => {
        callback(err, data);
    });
};
// update existing data
lib.updade = (dir, file, data, callback) => {
    // open the file
    fs.open(`${lib.baseDir + dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // covert to data to string
            const stringData = JSON.stringify(data);
            // truncate the file
            fs.ftruncate(fileDescriptor, (err1) => {
                if (!err1) {
                    // write to the file and close it
                    fs.writeFile(fileDescriptor, stringData, (err2) => {
                        if (!err2) {
                            fs.close(fileDescriptor, (err3) => {
                                if (!err3) {
                                    callback(false);
                                } else {
                                    callback(err3);
                                }
                            });
                        } else {
                            callback(err2);
                        }
                    });
                } else {
                    callback(err1);
                }
            });
        } else {
            callback(err);
        }
    });
};
// delete existing data
lib.delete = (dir, file, callback) => {
    // unlink file
    fs.unlink(`${lib.baseDir + dir}/${file}.json`, (err) => {
        if (!err) {
            callback(false);
        } else {
            callback(err);
        }
    });
};

module.exports = lib;
