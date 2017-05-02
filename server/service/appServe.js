/**
 * Created by jinguangguo on 2014/11/21.
 */
var expect = require('expect.js');
var commonServe = require('./commonServe.js');
var log4js = require('log4js');
var logger = log4js.getLogger();

// 直达号产品ID
var CONFIG_PRODUCT_ID = 1;
var CONFIG_PIC_CLICK_FLAG = 1;  // 点击图
var CONFIG_PIC_HOT_FLAG = 0;    // 热力图


var _pri = {
    parseDayToTime: function(days) {
        return days * 24 * 60 * 60 * 1000;
    },

    parseToDate: function(time) {
        var date = new Date(time * 1000);
        var year = date.getYear() + 1900;
        var month = date.getMonth() + 1;
        var day = date.getDate();
        return year + '-' + month + '-' + day + '';
    },

    formatToDate: function(dateTime) {
        dateTime = new Date(dateTime);
        var year = dateTime.getFullYear();
        var month = dateTime.getMonth() + 1;
        var date = dateTime.getDate();
        var datestr = '' + year
                + (String(month).length < 2 ? "0" + month : month)
                + (String(date).length < 2 ? "0" + date : date);
        return datestr;
    },

    getRangeByRecentDay: function(recentDay) {
        recentDay = recentDay - 1;
        var yestoday = new Date().getTime() - this.parseDayToTime(1);
        var minus = this.parseDayToTime(recentDay);
        var startDay = this.formatToDate(yestoday - minus);
        var endDay = this.formatToDate(yestoday);
        logger.warn('The request of start day is ' + startDay);
        logger.warn('The request of end day is ' + endDay);
        return {
            startDay: startDay,
            endDay: endDay
        }
    }
};

/**
 * 近期7天/15天/30天等，或者自定义天数
 * @param config
 */
exports.requestPvUvDataOfRecent = function(pid, appPath, recentDay, onSuccessCallback) {
    // 根据最近天数来计算开始时间和结束时间
    var rangeDay = _pri.getRangeByRecentDay(recentDay);
    commonServe.getViewData({
        pid: pid,
        path: appPath,
        startDay: '20150218',
        endDay: '20150225',
        callback: function(data) {
            onSuccessCallback(data);
        }
    });
};

/**
 * 时间范围内的pv和uv数据
 * @param startDay
 * @param endDay
 * @param path
 * @param onSuccessCallback
 */
exports.requestPvUvDataOfRange = function(pid, appPath, startDay, endDay, onSuccessCallback) {
    commonServe.getViewData({
        pid: pid,
        path: appPath,
        startDay: startDay,
        endDay: endDay,
        callback: function(data) {
            onSuccessCallback(data);
        }
    });
};

/**
 * TODO 对比时间范围内的pv和uv数据
 */
exports.requestPvUvDataOfCompare = function() {

};

var getClickListData = function(list) {
    var hash = {},
        item,
        val,
        max = 0,
        min = 9999999999,
        resultList = [];
    for (var i = 0; i < list.length; i++) {
        item = list[i];
        val = parseInt(item.value, 10);
        if (hash[item.tag]) {
            hash[item.tag] = hash[item.tag] + val;
        } else {
            hash[item.tag] = val;
        }
    }
    for (var key in hash) {
        resultList.push({
            tag: key,
            value: hash[key]
        });
        /*// 计算max和min
        if (hash[key] > max) {
            max = hash[key];
        }
        if (hash[key] < min) {
            min = hash[key];
        }*/
    }
    return {
        list: resultList
    };
};

var getClickListDataNew = (function() {
    var merge = function(list) {
        var listFarther = list;
        var listChild = list;
        var itemFarther;
        var itemChild;
        for (var j = list.length - 1; j >= 0; j--) {
            itemFarther = listFarther[j];
            //                    console.log('itemFarther【' + j + '】' + itemFarther.tag);
            for (var k = list.length - 1; k >= 0; k--) {
                itemChild = listChild[k];
                //                        console.log('=============itemChild【' + k + '】' + itemChild.tag);
                // 子元素比父元素的长度小
                if (itemChild.tag.length <= itemFarther.tag.length) {
                    continue;
                } else {	// 此时父元素要短一些
                    // 不是父子关系
                    if (itemChild.tag.indexOf(itemFarther.tag) === -1) {
                        continue;
                    } else {
                        itemFarther.value = parseFloat(itemFarther.value, 10) + parseFloat(itemChild.value, 10);
                        listChild.splice(k, 1);
                    }
                }
            }
        }
        return list;
    };
    return function(dataList) {
        var aReg = /\S*a\[\S*$/; // 收集a结尾的标签
        var inputReg = /\S*input\[\S*$/;
        var buttonReg = /\S*button\[\S*$/;
        var textareaReg = /\S*textarea\[\S*$/;
        /*var resultList = _.filter(dataList, function(item) {
         return aReg.test(item.tag) || inputReg.test(item.tag)
         || buttonReg.test(item.tag) || textareaReg.test(item.tag);
         });*/
        var resultList = [],
            len = dataList.length,
            hash = {},
            item,
            val,
            max = 0,
            min = 9999999999;
        // flag=1的数组
        for (var i = 0; i < len; i++) {
            item = dataList[i];
            item.tag = item.tag.trim();
            val = parseInt(item.value, 10);
            if (item.flag == 1) {
                if (hash[item.tag]) {
                    hash[item.tag] = hash[item.tag] + val;
                } else {
                    hash[item.tag] = val;
                }
            } else {
                if (aReg.test(item.tag) || inputReg.test(item.tag)
                    || buttonReg.test(item.tag) || textareaReg.test(item.tag)) {
                    if (hash[item.tag]) {
                        hash[item.tag] = hash[item.tag] + val;
                    } else {
                        hash[item.tag] = val;
                    }
                }
            }
        }
        for (var key in hash) {
            resultList.push({
                tag: key,
                value: hash[key]
            });
            /*// 计算max和min
            if (hash[key] > max) {
                max = hash[key];
            }
            if (hash[key] < min) {
                min = hash[key];
            }*/
        }

        // 整合
        resultList = merge(resultList);
        return {
            list: resultList
        };
    };
})();

/**
 * 近期7天/15天/30天等，或者自定义天数
 * @param pid
 * @param appPath
 * @param startDay
 * @param endDay
 * @param onSuccessCallback
 */
exports.requestClickDataOfRecent = function(pid, appPath, recentDay, onSuccessCallback, onFailCallback) {
    // 根据最近天数来计算开始时间和结束时间
    var rangeDay = _pri.getRangeByRecentDay(recentDay);
    commonServe.getClickData({
        pid: pid,
        path: appPath,
        startDay: rangeDay.startDay,
        endDay: rangeDay.endDay,
//        flag: CONFIG_PIC_CLICK_FLAG,  // 临时添加
        callback: function(data) {
            data = getClickListDataNew(data);
            onSuccessCallback(data);
        },
        onFailCallback: function(data) {
            onFailCallback(data);
        }
    });
};

/**
 * 时间范围内的点击数据
 * @param pid
 * @param appPath
 * @param startDay
 * @param endDay
 * @param onSuccessCallback
 */
exports.requestClickDataOfRange = function(pid, appPath, startDay, endDay, onSuccessCallback, onFailCallback) {
    // 根据最近天数来计算开始时间和结束时间
    commonServe.getClickData({
        pid: pid,
        path: appPath,
        startDay: startDay,
        endDay: endDay,
//        flag: CONFIG_PIC_CLICK_FLAG,  // 临时添加
        callback: function(data) {
            data = getClickListDataNew(data);
            onSuccessCallback(data);
        },
        onFailCallback: function(data) {
            onFailCallback(data);
        }
    });
};

/**
 * 近期7天/15天/30天等，或者自定义天数，热力图数据
 * @param pid
 * @param appPath
 * @param recentDay
 * @param onSuccessCallback
 *
 * 注意：这里不需要对返回的数据进行处理，源于heatmap框架可自行接收所有数据
 */
exports.requestHotDataOfRecent = function(pid, appPath, recentDay, onSuccessCallback, onFailCallback) {
    // 根据最近天数来计算开始时间和结束时间
    var rangeDay = _pri.getRangeByRecentDay(recentDay);
    commonServe.getClickData({
        pid: pid,
        path: appPath,
        startDay: rangeDay.startDay,
        endDay: rangeDay.endDay,
        callback: function(data) {
            onSuccessCallback(data);
        },
        onFailCallback: function(data) {
            onFailCallback(data);
        }
    });
};

/**
 * 时间范围内的热力图数据
 * @param pid
 * @param appPath
 * @param recentDay
 * @param onSuccessCallback
 *
 * 注意：这里不需要对返回的数据进行处理，源于heatmap框架可自行接收所有数据
 */
exports.requestHotDataOfRange = function(pid, appPath, startDay, endDay, onSuccessCallback, onFailCallback) {
    commonServe.getClickData({
        pid: pid,
        path: appPath,
        startDay: startDay,
        endDay: endDay,
        callback: function(data) {
            onSuccessCallback(data);
        },
        onFailCallback: function(data) {
            onFailCallback(data);
        }
    });
};

/**
 * 获取浏览器类型判断
 * 近期7天/15天/30天等，或者自定义天数
 * @param config
 */
exports.requestUaDataOfRecent = function(pid, appPath, recentDay, onSuccessCallback) {
    // 根据最近天数来计算开始时间和结束时间
    var rangeDay = _pri.getRangeByRecentDay(recentDay);
    /*commonServe.getViewData({
        pid: pid,
        path: appPath,
        startDay: '20150218',
        endDay: '20150225',
        callback: function(data) {
            onSuccessCallback(data);
        }
    });*/
    var data = {
        "errno": 0,
        "list": [
            {
                "id": "153",
                "pid": "100",
                "path": "http://m.baidu.com/lightapp",
                "chrome": "9",
                "firefox": '8',
                "ie": "7",
                "opera": "6",
                "safari": '5',
                "other": '3',
                "time": '1416672000'
            }
        ]
    };
    onSuccessCallback(data);
};
