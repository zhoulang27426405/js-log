!function(win) {
    /**
     * @desc
     * 提供公共方法
     * roverUtil = {
    *    _extend : 合并对象,
    *    _parseJson :  字符串转化成json,
    *    _param :  将参数格式化成&a=1&b=2&c=3,
    *   _createXpath : 获取某元素的xpath,
    *   _upload : log upload
    * }
     */
    var roverUtil = {};

    // pid=381,该pid为直达号中心的产品标示id
    roverUtil.UPURL = 'http://nsclick.baidu.com/v.gif?pid=381';

    roverUtil._extend = function(c, p) {
        p = p || {};

        for (var i in p) {
            if (typeof p[i] === 'object') {
                c[i] = (p[i].constructor === Array) ? [] : {};
                this._extend(c[i], p[i]);
            }
            else {
                c[i] = p[i];
            }
        }

        return c;
    };
    roverUtil._parseJson = function(str) {
        return JSON.parse(str);
    };
    roverUtil._param = function(a) {
        var s = '';
        for (var key in a) {
            if (a.hasOwnProperty(key)) {
                s += ('&' + key + '=' + encodeURIComponent(a[key]));
            }
        }
        return s;
    };
    roverUtil._createXpath = function(elm) {
        var allNodes = document.getElementsByTagName('*');

        for (var segs = []; elm && elm.nodeType === 1; elm = elm.parentNode) {
            if (elm.hasAttribute('id')) {
                var uniqueIdCount = 0;
                for (var n = 0; n < allNodes.length; n++) {
                    if (allNodes[n].hasAttribute('id') && allNodes[n].id === elm.id) {
                        uniqueIdCount++;
                    }
                    if (uniqueIdCount > 1) {
                        break;
                    }
                }
                if (uniqueIdCount === 1) {
                    segs.unshift('id("' + elm.getAttribute('id') + '")');
                    return segs.join('/');
                }
                else {
                    segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]');
                }
            }
            else if (elm.hasAttribute('class')) {
                segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]');
            }
            else {
                for (var i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
                    if (sib.localName === elm.localName) {
                        i++;
                    }
                }
                segs.unshift(elm.localName.toLowerCase() + '[' + i + ']');
            }
        }
        return segs.length ? '/' + segs.join('/') : null;
    };
    roverUtil._upload = function(finaldata) {
        var locUrl = location.href;
        var params = roverUtil._param(finaldata);
        var data = roverUtil.UPURL + '&url=' + encodeURIComponent(locUrl) + '&type=1' + params;
        var upimg = new Image();
        var key = 'zhida_center_log' + (new Date()).getTime();

        // 将new Image()赋予一个全局变量长期持有，避免因浏览器对于"无主"对象的垃圾回收，造成log丢失
        window[key] = upimg;
        upimg.onload = upimg.onerror = upimg.onabort = function() {
            upimg.onload = upimg.onerror = upimg.onabort = null;
            window[key] = null;
            upimg = null;
        };
        upimg.src = data;
    };

    /**
     * @desc
     * 统计事件列表，可扩展，参考events所定义的常量值
     * 举例：touchstart:"TS",touchend:"TE", touchmove:"TM"
     */
    var events = {
        touchend: 'TE'
        // click: 'click'
        // touchstart: 'TS'

    };

    /**
     * @desc
     * 记录用户数据
     * tagname : 发生事件的元素名称. 由event.srcElement. 或向上追溯有意义的标签如:A,BUTTON,IMG,LI,INPUT等.
     * tagId : 发生事件的元素的ID, 可能为空,对应发送字段item
     * act : pv || b
     * fr : 某产品线id
     * mod : 支持用户自定义
     */
    var collectData = function(event) {
        var act = 'b'; // 页面中的一个操作
        var type;
        var etype;
        var se;
        var tagName;
        var tagId;
        var exts;
        var logStr;
        var xpath;
        var finalData = {};
        var cleanHtml = /<.*?>/ig;
        var tagNameLow;

        type = event.type;
        etype = events[type];

        if (!etype) {
            return;
        }

        // etype
        se = event.srcElement;
        tagName = se.tagName;
        tagNameLow = tagName.toLowerCase();
        tagId = se.id;

        // input,button,img,支持特殊标签截取部分内容进行预览,对应字段txt
        switch (tagNameLow) {
            case 'input':
            case 'button':
                exts = se.value || se.name;
                break;
            case 'img':
                exts = se.src || se.alt;
                break;
            default:
                exts = se.innerHTML;
                exts = exts && exts.replace(cleanHtml, '');
                exts = exts && exts.substr(0, 5);
        }
        // 页面中支持加入data-log
        logStr = se.getAttribute('data-log');

        if (logStr) {
            var dataLog = roverUtil._parseJson(logStr);
            finalData = roverUtil._extend(dataLog, finalData);
        }
        // 不区分act取值
        // if (se.href) {
        //     act = (se.getAttribute('target') === '_blank') ? 'a' : 'b';
        // }
        xpath = roverUtil._createXpath(se);

        // 'txt': (exts ? exts : '-')   暂不发送
        var dataExtend = {
            'act': act,
            'item': (tagId ? tagId : '-'),
            'fr': 100,
            'mod': '-',
            'f': 1,
            'xpath': (xpath ? xpath : '-')

        };
        //根据点击元素获取绝对坐标
        // px = se.offsetLeft;
        // py = se.offsetTop;

        // while (se = se.offsetParent) {
        //     px += se.offsetLeft;
        //     py += se.offsetTop;
        // }
        // var pxLeft = parseInt(px, 10);
        // var pyTop = parseInt(py, 10);

        var px = event.changedTouches[0].pageX;
        var py = event.changedTouches[0].pageY;

        var width = parseInt(document.body.scrollWidth, 10);
        var height = parseInt(document.body.scrollHeight, 10);

        dataExtend.px = (px/width).toFixed(3);
        dataExtend.py = (py/height).toFixed(3);

        // tagName ("A" || "BUTTON" || "INPUT" || "LI" || "SPAN" || "IMG")
        // 可选择性定义有意义标签
        if (tagNameLow == ('a' || 'button' || 'input' || 'textarea')) {
            dataExtend.flag = 1;
        }
        else {
            dataExtend.flag = 0;
        }

        finalData = roverUtil._extend(dataExtend, finalData);
        roverUtil._upload(finalData);
    };

    /**
     * @desc
     */
    window.onload = function() {
        for (var key in events) {
            if (window.addEventListener) {
                window.addEventListener(key, collectData, false);

            }
            else if (window.attachEvent) {
                window.attachEvent(key, collectData);
            }
        }
    };

    window.onbeforeunload = function() {
        var param = {
            'xpath': '-',
            'act': 'pv',
            'fr': 100,
            'mod': '-',
            'f': 1,
            'type': 1

        };

        roverUtil._upload(param);
    };

    /**
     * @desc
     * 对外提供方法调用
     */
    var outRover = function(data) {
        var result = data;
        var param = {
            'xpath': '-',
            'act': '-',
            'fr': 100,
            'mod': '-',
            'f': 1

        };
        var log = roverUtil._extend(param, result);
        roverUtil._upload(log);
    };

    win.outRover = outRover;
}(window), function(a) {
    var b = {defaultRadius: 40,defaultRenderer: "canvas2d",defaultGradient: {.25: "rgb(0,0,255)",.55: "rgb(0,255,0)",.85: "yellow",1: "rgb(255,0,0)"},defaultMaxOpacity: 1,defaultMinOpacity: 0,defaultBlur: .85,defaultXField: "x",defaultYField: "y",defaultValueField: "value",plugins: {}}, c = function() {
        var a = function(a) {
            this._coordinator = {}, this._data = [], this._radi = [], this._min = 0, this._max = 1, this._xField = a.xField || a.defaultXField, this._yField = a.yField || a.defaultYField, this._valueField = a.valueField || a.defaultValueField, a.radius && (this._cfgRadius = a.radius)
        }, c = b.defaultRadius;
        return a.prototype = {_organiseData: function(a, b) {
            var d = a[this._xField], e = a[this._yField], f = this._radi, g = this._data, h = this._max, i = this._min, j = a[this._valueField] || 1, k = a.radius || this._cfgRadius || c;
            return g[d] || (g[d] = [], f[d] = []), g[d][e] ? g[d][e] += j : (g[d][e] = j, f[d][e] = k), g[d][e] > h ? (b ? this.setDataMax(g[d][e]) : this._max = g[d][e], !1) : {x: d,y: e,value: j,radius: k,min: i,max: h}
        },_unOrganizeData: function() {
            var a = [], b = this._data, c = this._radi;
            for (var d in b)
                for (var e in b[d])
                    a.push({x: d,y: e,radius: c[d][e],value: b[d][e]});
            return {min: this._min,max: this._max,data: a}
        },_onExtremaChange: function() {
            this._coordinator.emit("extremachange", {min: this._min,max: this._max})
        },addData: function() {
            if (arguments[0].length > 0)
                for (var a = arguments[0], b = a.length; b--; )
                    this.addData.call(this, a[b]);
            else {
                var c = this._organiseData(arguments[0], !0);
                c && this._coordinator.emit("renderpartial", {min: this._min,max: this._max,data: [c]})
            }
            return this
        },setData: function(a) {
            var b = a.data, c = b.length;
            this._max = a.max, this._min = a.min || 0, this._data = [], this._radi = [];
            for (var d = 0; c > d; d++)
                this._organiseData(b[d], !1);
            return this._onExtremaChange(), this._coordinator.emit("renderall", this._getInternalData()), this
        },removeData: function() {
        },setDataMax: function(a) {
            return this._max = a, this._onExtremaChange(), this._coordinator.emit("renderall", this._getInternalData()), this
        },setDataMin: function(a) {
            return this._min = a, this._onExtremaChange(), this._coordinator.emit("renderall", this._getInternalData()), this
        },setCoordinator: function(a) {
            this._coordinator = a
        },_getInternalData: function() {
            return {max: this._max,min: this._min,data: this._data,radi: this._radi}
        },getData: function() {
            return this._unOrganizeData()
        }}, a
    }(), d = function() {
        function d(b) {
            var c = b.container, d = this.shadowCanvas = document.createElement("canvas"), e = this.canvas = b.canvas || document.createElement("canvas"), g = (this._renderBoundaries = [1e4, 1e4, 0, 0], getComputedStyle(b.container) || {});
            e.className = "heatmap-canvas", this._width = e.width = d.width = +g.width.replace(/px/, ""), this._height = e.height = d.height = +g.height.replace(/px/, ""), this.shadowCtx = d.getContext("2d"), this.ctx = e.getContext("2d"), e.style.cssText = d.style.cssText = "position:absolute;left:0;top:0;", c.style.position = "relative", c.appendChild(e), this._palette = a(b), this._templates = {}, this._setStyles(b)
        }
        var a = function(a) {
            var b = a.gradient || a.defaultGradient, c = document.createElement("canvas"), d = c.getContext("2d");
            c.width = 256, c.height = 1;
            var e = d.createLinearGradient(0, 0, 256, 1);
            for (var f in b)
                e.addColorStop(f, b[f]);
            return d.fillStyle = e, d.fillRect(0, 0, 256, 1), d.getImageData(0, 0, 256, 1).data
        }, b = function(a, b) {
            var c = document.createElement("canvas"), d = c.getContext("2d"), e = a, f = a;
            if (c.width = c.height = 2 * a, 1 == b)
                d.beginPath(), d.arc(e, f, a, 0, 2 * Math.PI, !1), d.fillStyle = "rgba(0,0,0,1)", d.fill();
            else {
                var g = d.createRadialGradient(e, f, a * b, e, f, a);
                g.addColorStop(0, "rgba(0,0,0,1)"), g.addColorStop(1, "rgba(0,0,0,0)"), d.fillStyle = g, d.fillRect(0, 0, 2 * a, 2 * a)
            }
            return c
        }, c = function(a) {
            for (var b = [], c = a.min, d = a.max, e = a.radi, a = a.data, f = Object.keys(a), g = f.length; g--; )
                for (var h = f[g], i = Object.keys(a[h]), j = i.length; j--; ) {
                    var k = i[j], l = a[h][k], m = e[h][k];
                    b.push({x: h,y: k,value: l,radius: m})
                }
            return {min: c,max: d,data: b}
        };
        return d.prototype = {renderPartial: function(a) {
            this._drawAlpha(a), this._colorize()
        },renderAll: function(a) {
            this._clear(), this._drawAlpha(c(a)), this._colorize()
        },_updateGradient: function(b) {
            this._palette = a(b)
        },updateConfig: function(a) {
            a.gradient && this._updateGradient(a), this._setStyles(a)
        },setDimensions: function(a, b) {
            this._width = a, this._height = b, this.canvas.width = this.shadowCanvas.width = a, this.canvas.height = this.shadowCanvas.height = b
        },_clear: function() {
            this.shadowCtx.clearRect(0, 0, this._width, this._height), this.ctx.clearRect(0, 0, this._width, this._height)
        },_setStyles: function(a) {
            this._blur = 0 == a.blur ? 0 : a.blur || a.defaultBlur, a.backgroundColor && (this.canvas.style.backgroundColor = a.backgroundColor), this._opacity = 255 * (a.opacity || 0), this._maxOpacity = 255 * (a.maxOpacity || a.defaultMaxOpacity), this._minOpacity = 255 * (a.minOpacity || a.defaultMinOpacity)
        },_drawAlpha: function(a) {
            for (var c = this._min = a.min, d = this._max = a.max, a = a.data || [], e = a.length, f = 1 - this._blur; e--; ) {
                var o, g = a[e], h = g.x, i = g.y, j = g.radius, k = g.value, l = h - j, m = i - j, n = this.shadowCtx;
                this._templates[j] ? o = this._templates[j] : this._templates[j] = o = b(j, f), n.globalAlpha = k / Math.abs(d - c), n.drawImage(o, l, m), l < this._renderBoundaries[0] && (this._renderBoundaries[0] = l), m < this._renderBoundaries[1] && (this._renderBoundaries[1] = m), l + 2 * j > this._renderBoundaries[2] && (this._renderBoundaries[2] = l + 2 * j), m + 2 * j > this._renderBoundaries[3] && (this._renderBoundaries[3] = m + 2 * j)
            }
        },_colorize: function() {
            var a = this._renderBoundaries[0], b = this._renderBoundaries[1], c = this._renderBoundaries[2] - a, d = this._renderBoundaries[3] - b, e = this._width, f = this._height, g = this._opacity, h = this._maxOpacity, i = this._minOpacity;
            0 > a && (a = 0), 0 > b && (b = 0), a + c > e && (c = e - a), b + d > f && (d = f - b);
            for (var j = this.shadowCtx.getImageData(a, b, c, d), k = j.data, l = k.length, m = this._palette, n = 3; l > n; n += 4) {
                var o = k[n], p = 4 * o;
                if (p) {
                    var q;
                    q = g > 0 ? g : h > o ? i > o ? i : o : h, k[n - 3] = m[p], k[n - 2] = m[p + 1], k[n - 1] = m[p + 2], k[n] = q
                }
            }
            j.data = k, this.ctx.putImageData(j, a, b), this._renderBoundaries = [1e3, 1e3, 0, 0]
        },getValueAt: function(a) {
            var b, c = this.shadowCtx, d = c.getImageData(a.x, a.y, 1, 1), e = d.data[3], f = this._max, g = this._min;
            return b = Math.abs(f - g) * (e / 255) >> 0
        },getDataURL: function() {
            return this.canvas.toDataURL()
        }}, d
    }(), e = function() {
        var a = !1;
        return "canvas2d" === b.defaultRenderer && (a = d), a
    }(), f = {merge: function() {
        for (var a = {}, b = arguments.length, c = 0; b > c; c++) {
            var d = arguments[c];
            for (var e in d)
                a[e] = d[e]
        }
        return a
    }}, g = function() {
        function g() {
            var g = this._config = f.merge(b, arguments[0] || {});
            if (this._coordinator = new a, g.plugin) {
                var h = g.plugin;
                if (!b.plugins[h])
                    throw new Error("Plugin '" + h + "' not found. Maybe it was not registered.");
                var i = b.plugins[h];
                this._renderer = i.renderer, this._store = i.store
            } else
                this._renderer = new e(g), this._store = new c(g);
            d(this)
        }
        var a = function() {
            function a() {
                this.cStore = {}
            }
            return a.prototype = {on: function(a, b, c) {
                var d = this.cStore;
                d[a] || (d[a] = []), d[a].push(function(a) {
                    return b.call(c, a)
                })
            },emit: function(a, b) {
                var c = this.cStore;
                if (c[a])
                    for (var d = c[a].length, e = 0; d > e; e++) {
                        var f = c[a][e];
                        f(b)
                    }
            }}, a
        }(), d = function(a) {
            var b = a._renderer, c = a._coordinator, d = a._store;
            c.on("renderpartial", b.renderPartial, b), c.on("renderall", b.renderAll, b), c.on("extremachange", function(b) {
                a._config.onExtremaChange && a._config.onExtremaChange({min: b.min,max: b.max,gradient: a._config.gradient || a._config.defaultGradient})
            }), d.setCoordinator(c)
        };
        return g.prototype = {addData: function() {
            return this._store.addData.apply(this._store, arguments), this
        },removeData: function() {
            return this._store.removeData && this._store.removeData.apply(this._store, arguments), this
        },setData: function() {
            return this._store.setData.apply(this._store, arguments), this
        },setDataMax: function() {
            return this._store.setDataMax.apply(this._store, arguments), this
        },setDataMin: function() {
            return this._store.setDataMin.apply(this._store, arguments), this
        },configure: function(a) {
            return this._config = f.merge(this._config, a), this._renderer.updateConfig(this._config), this._coordinator.emit("renderall", this._store._getInternalData()), this
        },repaint: function() {
            return this._coordinator.emit("renderall", this._store._getInternalData()), this
        },getData: function() {
            return this._store.getData()
        },getDataURL: function() {
            return this._renderer.getDataURL()
        },getValueAt: function(a) {
            return this._store.getValueAt ? this._store.getValueAt(a) : this._renderer.getValueAt ? this._renderer.getValueAt(a) : null
        }}, g
    }(), h = {create: function(a) {
        return new g(a)
    },register: function(a, c) {
        b.plugins[a] = c
    }};
    a.h337 = h
}(this || window), function(obj) {
    var crossDomainInner = {postMessage: function(message) {
        if ("object" == typeof message && (message = this.stringify(message)), "string" != typeof message)
            return void this.dispatchEvent("Error", ["发送的信息格式出现问题"]);
        var targetWindow = window.parent;
        this.sendMessage(message, targetWindow), this.dispatchEvent("PostMessage", [message, targetWindow])
    },setEventDelegate: function(obj) {
        this._eventDelegate = obj
    },DEBUG: !1,_eventDelegate: this,stringify: function(obj) {
        var t = typeof obj, callee = arguments.callee;
        if ("object" != t || null === obj)
            return "string" == t && (obj = '"' + obj + '"'), String(obj);
        if ("object" == typeof JSON && JSON.stringify)
            return JSON.stringify(obj);
        var n, v, json = [], arr = obj && obj.constructor == Array;
        for (n in obj)
            v = obj[n], t = typeof v, obj.hasOwnProperty(n) && ("string" == t ? v = '"' + v + '"' : "object" == t && null !== v && (v = callee(v)), json.push((arr ? "" : '"' + n + '":') + String(v)));
        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}")
    },parseJSON: function(data) {
        var rvalidchars = /^[\],:{}\s]*$/, rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
        return "object" == typeof data ? data : "string" == typeof data && data ? (data = data.replace(/(^\s+)|(\s+$)/g, ""), rvalidchars.test(data.replace(rvalidescape, "@").replace(rvalidtokens, "]").replace(rvalidbraces, "")) ? window.JSON && window.JSON.parse ? window.JSON.parse(data) : new Function("return " + data)() : data) : null
    },dispatchEvent: function(e, args) {
        var delegate = this;
        return this._eventDelegate && (delegate = this._eventDelegate), "function" == typeof delegate["on" + e] ? (delegate.DEBUG && console.log("[LOG] call the delegate function `on" + e + "` of the crossDomainInner obj:", delegate, " successful"), "[object Array]" === Object.prototype.toString.call(args) ? delegate["on" + e].apply(delegate, args) : delegate["on" + e].apply(delegate), delegate) : (delegate.DEBUG && console.log("[WARN] the delegate function `on" + e + "` of the crossDomainInner is not a function"), !1)
    },_supportPostMessage: function() {
        if (window.postMessage)
            try {
                if (window.postMessage.toString().indexOf("[native code]") >= 0)
                    return !0;
                this.dispatchEvent("Warn", ["浏览器原生的postMessage方法似乎已被覆盖，跨域模块可能工作不正常"])
            } catch (e) {
                return !0
            }
        return !1
    }.call(this),bind: function(el, type, fn) {
        el && "function" == typeof fn && (el.addEventListener ? el.addEventListener(type, fn, !1) : el.attachEvent && el.attachEvent("on" + type, fn))
    },sendMessage: function(message, targetWindow) {
        this._supportPostMessage ? targetWindow.postMessage(message, "*") : targetWindow.name = message
    },init: function() {
        var _this = this;
        this._eventDelegate = this;
        var dispatchMsg = function(msg) {
            "event" === msg.type ? _this.dispatchEvent(msg.eventName, [msg.param]) : _this.dispatchEvent("Message", [msg])
        };
        this._supportPostMessage ? this.bind(window, "message", function(event) {
            if (event.data) {
                var msg = _this.parseJSON(event.data);
                dispatchMsg(msg)
            }
        }) : (window.name = "", _this.windowName = window.name, setInterval(function() {
            if (window.name != _this.windowName && "" !== window.name) {
                _this.windowName = window.name;
                var msg = _this.parseJSON(_this.windowName);
                dispatchMsg(msg), setTimeout(function() {
                    window.name = "", _this.windowName = ""
                }, 20)
            }
        }, 100))
    }};
    crossDomainInner.init(), obj ? obj.crossDomainInner = crossDomainInner : window.crossDomainInner = crossDomainInner
}(), function(win, doc) {
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
}(window, document);
