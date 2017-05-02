/**
 * Created by jinguangguo on 2014/11/24.
 */
var _console = typeof console !== "undefined" ? console : {
    log: function(){},
    warn: function(){}
};


/**
 * crossPanel
 * design by shaoyifeng
 * 跨域请求的外部模块
 */
//跨域请求模块
var crossDomainOuter = {
    /**
     * 以下是可监听的事件列表
     - onError(errMessage, errObject)	//发生错误
     - onWarn(warnMessage)				//发生警告，非致命错误
     - onMessage(message)				//收到消息
     - onPostMessage(message, targetWindow)	//发送消息
     */
    //唯二给外界暴漏的方法
    postMessage: function(message, targetWindow){
        if(typeof message === "object"){
            message = this.stringify(message);
        }
        if(typeof message !== "string" || !targetWindow){
            this.dispatchEvent("Error", ["发送的信息格式出现问题"]);
            if(this.DEBUG) _console.log("[WARN] the message is not a string type or the target window is not exist.");
            return;
        }
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
        var t = typeof (obj), callee = this.stringify;
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
            if(delegate.DEBUG) _console.log('[LOG] call the delegate function `on' + e + '` of the obj:', delegate ,' successful');
            //判断去掉 IE报错
            if(Object.prototype.toString.call(args) === '[object Array]' || (typeof args === "object" && args.length)){
                delegate["on" + e].apply(delegate, args);
            }else{
                delegate["on" + e].apply(delegate);
            }
            return delegate;
        }
        if(delegate.DEBUG) _console.log('[WARN] the delegate function `on' + e + '` of the crossDomainOuter is not a function');
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
    sendMessage : function(message, targetWindow){
        if(this.DEBUG){
            _console.log("[LOG] will send message to innerWindow:", targetWindow, ", message is:", message);
        }
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
crossDomainOuter.init();

window.crossDomainOuter = crossDomainOuter;

//frame模块，依赖了跨域模块
var crossPanel = {
    DEBUG: false,
    remoteUrl: "http://pan.baidu.com/disk/fujian",
    visible: false,	//是否处于显示状态
    bdCode: "DS9F2A3E5H",
    //调用者往附件中传递的参数   缓存对象
    params: null,
    //调用者往附件中传递的参数
    setParams: function(params) {
        if (params) {
            if (params.appName === "tieba") {
                this.remoteUrl += "?frm=tieba";
            } else if (params.appName === "disk") {
                this.remoteUrl += "?frm=disk";
            } else if (params.appName === "guanjia"){
                this.remoteUrl += "?frm=guanjia";
            }
            this.params = params;
        }
    },
    //外界可以调用的方法
    show: function(){
        this.setVisible(true);
    },
    hide: function(){
        this.setVisible();
    },
    setVisible: function(b){
        if(b){
            if(!this.frame){
                var _this = this;
                //发送验证信息
                var tempbdCode = this.bdCode;
                //内部资源准备完毕
                this.onReady = function(){
                    _this.postMessage({
                        type: "event",
                        eventName: "VisibilityChange",
                        param: {
                            visible : true,
                            isFirst: true,
                            bdCode : tempbdCode,
                            siteHref: location.href,
                            outerParams: crossPanel.params
                        }
                    });
                };
                this._initElement();
            }else{
                this.postMessage({
                    type: "event",
                    eventName: "VisibilityChange",
                    param: {
                        visible : true,
                        isFirst: false,
                        outerParams: crossPanel.params
                    }
                });
                this.rePosition();
                this.frame.style.display = "block";
            }
            this.visible = true;
            crossDomainOuter.dispatchEvent("Show");
        }else{
            this.frame.style.display = "none";
            this.postMessage({
                type: "event",
                eventName: "VisibilityChange",
                param: {
                    visible : false,
                    isFirst: false
                }
            });
            this.visible = false;
            crossDomainOuter.dispatchEvent("Hide");
        }
    },
    setEventDelegate: function(obj){
        crossDomainOuter.setEventDelegate(obj);
        this._eventDelegate = obj;
        var _this = this;
        //防止外部代理在执行该方法后覆盖代理方法
        setTimeout(function(){
            _this.catchEvent(_this, ["onNeedResize", "onClose", "onCancel", "onSelected", "onSubmitAndClose"]);
        }, 1);
    },
    setPosition: function(left, top){
        if(top === "center" || left === "center"){
            this.rePosition();
            return;
        }
        if(/MSIE\s?6\.0\;\s?Windows\s?NT\s?/i.test(navigator.userAgent)){
            top = top + this.getScrollTop();
        }
        top = /^\d+(\.\d+)?$/.test(top) ? top + "px" : top;
        left = /^\d+(\.\d+)?$/.test(left) ? left + "px" : left;
        this.frame.style.top = top;
        this.frame.style.left = left;
    },
    //给框内发送消息
    postMessage: function(obj){
        var innerWindow = this.frame.contentWindow || this.frame.getElementsByTagName("iframe")[0].contentWindow;
        crossDomainOuter.postMessage(obj, innerWindow);
    },

    //以下方法是内部方法，外部不可以调用
    _eventDelegate: this,
    getClientWidth: function(doc) {
        var _doc = doc || document, _docEl = _doc.documentElement, _bdy = _doc.body;
        return !!window.ActiveXObject ? (_docEl.clientWidth || _bdy.clientWidth) : (_doc.compatMode != 'BackCompat' ? _docEl.clientWidth : _bdy.clientWidth);
    },
    getClientHeight: function(doc) {
        var _doc = doc || document, _docEl = _doc.documentElement, _bdy = _doc.body;
        return !!window.ActiveXObject ? (_docEl.clientHeight || _bdy.clientHeight) : (_doc.compatMode != 'BackCompat' ? _docEl.clientHeight : _bdy.clientHeight);
    },
    getScrollWidth: function(doc) {
        var _doc = doc || document, _docEl = _doc.documentElement, _bdy = _doc.body;
        return !window.ActiveXObject || _doc.compatMode != 'BackCompat' ? Math.min(_docEl.scrollWidth, _bdy.scrollWidth) : _bdy.scrollWidth;
    },
    getScrollHeight: function(doc) {
        var _doc = doc || document, _docEl = _doc.documentElement, _bdy = _doc.body;
        return !window.ActiveXObject || _doc.compatMode != 'BackCompat' ? Math.min(_docEl.scrollHeight, _bdy.scrollHeight) : _bdy.scrollHeight;
    },
    getScrollLeft: function(doc) {
        var _doc = doc || document, _docEl = _doc.documentElement, _bdy = _doc.body, _win = _doc.defaultView;
        return _win && ('pageXOffset' in _win) ? _win.pageXOffset : (_docEl.scrollLeft || _bdy.scrollLeft);
    },
    getScrollTop: function(doc) {
        var _doc = doc || document, _docEl = _doc.documentElement, _bdy = _doc.body, _win = _doc.defaultView;
        return _win && ('pageXOffset' in _win) ? _win.pageYOffset : (_docEl.scrollTop || _bdy.scrollTop);
    },
    _initElement: function(){
        crossDomainOuter.dispatchEvent("beforeRender");
        var div = document.createElement("div");
        var top = (this.getClientHeight() - 416) / 2, left = (this.getClientWidth() - 670) / 2;
        var frame = document.createElement("iframe");
        frame.id = "yunfujianPanel";
        if(/MSIE\s?6\.0\;\s?Windows\s?NT\s?/i.test(navigator.userAgent)){
            setTimeout(function(){
                frame.src = crossPanel.remoteUrl;
            }, 100);
            top = top + this.getScrollTop();
        }else{
            frame.src = crossPanel.remoteUrl;
        }
        frame.frameBorder = "0";
        frame.style.cssText = "width:100%; height:100%;background:transparent";
        div.style.cssText = "width:670px; height:416px; position:fixed;background:transparent;_position:absolute; top:" + top + "px; left:" + left + "px;z-index:999999;";
        if (this.params && this.params.appName === "guanjia"){
            div.style.height = "368px";
            div.style.top = top + 48/2 + "px";
        }
        div.appendChild(frame);
        this.frame = div;
        document.body.appendChild(this.frame);
        crossDomainOuter.dispatchEvent("AfterRender");
    },
    //捕获不准代理的事件，将捕获的事件传递给指定对象
    catchEvent: function(obj, eventsArray){
        var eventDelegate = this._eventDelegate;
        if(Object.prototype.toString.call( eventsArray ) === '[object Array]'){
            for(var i = 0, l = eventsArray.length; i < l; i++ ){
                (function(e){
                    eventDelegate[e] = function(){
                        obj[e].apply(obj, arguments);
                    }
                })(eventsArray[i]);
            }
        }
    },
    rePosition: function(x, y){
        var w = parseInt(this.frame.style.width), h = parseInt(this.frame.style.height);
        x = x === "center" || !x ? (this.getClientWidth() - w) / 2 : x;
        y = y === "center" || !y ? (this.getClientHeight() - h) / 2 : y;
        this.setPosition(x, y);
    },

    initEverything: function(){
        var _this = this, timeoutParam;
        //将跨域模块的事件代理过来
        crossDomainOuter.setEventDelegate(this);
        //resize
        crossDomainOuter.bind(window, "resize", function(){
            if(!_this.visible){
                return;
            }
            clearTimeout(timeoutParam);
            timeoutParam = setTimeout(function(){
                _this.rePosition();
            }, 100);
        });
    },

    //以下是事件代理
    onNeedResize: function(obj){
        obj.width = /^\d+(\.\d+)?$/.test(obj.width) ? obj.width + "px" : obj.width;
        obj.height = /^\d+(\.\d+)?$/.test(obj.height) ? obj.height + "px" : obj.height;
        this.frame.style.width = obj.width;
        this.frame.style.height = obj.height;
        this.rePosition();
        crossDomainOuter.dispatchEvent("PanelResize", [obj]);
    },
    onSubmitAndClose: function(){
        this.hide();
        crossDomainOuter.dispatchEvent("Submit", arguments);
    },
    onClose: function(){
        this.hide();
        crossDomainOuter.dispatchEvent("PanelClose");
    },
    onCancel: function(){
        this.hide();
        crossDomainOuter.dispatchEvent("PanelCancel");
    },
    onSelected: function(param){
        this.hide();
        crossDomainOuter.dispatchEvent("PanelCancel", [param]);
    }
};

//crossPanel.initEverything();