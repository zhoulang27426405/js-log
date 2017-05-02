/**
 * Created by jinguangguo on 2014/12/24.
 */
app.factory('iframeService', function () {
    var _pri = {
        $iframe: null,
        $container: null,
        src: '',
        /**
         * 设置iframe的高度
         */
        setIframeHeight: function() {
            var $iframe = this.$iframe,
                offsetTop = this.$container.offset().top,
                wHeight = $(window).height(),
                h = wHeight - offsetTop;
            if (h < 600) {
            	h = 600;
            }
            $iframe.height(h);
        },
        createIframe: function($container, src) {
            var iframe = document.createElement('iframe');
            iframe.src = src;
            iframe.onload = function() {
                console.log('[iframeService] iframe loaded !!!!!');
            };
            this.$iframe = $(iframe);
            this.$container = $container;
            $container.html(iframe);
        }
    };

    var _pub = {
        setIframe: function($iframe) {
            _pri.$iframe = $iframe;
        },
        getIframe: function() {
            return _pri.$iframe[0];
        },
        setIframeWidth: function(w) {
            _pri.$iframe.width(w);
        },
        setIframeHeight: function(h) {
            _pri.$iframe.height(h);
        },
        buildIframe: function(config) {
            _pri.createIframe(config.$container, config.src);
            _pri.src = config.src;
            _pri.setIframeHeight();
        },
        getCurrentSrc: function() {
            return _pri.src;
        }
    };

    return _pub;
});