/**
 * Created by jinguangguo on 2014/11/18.
 */

exports.init = function(app) {
    // 首页
    app.get('/', function(req, res) {
        res.redirect('/index.html');
    });
};

