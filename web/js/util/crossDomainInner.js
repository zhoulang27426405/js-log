/**
 * 跨域通信及渲染log
 * Created by jinguangguo on 2014/12/3.
 */
(function(obj){
    var crossDomainInner = {
        /**
         * 以下是可监听的事件列表
         - onError(errMessage, errObject)	//发生错误
         - onWarn(warnMessage)				//发生警告，非致命错误
         - onMessage(message)				//收到消息
         - onPostMessage(message, targetWindow)	//发送消息
         */
        //唯二给外界暴漏的方法
        postMessage: function(message){
            if(typeof message === "object"){
                message = this.stringify(message);
            }
            if(typeof message !== "string"){
                this.dispatchEvent("Error", ["发送的信息格式出现问题"]);
                return;
            }
            var targetWindow = window.parent;
            this.sendMessage(message, targetWindow);
            this.dispatchEvent("PostMessage", [message, targetWindow]);
        },
        //设置事件代理，将所有事件直接监听
        setEventDelegate: function(obj){
            this._eventDelegate = obj;
        },
        //以下为内部实现的方法，外界不需关心
        DEBUG: false,
        _eventDelegate: this,
        //将对象字符串化
        stringify : function (obj) {
            var t = typeof (obj), callee = arguments.callee;
            if (t != "object" || obj === null) {
                // simple data type
                if (t == "string") obj = '"' + obj + '"';
                return String(obj);
            } else {
                if(typeof JSON == "object" && JSON.stringify){
                    return JSON.stringify(obj);
                }
                // recurse array or object
                var n, v, json = [], arr = (obj && obj.constructor == Array);

                for (n in obj) {
                    v = obj[n];
                    t = typeof(v);
                    if (obj.hasOwnProperty(n)) {
                        if (t == "string") v = '"' + v + '"'; else if (t == "object" && v !== null) v = callee(v);
                        json.push((arr ? "" : '"' + n + '":') + String(v));
                    }
                }
                return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
            }
        },
        //格式化JSON
        parseJSON: function( data ) {
            var rvalidchars = /^[\],:{}\s]*$/,
                rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
                rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
                rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;

            if ( typeof data === "object"){
                return data;
            }
            if ( typeof data !== "string" || !data ) {
                return null;
            }
            // Make sure leading/trailing whitespace is removed (IE can't handle it)
            data = data.replace(/(^\s+)|(\s+$)/g, "");
            // Make sure the incoming data is actual JSON
            // Logic borrowed from http://json.org/json2.js
            if ( rvalidchars.test(data.replace(rvalidescape, "@")
                .replace(rvalidtokens, "]")
                .replace(rvalidbraces, "")) ) {
                // Try to use the native JSON parser first
                return window.JSON && window.JSON.parse ?
                    window.JSON.parse( data ) :
                    (new Function("return " + data))();
            } else {
                // throw( "Invalid JSON: " + data );
                return data;
            }
        },
        dispatchEvent: function(e, args){
            var delegate = this;
            if(this._eventDelegate){
                delegate = this._eventDelegate;
            }
            if(typeof delegate["on" + e] === "function"){
                if(delegate.DEBUG) console.log('[LOG] call the delegate function `on' + e + '` of the crossDomainInner obj:', delegate ,' successful');
                //判断去掉 IE报错
                if(Object.prototype.toString.call(args) === '[object Array]'){
                    delegate["on" + e].apply(delegate, args);
                }else{
                    delegate["on" + e].apply(delegate);
                }
                return delegate;
            }
            if(delegate.DEBUG) console.log('[WARN] the delegate function `on' + e + '` of the crossDomainInner is not a function');
            return false;
        },
        //检查浏览器支持的跨域类型
        _supportPostMessage : (function() {
            if (window.postMessage) {
                try {
                    if (window.postMessage.toString().indexOf('[native code]') >= 0) {
                        return true;
                    } else {
                        this.dispatchEvent("Warn",["浏览器原生的postMessage方法似乎已被覆盖，跨域模块可能工作不正常"]);
                    }
                } catch (e) {
                    return true;
                }
            }
            return false;
        }).call(this),
        //初始化事件监听
        bind: function(el, type, fn){
            if (!el || typeof fn != 'function') {
                return;
            }
            if (el.addEventListener) {
                el.addEventListener(type, fn, false);
            } else if (el.attachEvent) {
                el.attachEvent('on' + type, fn);
            }
        },
        sendMessage: function(message, targetWindow){
            if(this._supportPostMessage){
                //浏览器支持postMessage
                targetWindow.postMessage(message, "*");
            }else{
                targetWindow.name = message;
            }
        },
        //初始化方法，必须调用
        init: function(){
            var _this = this;
            this._eventDelegate = this;
            var dispatchMsg = function(msg){
                //发送的是事件数据, 为交互设计
                if(msg.type === "event"){
                    //msg.param 需要是数据类型数据
                    _this.dispatchEvent(msg.eventName, [msg.param]);
                    // }else if(msg.messageContent){
                    // 	_this.dispatchEvent("Message", [msg.messageContent]);
                }else{
                    _this.dispatchEvent("Message", [msg]);
                }
            };
            if(this._supportPostMessage){
                //绑定接收消息
                this.bind(window, 'message', function(event){
                    if(event.data){
                        var msg = _this.parseJSON(event.data);
                        dispatchMsg(msg);
                    }
                });
            }else{
                window.name = "";
                _this.windowName = window.name;
                setInterval(function(){
                    if(window.name != _this.windowName && window.name !== ""){
                        _this.windowName = window.name;
                        var msg = _this.parseJSON(_this.windowName);
                        dispatchMsg(msg);
                        setTimeout(function(argument) {
                            window.name = "";
                            _this.windowName = "";
                        }, 20);
                    }
                }, 100);
            }
        }
    };
    crossDomainInner.init();
    if(obj){
        obj.crossDomainInner = crossDomainInner;
    }else{
        window.crossDomainInner = crossDomainInner;
    }
})();

// 当页面准备就绪之后，开始渲染
(function(win, doc) {
    var TYPE_PIC_CLICK = 'type_click';
    var TYPE_PIC_HOT = 'type_hot';
    var _pri = {
        logContainer: null,
        canvas: null,
        showCanvas: function(text) {
            if (this.canvas) {
                this.removeCanvas();
            }
            var canvas = document.createElement('div');
            canvas.style.position = 'fixed';
            canvas.style.left = 0;
            canvas.style.top = 0;
            canvas.style.zIndex = 99999998;
            canvas.style.opacity = 0.8;
            canvas.style.backgroundColor = '#FFF';
            canvas.style.paddingTop = '50px';
            canvas.style.width = doc.body.scrollWidth + 'px';
            canvas.style.height = doc.body.scrollHeight + 'px';
            canvas.style.fontWeight = 'bold';
            canvas.innerHTML = '<div style="margin-top:50px;text-align:center;">' + text + '</div>';
            doc.body.appendChild(canvas);
            this.canvas = canvas;
        },
        removeCanvas: function() {
            if (this.canvas) {
                doc.body.removeChild(this.canvas);
                this.canvas = null;
            }
        },
        /**
         * 嵌入log遮罩层
         * @returns {HTMLElement}
         */
        createLogContainer: function() {
            var c = document.createElement('div');
            c.className = 'cloud-log-container';
            c.style.position = 'absolute';
            c.style.width = doc.body.scrollWidth + 'px';
            c.style.height = doc.body.scrollHeight + 'px';
            c.style.left = 0;
            c.style.top = 0;
            c.style.zIndex = 99999999;
            c.style.opacity = 0.8;
            c.style.overflowY = 'hidden';
            c.style.overflowX = 'auto';
            this.logContainer = c;
            return c;
        },
        clearLogContainer: function() {
            if (this.logContainer) {
                doc.body.removeChild(this.logContainer);
                this.logContainer = null;
            }
        },
        clearHeapmatContainer: function() {
            if (doc.querySelector('.heatmap-canvas')) {
                doc.body.removeChild(doc.querySelector('.heatmap-canvas'));
            }
        },
        getClickDoms: (function() {
            var getItemDom = function(conf) {
                return '<div class="click-item" data-tag="' + encodeURIComponent(conf.tag) + '" style="border:1px solid #000;opacity:0.71;position:absolute;left:'
                                + conf.left + 'px;top:' + conf.top + 'px;' +
                                'width:' + conf.width + 'px;height:' + conf.height + 'px;' +
                                'background-color:' + conf.bgcolor + ';text-align:right;">'
                            + '<span style="opacity:1;color:blue;background-color: #FFF;font-size:10px;">' + conf.value + '</span>'
                        +'</div>';
            };
            return function(itemList) {
                var doms = [],
                    item,
                    dom;
                var errorXpath = [];
                for (var i = 0; i < itemList.length; i++) {
                    item = itemList[i];
                    try {
                        dom = this.getDomByXPath(item.tag);
                    } catch (e) {
                        errorXpath.push(item.tag);
                        continue;
                    }
                    if (dom) {
                        item.width = dom.offsetWidth;
                        item.height = dom.offsetHeight;
                        /*item.top = dom.offsetTop + doc.body.offsetTop;
                         item.left = dom.offsetLeft + doc.body.offsetLeft;*/
                        item.top = $(dom).offset().top;
                        item.left = $(dom).offset().left;
                        // 有内容，才渲染
                        if (item.width && item.height) {
                            doms.push(getItemDom(item));
                        }
                    }
                }
                if (errorXpath.length > 0 && console && console.log) {
                    console.log('The xpath has can\'t resolved ones and the length is ' + errorXpath.length
                        + '. And the xpath of wrong array is ===================\n' + errorXpath.join('\n'));
                }
                return doms.join('');
            };
        })(),
        getDomByXPath: function(path) {
            var evaluator = new XPathEvaluator,
                result = evaluator.evaluate(path, document.documentElement, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            return result.singleNodeValue;
        },
        /**
         * 这里进行循环判定，是为了必须要等到对应的dom ready之后，
         * 才可以通过xpath来解析出来对应的dom
         * 这里仅仅是判断3次，如果都没有，那么数据有误
         * @param {Array} items 后端点击数据，如
         * {
             "id": "2",
             "pid": "1",
             "path": "/",
             "tag": "//*[@id=\"handpickTab\"]",
         "value": "10",
         "time": "1416240000"
         },
         */
        loopRenderClick: (function() {
            var doRender = function(clickDoms) {
                _pri.removeCanvas();
                var container =_pri.createLogContainer();
                container.innerHTML = clickDoms;
                doc.body.appendChild(container);
            };
            return function(items) {
                _pri.showCanvas('正在绘制，请稍候...');
                // 没有数据
                if (items.length === 0) {
                    _pri.showCanvas('指定日期内，没有数据！');
                } else {
                    var clickDoms = _pri.getClickDoms(items);
                    doRender(clickDoms);
                    _pri.removeCanvas();
                }
            };
        })(),
        /**
         * 窗口就绪后，即可渲染热力图
         */
        renderHot: (function() {
            var getHeatMapData = function(data, scrollWidth, scrollHeight) {
                var points = [];
                var list = data.data;
                var item;
                var dom;
                var errorXpath = [];
                var zeroXpath = [];
                var timerStart = new Date().getTime();
				if (console && console.log) {
					console.log('【rover】The length of all data is ' + list.length);
				}
                for (var i = 0; i < list.length; i++) {
                    item = list[i];
                    /*if(item.x == 0 && item.y == 0) {
//                        console.log('[tag error]' + item.tag);
                        zeroXpath.push(item.tag);
                    } else {
                        points.push({
                            x: Math.round(scrollWidth * item.x),
                            y: Math.round(scrollHeight * item.y),
                            value: item.value
                        });
                    }*/
                   /*
                    points.push({
                        x: Math.round(scrollWidth * item.x),
                        y: Math.round(scrollHeight * item.y),
                        value: item.value
                    });
                    */

                    // 需要知道有多少脏数据
                    // 无法解析的xpath
                    try {
                        dom = _pri.getDomByXPath(item.tag);
                    } catch (e) {
                        errorXpath.push(item.tag);
                        console.log('[tag error]' + item.tag);
                        continue;
                    }
                    
                    if (dom) {
                        item.width = dom.offsetWidth;
                        item.height = dom.offsetHeight;
                        // 有内容，才渲染
                        if (item.width && item.height) {
                            points.push({
                                x: Math.round(scrollWidth * item.x),
                                y: Math.round(scrollHeight * item.y),
                                value: item.value
                            });
//                            console.log('[tag ok]' + item.tag);
                        }
                    }
                    
                }
                var timerEnd = new Date().getTime();
                if (console && console.log) {
                    console.log('【rover】getHeatMapData takes time ：' + (timerEnd - timerStart) + 'ms');
                }
                if (zeroXpath.length > 0 && console && console.log) {
                    console.log('The xpath has zero 坐标 ones and the length is ' + zeroXpath.length
                        + '. And the xpath of wrong array is ===================\n' + zeroXpath.join('\n'));
                }
                if (errorXpath.length > 0 && console && console.log) {
                    console.log('The xpath has can\'t resolved ones and the length is ' + errorXpath.length
                        + '. And the xpath of wrong array is ===================\n' + errorXpath.join('\n'));
                }
                return {
                    max: data.max,
                    data: points
                };
            };
            return function(data) {
                _pri.showCanvas('正在绘制，请稍候...');
                if (data instanceof Array && data.length === 0) {
                    _pri.showCanvas('指定日期内，没有数据！');
                } else {
                    var scrollWidth = doc.body.scrollWidth;
                    var scrollHeight = doc.body.scrollHeight;
                    doc.body.style.width = scrollWidth + 'px';
                    doc.body.style.height = scrollHeight + 'px';
                    var heatmapInstance = window.h337.create({
                        // only container is required, the rest will be defaults
                        container: doc.body
                    });
                    var heatmapData = getHeatMapData(data, scrollWidth, scrollHeight);
                    // 渲染
                    var timerStart = new Date().getTime();
                    heatmapInstance.setData(heatmapData);
                    var timerEnd = new Date().getTime();
                    if (console && console.log) {
                        console.log('【rover】heatmap render takes time ：' + (timerEnd - timerStart));
                    }
                    var canvasDom = document.getElementsByTagName('canvas')[0];
                    canvasDom.style.opacity = 0.75;
                    canvasDom.style.zIndex = 9999999999;
                    _pri.removeCanvas();
                }
            };
        })(),
        init: function() {
            crossDomainInner.postMessage({
                type : "event",
                eventName : "InnerJsReady"
            });
            /**
             * 当页面就绪之后，通知父元素，将数据传入到子元素
             */
            win.addEventListener('load', function() {
                crossDomainInner.postMessage({
                    type : "event",
                    eventName : "InnerWindowLoaded",
                    param: {
                        winWidth: doc.body.scrollWidth,
                        winHeight: doc.body.scrollHeight
                    }
                });
            }, false);

            crossDomainInner.onLaodingTarget = function(data) {
                _pri.showCanvas('目标页面加载中...');
            };

            crossDomainInner.onDoing = function(data) {
                _pri.clearLogContainer();
                _pri.clearHeapmatContainer();
                _pri.showCanvas('正在处理，请稍候...');
            };

            crossDomainInner.onServerWrong = function(data) {
                data = data || {
                    msg: '数据请求超时，请稍候重试'
                };
                _pri.showCanvas(data.msg);
            };

            /**
             * 接收父元素传递过来的数据
             * @param data
             */
            crossDomainInner.onReceiveMessage = function(data) {
                // 数值图
                if (data.type === TYPE_PIC_CLICK) {
                    // 清除所有已经绘制的内容
                    _pri.clearLogContainer();
                    var clicks = data.list;
                    _pri.loopRenderClick(clicks);
                }
                // 热力图
                else if (data.type === TYPE_PIC_HOT) {
                    // 清除所有已经绘制的内容
                    _pri.clearHeapmatContainer();
                    _pri.renderHot(data.heatmapData);
                }
                else {
                    throw new Error('Please check the type !!!');
                }
            };
        }
    };
    var _pub = {
        render: function() {
            _pri.init();
        }
    };
    _pub.render();
})(window, document);