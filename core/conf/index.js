var tool = require('cloneextend'),
    conf = {};
    conf.production = {
        application:    {
            errorHandler: {},
            username    : 'demo',
            password    : 'Que62msjiDU0b2yYvi2zbavw' // bEdESpuGU3rewasaphEfaKedR7r=M#fU
        },
        db:             {
            mysql:          {
                host        : 'localhost',
                user        : 'root',
                password    : 'root',
                port        : '8889',
                database    : 'cubox'
            }
        },
        server:         {
            host    : 'localhost',
            port        : '3000'
        }
    };
    conf.development = {
        db:             {
            mysql:          {
                host        : 'localhost',
                user        : 'root',
                password    : 'root',
                port        : '8889',
                database    : 'cubox'
            }
        }
    };
    conf.personal = {
        db:             {
            mysql:          {
                host        : 'localhost',
                user        : 'root',
<<<<<<< HEAD
                password    : 'root',
                port        : '8889',
=======
                password    : '',
                port        : '3306',
>>>>>>> origin/development
                database    : 'cubox'
            }
        },
        server:         {
            host        : 'localhost',
            port        : 3000
        }

    }
    conf.defaults = {

        application:    {
            salt        : '1234567890QWERTY',
            username    : 'cubox',
            password    : 'password',
            realm       : 'Authenticated',
            routes      : ['plans'],
            middleware  : ['compress','json','urlencoded','logger']
        },
        server:         {
            host        : 'localhost',
            port        : 3000
        }
    };

exports.get = function get(env, obj){
    var settings = tool.cloneextend(conf.defaults, conf[env]);
    return ('object' === typeof obj) ? tool.cloneextend(settings, obj) : settings;
}