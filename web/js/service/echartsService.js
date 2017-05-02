/**
 * Created by jinguangguo on 2014/11/19.
 */
app.factory('echartsService', function () {

    'use strict';

    var _pri = {
        getFormatedOption: function (option) {
            return option;
        }
    };

    var _pub = {
        /**
         *
         * @param option
         * {
         *  @param {domElement} container
         *  @param {Array} dateArray
         *  @param {Array} pvDataArray
         *  @param {Array} uvDataArray
         * }
         */
        showLine: function (config) {
            config = _pri.getFormatedOption(config);
            require(['echarts', 'echarts/chart/line'], function (ec) {
                // 基于准备好的dom，初始化echarts图表
                var myChart = ec.init(config.container);

                var option = {
                    title: {
                        text: 'PV/UV'
                    },
                    tooltip: {
                        show: true
                    },
                    legend: {
                        orient: 'horizontal',
                        x: 'center',
                        borderColor: '#ccc',
                        borderWidth: 0,
                        data: ['PV', 'UV']
                    },
                    toolbox: {
                        show: true,
                        orient: 'horizontal',      // 布局方式，默认为水平布局，可选为：
                        // 'horizontal' ¦ 'vertical'
                        x: 'right',                // 水平安放位置，默认为全图右对齐，可选为：
                        // 'center' ¦ 'left' ¦ 'right'
                        // ¦ {number}（x坐标，单位px）
                        y: 'top',                  // 垂直安放位置，默认为全图顶端，可选为：
                        // 'top' ¦ 'bottom' ¦ 'center'
                        // ¦ {number}（y坐标，单位px）
                        color: ['#1e90ff', '#22bb22', '#4b0082', '#d2691e'],
                        backgroundColor: 'rgba(0,0,0,0)', // 工具箱背景颜色
                        borderColor: '#ccc',       // 工具箱边框颜色
                        borderWidth: 0,            // 工具箱边框线宽，单位px，默认为0（无边框）
                        padding: 5,                // 工具箱内边距，单位px，默认各方向内边距为5，
                        showTitle: true,
                        feature: {
                            mark: {
                                show: true,
                                title: {
                                    mark: '辅助线-开关',
                                    markUndo: '辅助线-删除',
                                    markClear: '辅助线-清空'
                                },
                                lineStyle: {
                                    width: 1,
                                    color: '#1e90ff',
                                    type: 'dashed'
                                }
                            },
                            dataZoom: {
                                show: true,
                                title: {
                                    dataZoom: '区域缩放',
                                    dataZoomReset: '区域缩放-后退'
                                }
                            },
                            dataView: {
                                show: true,
                                title: '数据视图',
                                readOnly: false,
                                lang: ['数据视图', '关闭', '刷新']
                            },
                            magicType: {
                                show: true,
                                title: {
                                    line: '动态类型切换-折线图',
                                    bar: '动态类型切换-柱形图',
                                    stack: '动态类型切换-堆积',
                                    tiled: '动态类型切换-平铺'
                                },
                                type: ['line', 'bar', 'stack', 'tiled']
                            },
                            restore: {
                                show: true,
                                title: '还原',
                                color: 'black'
                            },
                            saveAsImage: {
                                show: true,
                                title: '保存为图片',
                                type: 'jpeg',
                                lang: ['点击本地保存']
                            }
                        }
                    },
                    xAxis: [
                        {
                            type: 'category',
                            position: 'bottom',
                            axisLabel : {
                                show:true,
                                interval: 'auto',    // {number}
                                rotate: 45,
                                margin: 8,
                                formatter: '{value}',
                                textStyle: {
//                                    color: 'blue',
//                                    fontFamily: 'sans-serif',
//                                    fontSize: 15,
//                                    fontStyle: 'italic',
                                    fontWeight: 'bold'
                                }
                            },
                            data: config.dateArray
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            name: 'PV/UV'
                        }
                    ],
                    series: [
                        {
                            "name": "PV",
                            "type": "line",
                            // markPoint : {
                            	// show: true,
                                // data : [
                                    // {type : 'max', name: '最大值'},
                                    // {type : 'min', name: '最小值'}
                                // ]
                            // },
                           	// markLine : {
                               	// data : [
                                   	// {type : 'average', name: '平均值'}
                               	// ]
                           	// },
							itemStyle: {
							   	normal: {
							      	show:true, //显示数据值
							      	label : {
				                        show : true,
				                        textStyle : {
				                            fontSize : '10',
				                            fontFamily : '微软雅黑',
				                            fontWeight : 'bold'
				                        }
				                    }
							   	}
							},
                            "data": config.pvDataArray
                        },
                        {
                            "name": "UV",
                            "type": "line",
                            // markPoint : {
                                // data : [
                                    // {type : 'max', name: '最大值'},
                                    // {type : 'min', name: '最小值'}
                                // ]
                            // },
//                            markLine : {
//                                data : [
//                                    {type : 'average', name: '平均值'}
//                                ]
//                            },
							itemStyle: {
							   normal: {
							      show:true, //显示数据值
							      label : {
				                        show : true,
				                        textStyle : {
				                            fontSize : '10',
				                            fontFamily : '微软雅黑',
				                            fontWeight : 'bold'
				                        }
				                    }
							   }
							},
                            "data": config.uvDataArray
                        }
                    ]
                };

                // 为echarts对象加载数据
                myChart.setOption(option);
            });
        }
    };

    return _pub;
});