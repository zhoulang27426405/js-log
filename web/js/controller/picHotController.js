/**
 * Created by jinguangguo on 2014/12/23.
 */
/**
 * Created by jinguangguo on 2014/11/21.
 */
app.controller('picHotController', function($scope, $location, appService, products, $routeParams, util, iframeService) {
    var phash = $routeParams.phash;
    var pinfo = _.findWhere(products, {hash: phash});
    $scope.productInfo = pinfo;

    var _pri = {
        /**
         * 当目标页面渲染完毕之后，会通知当前父页面，
         * 从而触发请求获取数据，再把数据传给子页面，进行绘制
         */
        addListenToInnder: function() {
            /**
             * 监听iframe内部的页面是否已经加载完毕
             * 如果加载完毕，开始触发请求拿数据
             * @param conf
             */
            crossDomainOuter.onInnerWindowLoaded = function(conf) {
                iframeService.setIframeWidth(conf.winWidth);
                iframeService.setIframeHeight(conf.winHeight);
                _pri.fetchDataAndRender({
                    appPath: pinfo.defaults.path,
                    recent: pinfo.defaults.recent_hot,
                    pid: pinfo.pid
                });
            };

            crossDomainOuter.onInnerJsReady = function(conf) {
                var innerWindow = iframeService.getIframe().contentWindow;
                crossDomainOuter.postMessage({
                    type: "event",
                    eventName: "LaodingTarget",
                    param: {}
                }, innerWindow);
            };
        },
        /**
         *
         * @param config
         * {
         *  appPath
         *  recent
         *  pid
         *
         *  startDay,
         *  endDay
         * }
         */
        fetchDataAndRender: function(config) {
            this.sendDoingToInner();
            $scope.loading = true;
            if (config.recent) {
                appService.fetchPicHot({
                    appPath: config.appPath,
                    recent: config.recent,
                    pid: config.pid
                }, function(data) {
                    _pri.sendDataToInner(data);
                    $scope.loading = false;
                }, function(data) {
                    $scope.loading = false;
                    _pri.sendWrongMessageToInner(data);
                    if (typeof data !== 'object') {
                        data = {
                            msg: '数据请求超时，请稍候重试'
                        };
                    }
                    alert(data.msg);
                });
            } else {
                appService.fetchPicHot({
                    appPath: config.appPath,
                    startDay: config.startDay,
                    endDay: config.endDay,
                    pid: config.pid
                }, function(data) {
                    _pri.sendDataToInner(data);
                    $scope.loading = false;
                }, function(data) {
                    $scope.loading = false;
                    _pri.sendWrongMessageToInner(data);
                    if (typeof data !== 'object') {
                        data = {
                            msg: '数据请求超时，请稍候重试'
                        };
                    }
                    alert(data.msg);
                });
            }
        },
        sendDoingToInner: function() {
            var innerWindow = iframeService.getIframe().contentWindow;
            crossDomainOuter.postMessage({
                type: "event",
                eventName: "Doing",
                param: {
                }
            }, innerWindow);
        },
        sendWrongMessageToInner: function(data) {
            var innerWindow = iframeService.getIframe().contentWindow;
            crossDomainOuter.postMessage({
                type: "event",
                eventName: "ServerWrong",
                param: {
                    type: 'type_hot',
                    data: data
                }
            }, innerWindow);
        },
        /**
         * 向子页面传递数据
         * @param data
         */
        sendDataToInner: function(data) {
            var innerWindow = iframeService.getIframe().contentWindow;
            crossDomainOuter.postMessage({
                type: "event",
                eventName: "ReceiveMessage",
                param: {
                    type: 'type_hot',
                    heatmapData: data
                }
            }, innerWindow);
        },
        initSemantic: function() {
            $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
                $('.ui.selection.dropdown').dropdown();
            });
        },
        /**
         * 初始化门面
         */
        init: function() {
            $scope.loading = true;
            this.initSemantic();
            iframeService.buildIframe({
                $container: $('.pic-content'),
                src: pinfo.defaults.src
            });
            this.addListenToInnder();
        }
    };

    _pri.init();

    $scope.render = function() {
        $scope.loading = true;
        var $searchForm = $('#searchForm');
        var condition = {
            pid: pinfo.pid
        };
        condition.appPath = $searchForm.find('input[name="apppath"]').val();
        condition.recent = $searchForm.find('input[name="recent"]').val();
        if (condition.recent === '-1') {
            var startDay = $searchForm.find('input[name="startDay"]').val();
            var endDay = $searchForm.find('input[name="endDay"]').val();
            var rangeDay = util.getRightRangeDay(startDay, endDay);
            if (rangeDay) {
                delete condition.recent;
                condition.startDay = rangeDay.startDay.replace(/-/g, '');
                condition.endDay = rangeDay.endDay.replace(/-/g, '');
            } else {
                return;
            }
        }
        if (iframeService.getCurrentSrc() !== condition.appPath) {
            iframeService.buildIframe({
                $container: $('.pic-content'),
                src: condition.appPath
            });
            /**
             * 监听iframe内部的页面是否已经加载完毕
             * 如果加载完毕，开始触发请求拿数据
             * @param conf
             */
            crossDomainOuter.onInnerWindowLoaded = function(conf) {
                iframeService.setIframeWidth(conf.winWidth);
                iframeService.setIframeHeight(conf.winHeight);
                _pri.fetchDataAndRender(condition);
            };
        } else {
            _pri.fetchDataAndRender(condition);
        }
    };

    $scope.selectDate = function() {
        $scope.isSelectDate = true;
    };

    $scope.selectRange = function() {
        $scope.isSelectDate = false;
    };
});