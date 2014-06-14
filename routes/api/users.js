var bcrypt   = require('bcrypt-nodejs');
var formidable= require('formidable');
formidable.IncomingForm.prototype.uploadDir = './Uploads';

formidable.IncomingForm.prototype.keepExtensions = true;

var fs = require('fs');
function ensureExists(path, mask, cb) {
    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
        cb = mask;
        mask = 0777;
    }
    fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
            else cb(err); // something else went wrong
        } else cb(null); // successfully created folder
    });
}

exports.login = function(req, res){

    req.mysql.getConnection( function(err, connection){
        if(err) {
            console.error('CONNECTION error: ', err);
            res.statusCode = 503;
            res.send({
                result: 'error',
                err: err.code
            });
        }else {
            connection.query("select * from users where email = '" + req.body.email + "'", function (err, rows) {

                if (err) {
                    console.error('CONNECTION error: ',err);
                    res.statusCode = 503;
                    res.send({
                        result: 'error',
                        err:    err.code
                    });
                } else {
                        if (rows.length === 0){
                            res.statusCode = 204;
                            console.log("hii");
                            res.send({result: 'error'});
                        }
                        else if (!(  bcrypt.compareSync(req.body.password, rows[0]["password"]))) {
                            res.statusCode= 401;
                            res.send({ result: "password incorrect"})
                        } else {
                            ensureExists('Uploads/' + rows[0]["name"] + rows[0]["id"], 0744, function (err) {
                                if (err) throw err; // handle folder creation error
                                // else // we're all good
                            });
                            res.send({
                                result: 'success',
                                err:    '',
                                id:     rows[0]["id"],
                                json:   rows[0],
                                length: 1
                            });
                        }
                        connection.release();
                }
            });

        }
    });
};

exports.find = function(req,res){
    req.mysql.getConnection(function(err, connection) {
        if (err) {
            console.error('CONNECTION error: ',err);
            res.statusCode = 503;
            res.send({
                result: 'error',
                err:    err.code
            });
        } else {
            connection.query('SELECT * FROM users WHERE id = ?', req.params.id, function(err, rows) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        err:    err.code
                    });
                } else {
                    if (rows.length === 0){
                        res.statusCode = 204;
                    } else {
                        res.send({
                            result: 'success',
                            err:    '',
                            id:     req.params.id,
                            json:   rows[0],
                            length: 1
                        });
                    }
                    connection.release();
                }
            });
        }
    });
};
exports.upd = function(req,res){
    req.mysql.getConnection(function(err, connection) {
        if (err) {
            console.error('CONNECTION error: ',err);
            res.statusCode = 503;
            res.send({
                result: 'error',
                err:    err.code
            });
        } else {
            connection.query('UPDATE users SET ? WHERE id='+connection.escape(req.params.id), req.body, function(err) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        err:    err.code
                    });
                } else {
                    connection.query('SELECT * FROM users WHERE id = ?', req.params.id, function(err, rows) {
                        if (err) {
                            console.error(err);
                            res.statusCode = 500;
                            res.send({
                                result: 'error',
                                err:    err.code
                            });
                        } else {
                            res.send({
                                result: 'success',
                                err:    '',
                                id:     req.params.id,
                                json:   rows[0],
                                length: 1
                            });
                        }
                        connection.release();
                    });
                }
            });
        }
    });
};
exports.ins = function(req,res){

    req.mysql.getConnection(function(err, connection) {
        if (err) {
            console.error('CONNECTION error: ',err);
            res.statusCode = 503;
            res.send({
                result: 'error',
                err:    err.code
            });
        } else {
            var salt = bcrypt.genSaltSync(8),
                data = req.body;
                data["Password"] = bcrypt.hashSync(data["Password"], salt); // bcrypt.compareSync("my password", hash); // true
                data.salt = salt;
                console.log(data);
            connection.query('INSERT INTO users SET ?', data, function(err, result) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        err:    err.code
                    });
                } else {
                    ensureExists('Uploads/' + (data["Name"]||data.name) + result.insertId, 0744, function (err) {
                        if (err) throw err; // handle folder creation error
                        // else // we're all good
                    });
                    res.send({
                        result: 'success',
                        err:    '',
                        id:     result.insertId
                    });
                }
                connection.release();
            });
        }
    });
};

exports.upload = function(req, res){


    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
        res.writeHead(200, {'content-type': 'text/plain'});
        res.write('received upload:\n\n');
        res.end(util.inspect({fields: fields, files: files}));
    });


}

exports.download = function(req, res){

    var file, filepath, quota;
    filepath = './public/lua.pdf';
    file = {
        path: filepath,
        name: path.basename(filepath),
        size: (fs.statSync(filepath)).size
    };
    console.log({
        file: file.name,
        size: filesize(file.size)
    });
    quota = 102400;
    return fs.open(file.path, 'r', function(err, fd) {
        var buffer, id, position;
        if (err != null) {
            throw err;
        }
        response.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Content-Length': file.size,
            'Content-Disposition': "attachment;filename=" + file.name
        });
        buffer = new Buffer(4096);
        position = 0;
        return id = setInterval(function() {
            var bytesRead, _results;
            this.quota = quota;
            console.log("fs.read fd, buffer, 0, 1024, " + (filesize(position)));
            _results = [];
            while (this.quota > 0) {
                bytesRead = fs.readSync(fd, buffer, 0, buffer.length, position);
                response.write(buffer);
                position += bytesRead;
                this.quota -= bytesRead;
                if (bytesRead < buffer.length) {
                    console.log('over');
                    clearInterval(id);
                    response.end();
                    fs.close(fd);
                    break;
                } else {
                    _results.push(void 0);
                }
            }
            return _results;
        }, 1000);
    });

};
