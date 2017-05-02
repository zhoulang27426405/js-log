/**
 * Created by jinguangguo on 2014/11/18.
 */
app.factory('appService', function ($http, clickColorService) {
    var _pri = {
        /**
         * echart数据格式化
         * @param list
         * @returns {{dateArray: *, pvDataArray: *, uvDataArray: *}}
         */
        getFormatedDataForPvuv: function(list) {
            var dateArray = _.map(list, function(item, index) {
                var date = new Date(item.time * 1000);
                var year = date.getYear() + 1900;
                var month = date.getMonth() + 1;
                var day = date.getDate();
                return year + '/' + month + '/' + day + '';
            });
            var pvArray = _.map(list, function(item, index) {
                return item.pv;
            });
            var uvArray = _.map(list, function(item, index) {
                return item.uv;
            });
            return {
                dateArray: dateArray,
                pvDataArray: pvArray,
                uvDataArray: uvArray
            }
        },
        /**
         * 临时添加
         * @param data
         * @returns {*}
         */
        getFormatedDataForClick: function(data) {
            /*var reg = /^id\(\"\w+\"\)$/;
            var a$ = /a\[@class=\"\w+\"\]$/; // 收集a结尾的标签
            var resultList = _.filter(data.list, function(item) {
                return reg.test(item.tag);
            });*/
            var resultList = data.list;
            var max = 0;
            var min = 999999999;
            var item;
            // 遍历数据获取最大点和最小点
            for (var i = 0, len = resultList.length; i < len; i++) {
                item = resultList[i];
                // 计算max和min
                if (item.value > max) {
                    max = item.value;
                }
                if (item.value < min) {
                    min = item.value;
                }
            }
            clickColorService.setRange(min, max);
            _.map(resultList, function(item) {
                item.bgcolor = clickColorService.getColorByVal(item.value);
            });
            return resultList;
        },
        /**
         * 根据热力图框架，来格式化需要传递的参数
         * @param data
         * @returns {*}
         */
        getFormatedDataForHot: function(data) {
            var points = [];
            var max = 0;
            var timerStart = new Date().getTime();
            _.each(data, function(item) {
                var val = parseInt(item.value, 10);
                max = Math.max(max, val);
                points.push({
                    tag: item.tag,
                    x: parseFloat(item.px, 10),
                    y: parseFloat(item.py, 10),
                    value: val
                });
            });
            var timerEnd = new Date().getTime();
            if (console && console.log) {
                console.log('【apService】getFormatedDataForHot takes time ：' + (timerEnd - timerStart));
            }
            return {
                max: max,
                data: points
            }
        }
    };

    var _pub = {
        /**
         *
         * @param config
         */
        fetchPvUv: function(config, onSuccessCallback, onFailCallback) {
            var reqObj = {
                params: config
            };
            $http.get('/pvuv', reqObj).success(function(data) {
                var echartData = [];
                if (data.errno === 0) {
                    if (data.list.length !== 0) {
                        // 格式化数据
                        echartData = _pri.getFormatedDataForPvuv(data.list);
                    }
                    if (onSuccessCallback && _.isFunction(onSuccessCallback) === true) {
                        onSuccessCallback(echartData);
                    }
                } else {
                    if (config.onFailCallback && _.isFunction(config.onFailCallback) === true) {
                        config.onFailCallback(echartData);
                    }
                }
            }).error(function(data, status, headers, config) {

            });
        },
        /**
         * 获取数值图
         */
        fetchPicClick: function(config, onSuccessCallback, onFailCallback) {
            $http({
                method: 'get',
                url: '/click',
                params: config,
                cache: false
            }).success(function(data) {
                var clickData = [];
                if (data.errno === 0) {
                    if (data.list.length !== 0) {
                        clickData = _pri.getFormatedDataForClick(data);
                    }
                    if (onSuccessCallback && _.isFunction(onSuccessCallback) === true) {
                        onSuccessCallback(clickData);
                    }
                } else {
                    if (onFailCallback && _.isFunction(onFailCallback) === true) {
                        onFailCallback(data);
                    }
                }
            }).error(function() {
                if (onFailCallback && _.isFunction(onFailCallback) === true) {
                    onFailCallback();
                }
            });


        },
        /**
         * 获取热力图数据
         */
        fetchPicHot: function(config, onSuccessCallback, onFailCallback) {
            $http({
                method: 'get',
                url: '/hot',
                params: config,
                cache: false
            }).success(function(data) {
                var heatmapData = [];
                if (data.errno === 0) {
                    if (data.list.length !== 0) {
                        heatmapData = _pri.getFormatedDataForHot(data.list);
                    }
                    if (onSuccessCallback && _.isFunction(onSuccessCallback) === true) {
                        onSuccessCallback(heatmapData);
                    }
                } else {
                    if (onFailCallback && _.isFunction(onFailCallback) === true) {
                        onFailCallback(data);
                    }
                }
            }).error(function() {
                if (onFailCallback && _.isFunction(onFailCallback) === true) {
                    onFailCallback();
                }
            });
        }
    };

    return _pub;
});