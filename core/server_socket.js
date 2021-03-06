/**
 * Created by Chedli on 6/8/14.
 */
var   fs = require('fs')
    , exec = require('child_process').exec
    , util = require('util')
    , Files = {};

exports.on = function (io){

    io.sockets.on('connection', function (socket) {
        socket.on('Start', function (data) { //data contains the variables that we passed through in the html file
            var Name = data['Name'];

            console.log("hello");
            console.log(Name);
            console.log(data['Size']);
            Files[Name] = {  //Create a new Entry in The Files Variable
                FileSize : data['Size'],
                Data	 : "",
                Downloaded : 0
            }
            var Place = 0;
            try{
                var Stat = fs.statSync('Temp/' +  Name);
                if(Stat.isFile())
                {
                    Files[Name]['Downloaded'] = Stat.size;
                    Place = Stat.size / 2097152;
                }
            }
            catch(er){} //It's a New File
            fs.open("Temp/" + Name, 'a', 0755, function(err, fd){
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    Files[Name]['Handler'] = fd; //We store the file handler so we can write to it later
                    socket.emit('MoreData', { 'Place' : Place, Percent : 0 });
                }
            });
        });

        socket.on('Upload', function (data){
            var Name = data['Name'];
            Files[Name]['Downloaded'] += data['Data'].length;
            Files[Name]['Data'] += data['Data'];
            if(Files[Name]['Downloaded'] == Files[Name]['FileSize']) //If File is Fully Uploaded
            {
                fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function(err, Writen){
                    var inp = fs.createReadStream("Temp/" + Name);
                    var out = fs.createWriteStream("Uploads/" + Name);
                    var r= inp.pipe(out);
                    r.on ('finish', function(){
                        fs.unlink("Temp/" + Name, function () { //This Deletes The Temporary File
//                            exec("ffmpeg -i Uploads/" + Name  + " -ss 01:30 -r 1 -an -vframes 1 -f mjpeg Uploads/" + Name  + ".jpg", function(err){
//                                console.error(err);
//                                socket.emit('Done', {'Image' : 'Uploads/' + Name + '.jpg'});
//                            });
                            socket.emit('Done', {'Image' : 'Uploads/' + Name + '.jpg'});
                        });
                    });
//                    util.pump(inp, out, function(){
//                        fs.unlink("Temp/" + Name, function () { //This Deletes The Temporary File
//                            exec("ffmpeg -i Uploads/" + Name  + " -ss 01:30 -r 1 -an -vframes 1 -f mjpeg Uploads/" + Name  + ".jpg", function(err){
//                                console.error(err);
//                                socket.emit('Done', {'Image' : 'Uploads/' + Name + '.jpg'});
//                            });
//                        });
//                    });
                });
            }
            else if(Files[Name]['Data'].length > (10485760)){ //If the Data Buffer reaches 10MB
                fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function(err, Writen){
                    Files[Name]['Data'] = ""; //Reset The Buffer
                    var Place = Files[Name]['Downloaded'] / 2097152;
                    var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
                    socket.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent});
                });
            }
            else
            {
                var Place = Files[Name]['Downloaded'] / 2097152;
                var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
                socket.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent});
            }
        });
    });
}