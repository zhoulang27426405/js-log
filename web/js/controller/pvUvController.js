/**
 * Created by jinguangguo on 2014/11/18.
 */
app.controller('pvUvController', function($scope, $location, $routeParams, appService, echartsService, util, products) {
    var phash = $routeParams.phash;
    var pinfo = _.findWhere(products, {hash: phash});
    $scope.productInfo = pinfo;

    var _pri = {
        doSuccess: function(data) {
            $scope.loading = false;
            if (data.length !== 0) {
                var option = {
                    container: document.getElementById('charts-container')
                };
                option = _.extend({}, option, data);
                echartsService.showLine(option);
            } else {
                $scope.listData = data;
            }
        },
        /**
         * 开始查找数据
         */
        fetchData: function(config) {
            $scope.loading = true;
            var newConfig = _.extend({}, config, {
                pid: pinfo.pid
            });
            appService.fetchPvUv(newConfig, this.doSuccess);
        },
        size: function() {
            var $container = $('#charts-container');
            var windowWidth = $(window).width();
            var w = Math.max(windowWidth, 960) - 60;
            var h = Math.min(Math.round((w * 3 / 4)), 720);
            $container.width(w).height(h);
        },
        init: function() {
            setTimeout(function() {
                $('.ui.selection.dropdown').dropdown();
            }, 2000);
            this.size();
            this.fetchData({
                appPath: pinfo.defaults.path,
                recent: pinfo.defaults.recent
            });
        }
    };

    _pri.init();

    /**
     *
     * @param condition
     * {
     *      apppath: string,
     *      recent: 7|15|30
     * }
     */
    $scope.render = function(condition) {
        $scope.listData = undefined;
        var $searchForm = $('#searchForm');
        var condition = {};
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
            }
        }
        _pri.fetchData(condition);
    };

    $scope.selectDate = function() {
        $scope.isSelectDate = true;
    };

    $scope.selectRange = function() {
        $scope.isSelectDate = false;
    };
});