/**
 * Created by jinguangguo on 2014/11/18.
 */

var config = require('./config/config.js');
var express = require('express');
var http = require('http');
var app = express();

// 公共方法
require('./server/common/init.js');

// 配置
(function() {
    app.use(express.static(__dirname + '/web'));
})();

// 路由
(function() {
    require('./server/action/indexAction').init(app);
    require('./server/action/appAction').init(app);
})();

// db连接
(function() {
//    var db_options = {
//        host: config.db_host,
//        port: config.db_port,
//        user: config.db_user,
//        password: config.db_pwd,
//        database: config.db_name
//    };
//    var connection = mysql.createConnection(db_options, function(err) {
//        if (err) {
//            throw err;
//        }
//    });
//    connection.connect(function(err) {
//        if (err) {
//            console.log('error:' + err.message);
//            return;
//        }
//        console.log('connect mysql success!');
//    });
//    app.on('close', function(err) {
//        if (err) {
//            throw err;
//        }
//        connection.end(function(err) {
//            if (err) {
//                throw err;
//            }
//        });
//    });
})();

// 启动服务
http.createServer(app).listen(config.port, config.host, function(){
    console.log("Express server listening on port " + config.port);
});