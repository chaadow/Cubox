var fs = require('fs');

var traverseFileSystem = function (currentPath) {
    console.log(currentPath);
    var filesStats = "";
    var files = fs.readdirSync(currentPath);

    for (var i in files) {
        var currentFile = currentPath + '/' + files[i];
        var stats = fs.statSync(currentFile);
        if (stats.isFile()) {
            console.log(currentFile);
            filesStats.push({name: files[i], type: 'file', path: currentFile})

        }
        else if (stats.isDirectory()) {
            //traverseFileSystem(currentFile);
            filesStats.push({name: files[i], type: 'folder', path: currentFile})
        }
    }
    return filesStats;

};
var deleteFolder = function (path, rootPath) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
        return {result: "Deleted successfully", files: traverseFileSystem(rootPath) };
    }

};


exports.deleteFile = function (req, res) {

    var rootPath = req.body.mainpath;
    var path = req.body.path;
    if ('' === path) res.send({ 'error': "please provide the path"})
    fs.unlink(path, function (err) {
        if (err) res.send({result: err});
        console.log('successfully deleted ' + path);

        res.send({result: 'successfully deleted ' + path,
                  files: traverseFileSystem(rootPath)
                 });
    });

};
exports.deleteFolder = function (req, res) {
    var path = req.body.path;
    if ('' === path) res.send({ 'error': "please provide the path"});
    res.send(deleteFolder(path));
};

exports.traverseDirectory = function (req, res) {

    var path = req.body.path;
    if ('' === path) res.send({ 'error': "please provide the path"});

    res.send(traverseFileSystem(path));
};
