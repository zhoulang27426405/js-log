/**
 * 封装与后端php连接数据的接口
 * 这里具有四个接口
 *  1> 获取PV/UV
 *  2> 获取点击量
 *  3> 获取UA
 *  4> 获取个性化需求
 * Created by jinguangguo on 2014/11/24.
 */
var http = require('http');
var querystring = require('querystring');
var log4js = require('log4js');
var expect = require('expect.js');

var service_config = require('../../config/config.js');
var CONFIG_SERVICE_HOST = service_config.service_host;
var CONFIG_SERVICE_PORT = service_config.service_port;

var CONFIG_PHP_VIEW = '/log/api/getusage';      // pv&uv
var CONFIG_PHP_CLICK = '/log/api/getpageclick'; // 数值图
var CONFIG_PHP_UA = '/log/api/getua';           // ua
var CONFIG_PHP_EXTEND = '/log/api/getextend';   // 其他

var logger = log4js.getLogger();
var _pri = {
    _getReqOptions: function(phpPath) {
        return {
            host: CONFIG_SERVICE_HOST,
            port: CONFIG_SERVICE_PORT,
            path: phpPath,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cookie': ''
            }
        };
    },
    /**
     * 抽象请求
     * @param options
     * @param path
     * @param startDay
     * @param endDay
     * @param callback
     * @private
     */
    _request: function(reqConfig, pid, apppath, startDay, endDay, flag, callback, onFailCallback) {
        var reqData = {
            pid: pid,
            path: apppath,
            startTime: startDay
        };
        if (endDay) {
            reqData.endTime = endDay;
        }
        if (flag == 1 || flag == 0) {
            reqData.flag = flag;
        }
        reqConfig.path = reqConfig.path + '?' + querystring.stringify(reqData);
        console.log(service_config.service_host + ':' + service_config.service_port + reqConfig.path);
        var innerReq = http.request(reqConfig, function(innerRes) {
        	var bufferArray = [];
            var size = 0;
            var data;
            var timerStart = new Date().getTime();
            innerRes.setEncoding('utf8');
            innerRes.on('data', function(chunk) {
                chunk = new Buffer(chunk);
            	bufferArray.push(chunk);
                size += chunk.length;
            });
            innerRes.on('end', function() {
                var timerEnd = new Date().getTime();
                console.log('The transfer time is ' + (timerEnd - timerStart) + 'ms');
                data = Buffer.concat(bufferArray, size).toString();
                try {
                    data = JSON.parse(data);
                    if (data && data.errno === 0) {
                        logger.warn('The length of meta data is ' + data.list.length);
                        callback(data.list);
                    } else {
                        logger.error('The request of [' + reqConfig.path + '] is Error! And the errno is ' + data.errno);
                    }
                } catch (e) {
                    logger.error('The request of [' + reqConfig.path + '] is Error! The message is ' + '返回数据过大，服务器暂时无法处理！');
                    onFailCallback({
                        errno: -1,
                        msg: '数据请求超时，请稍候重试！'
                    });
                }
            });
        });
        innerReq.end();
    },
    /**
     * 获取PV/UV数据
     * @param pid
     * @param path
     * @param startDay
     * @param endDay
     * @param callback
     */
    getViewData: function(pid, apppath, startDay, endDay, callback, onFailCallback) {
        var options = this._getReqOptions(CONFIG_PHP_VIEW);
        this._request(options, pid, apppath, startDay, endDay, null, callback, onFailCallback);
    },
    /**
     * 获取点击数据
     * @param pid
     * @param path
     * @param startDay
     * @param endDay
     * @param callback
     */
    getClickData: function(pid, apppath, startDay, endDay, flag, callback, onFailCallback) {
        var options = this._getReqOptions(CONFIG_PHP_CLICK);
        this._request(options, pid, apppath, startDay, endDay, flag, callback, onFailCallback);
    },
    /**
     * 获取UA数据
     * @param pid
     * @param path
     * @param startDay
     * @param endDay
     * @param callback
     */
    getUaData: (function() {
        var options = {
            host: CONFIG_SERVICE_HOST,
            port: CONFIG_SERVICE_PORT,
            path: '/log/api/getua',
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        };
        return function(pid, path, startDay, endDay, callback) {
            this._request(options, pid, path, startDay, endDay, null, callback);
        };
    }),
    /**
     * 获取自定义数据
     * @param pid
     * @param path
     * @param startDay
     * @param endDay
     * @param callback
     */
    getExtendData: (function() {
        var options = {
            host: CONFIG_SERVICE_HOST,
            port: CONFIG_SERVICE_PORT,
            path: '/log/api/getextend',
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        };
        return function(pid, path, startDay, endDay, callback) {
            this._request(options, pid, path, startDay, endDay, null, callback);
        };
    })
};

/**
 * 获取访问数据
 * @param config
 */
exports.getViewData = function(config) {
    _pri.getViewData(config.pid, config.path, config.startDay, config.endDay, config.callback);
};

/**
 * 获取点击数据
 * @param config
 */
exports.getClickData = function(config) {
    _pri.getClickData(config.pid, config.path, config.startDay, config.endDay, config.flag, config.callback, config.onFailCallback);
};






