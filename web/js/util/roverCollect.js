/**
* @file upload log
* @author sundi
* @version 0.0.1
*/

(function(win) {

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

        if (px === undefined && py === undefined) {
            return;
        }

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

})(window);
