var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.get('/payment', function(req, res){

    var fs = require('fs');
    var content='';
    var walk = function(dir, done) {
        var results = [];
        //content+='<li>';
        fs.readdir(dir, function(err, list) {

            content+= '<a href="#" class="fa fa-folder folder" >'+dir+'</a>';
            content+=    '<ul>';
            if (err) return done(err);
            var i = 0;
            (function next() {
                var file = list[i++];
                if (!file) return done(null, results, content);
                file = dir + '/' + file;
                fs.stat(file, function(err, stat) {
                    if (stat && stat.isDirectory()) {
                        //content+= '<a href="#" class="fa fa-folder folder" >'+stat.name+'</a>';
                        content+=    '<ul>';
                        walk(file, function(err, res) {
                            //content+= '<li>'+res+'</li>';
                            content+= '</ul>';
                            results = results.concat(res);
                            next();
                        });
                        content+='</ul>';
                    } else {
                        content+= '<li>'+file+'</li>';

                        results.push(file);
                        next();
                    }
                    //content+= '</ul>';



                });
            })();
        });
        //content+='<li>';

    };

//    <li>
//        <a href="#" class="fa fa-folder folder" >Folder 1</a>
//        <ul>
//            <li>
//            File 1
//            </li>
//            <li>
//            File 2
//            </li>
//            <li>
//            File 3
//            </li>
//        </ul>
//    </li>
    walk('public', function(err, results,contents) {
        if (err) throw err;
        //console.log(results);
        console.log(contents);
        res.send(contents);
    });
//    var walk    = require('walk');
//    var files   = [];
//
//// Walker options
//    var walker  = walk.walk('public', { followLinks: false });
//var i =-1;
//    walker.on("directory", function (root, dirStatsArray, next) {
//        i= i+1;
//        // dirStatsArray is an array of `stat` objects with the additional attributes
//        // * type
//        // * error
//        // * name
//        console.log(dirStatsArray.name);
//        next();
//    });
//
//
//    walker.on('file', function(root, stat, next) {
//        // Add this file to the list of files
//        //files.push({file: root + '/' + stat.name, root: root});
//
//        next();
//    });
//
//    walker.on('end', function() {
//        //console.log(files);
//    });
   // res.end("hello");
});

//var fs = require('fs');
//            var walk = function(dir, done) {
//                var results = [];
//                var content = '<li>';
//                fs.readdir(dir, function(err, list) {
//                    if (err) return done(err);
//                    var i = 0;
//                    (function next() {
//                        var file = list[i++];
//                        if (!file) return done(null, results, content);
//                        file = dir + '/' + file;
//                        fs.stat(file, function(err, stat) {
//                            if (stat && stat.isDirectory()) {
//                                content+= '<a href="#" class="fa fa-folder folder" >'+stat.name+'</a>';
//                                content+=    '<ul>';
//                                walk(file, function(err, res) {
//                                    content+= '<li>'+res+'</li>';
//                                    results = results.concat(res);
//                                    next();
//                                });
//                            } else {
//                                content+= '</ul>';
//                                results.push(file);
//                                next();
//                            }
//                        });
//                    })();
//                });
//            };

module.exports = router;
