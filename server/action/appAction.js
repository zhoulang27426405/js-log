/**
 * Created by jinguangguo on 2014/11/21.
 */

var http = require('http');
var expect = require('expect.js');

var appServe = require('../service/appServe.js');

exports.init = function(app) {
    // pv/uv
    app.get('/pvuv', function(req, res) {
        var pid  = req.param('pid');
        var appPath = req.param('appPath');
        var recentDay = req.param('recent');
        var startDay  = req.param('startDay');
        var endDay = req.param('endDay');

        expect(pid).to.be.a('string');
        expect(appPath).to.be.a('string');

        if (recentDay) {
            recentDay = recentDay.toNumber();
            appServe.requestPvUvDataOfRecent(pid, appPath, recentDay, function(data) {
                res.json({
                    errno: 0,
                    list: data
                });
            });
        } else {
            expect(startDay).to.be.a('string');
            expect(endDay).to.be.a('string');
            startDay = startDay.toNumber();
            endDay = endDay.toNumber();
            appServe.requestPvUvDataOfRange(pid, appPath, startDay, endDay, function(data) {
                res.json({
                    errno: 0,
                    list: data
                });
            });
        }
    });
    // 数值图
    app.get('/click', function(req, res) {
        var pid  = req.param('pid');
        var appPath = req.param('appPath');
        var recentDay = req.param('recent');
        var startDay  = req.param('startDay');
        var endDay = req.param('endDay');

        expect(pid).to.be.a('string');
        expect(appPath).to.be.a('string');

        /*res.json(require('../mock/mock.js').picClick);
        return;*/

        if (recentDay) {
            recentDay = recentDay.toNumber();
            appServe.requestClickDataOfRecent(pid, appPath, recentDay, function(data) {
                res.json({
                    errno: 0,
                    list: data.list,
                    max: data.max,
                    min: data.min
                });
            }, function(data) {
                res.json(data);
            });
        } else {
            expect(startDay).to.be.a('string');
            expect(endDay).to.be.a('string');
            startDay = startDay.toNumber();
            endDay = endDay.toNumber();
            appServe.requestClickDataOfRange(pid, appPath, startDay, endDay, function(data) {
                res.json({
                    errno: 0,
                    list: data.list,
                    max: data.max,
                    min: data.min
                });
            },function(data) {
				res.json(data);
            });
        }
    });
    // 热力图
    app.get('/hot', function(req, res) {
        var pid  = req.param('pid');
        var appPath = req.param('appPath');
        var recentDay = req.param('recent');
        var startDay  = req.param('startDay');
        var endDay = req.param('endDay');

        expect(pid).to.be.a('string');
        expect(appPath).to.be.a('string');

        if (recentDay) {
            recentDay = recentDay.toNumber();
            appServe.requestHotDataOfRecent(pid, appPath, recentDay, function(data) {
                res.json({
                    errno: 0,
                    list: data
                });
            }, function(data) {
                res.json(data);
            });
        } else {
            expect(startDay).to.be.a('string');
            expect(endDay).to.be.a('string');
            startDay = startDay.toNumber();
            endDay = endDay.toNumber();
            appServe.requestHotDataOfRange(pid, appPath, startDay, endDay, function(data) {
                res.json({
                    errno: 0,
                    list: data
                });
            }, function(data) {
                res.json(data);
            });
        }
    });
    // UA
    app.get('/ua', function(req, res) {
        var pid  = req.param('pid');
        var appPath = req.param('appPath');
        var recentDay = req.param('recent');
        var startDay  = req.param('startDay');
        var endDay = req.param('endDay');

        expect(pid).to.be.a('string');
        expect(appPath).to.be.a('string');

        if (recentDay) {
            recentDay = recentDay.toNumber();
            appServe.requestUaDataOfRecent(pid, appPath, recentDay, function(data) {
                res.json({
                    errno: 0,
                    list: data
                });
            }, function(data) {
                res.json(data);
            });
        } else {
            expect(startDay).to.be.a('string');
            expect(endDay).to.be.a('string');
            startDay = startDay.toNumber();
            endDay = endDay.toNumber();
            appServe.requestUaDataOfRecent(pid, appPath, recentDay, function(data) {
                res.json({
                    errno: 0,
                    list: data
                });
            }, function(data) {
                res.json(data);
            });
        }
    });
};


