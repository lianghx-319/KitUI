/**
 * @Name: kitUI 弹层
 * @Author: Hans
 * @Date: 20180226
 */

; (function(W, D, V) {
    var doc = D;
    var query = 'querySelectorAll';
    var classN = 'getElementsByClassName';
    var selector = function (s) {
        return doc[query](s);
    };

    var index = 0;
    var rootClass = ['vKitUI_madel'];

    var ready = {
        extend: function (conf, obj) {
            var newobj = JSON.parse(JSON.stringify(conf));
            for (var i in obj) {
                newobj[i] = obj[i];
            }
            return newobj;
        },
        timer: {}, end: {} 
    };

    //绑定点击事件
    ready.touch = function (elem, fn) {
        elem.addEventListener('click', function (e) {
            fn.call(this, e);
        }, false);
    };

    var defaultConfig = {
        type: 'dialog'
        , shade: true
        , shadeClose: true
        , fixed: true
        , anim: 'scale'
        , isFixed: true
    };

    var Madel = function (options) {
        var _this = this;
        _this.config = ready.extend(defaultConfig, options);
        if (!this.config.content && this.config.type === 'dialog') {
            throw 'need a content options';
        }
        _this.close();
        _this.show();
    };

    Madel.prototype.show = function () {
        var _this = this;
        var config = _this.config;
        var madelBox = doc.createElement('div');

        madelBox.setAttribute('class', rootClass[0] + ' ' + rootClass[0] + '_' + (config.type || 'dialog'));

        //标题
        var title = (function () {
            var type = typeof config.title === 'object';
            return config.title
                ? '<h3 style="' + (type ? config.title[1] : '') + '">' + (type ? config.title[0] : config.title) + '</h3>'
                : '';
        })();

        //按钮
        var button = (function () {
            typeof config.btn === 'string' && (config.btn = [config.btn]);
            var btnNum = (config.btn || []).length, btnDom;

            if (btnNum === 0 || !config.btn) {
                return '';
            }
            
            btnDom = '<span yes data-type="1">' + config.btn[0] + '</span>';
            if (btnNum === 2) {
                btnDom = '<span no data-type="0">' + config.btn[1] + '</span>' + btnDom;
            }

            return '<div class="vKitUI_madel_btn">' + btnDom + '</div>';
        })();

        if (!config.fixed) {
            config.top = config.hasOwnProperty('top') ? config.top : 100;
            config.style = config.style || '';
            config.style += ' top:' + (doc.body.scrollTop + config.top) + 'px';
        }

        if (config.type === 'loading') {
            // config.shade = false;
            if (!config.content) {
                config.content = '<i></i><i class="vKitUI_madel_load"></i><i></i>'; 
            }
        }

        if (config.skin === 'tips') {
            config.shade = false;
        }

        madelBox.innerHTML = (config.shade ? '<div ' + (typeof config.shade === 'string' ? 'style="' + config.shade + '"' : '') + ' class="vKitUI_madel_shade"></div>' : '')
            + '<div class="vKitUI_madel_main" ' + (!config.fixed ? 'style="position:static;"' : '') + '>'
            + '<div class="vKitUI_madel_section">'
            + '<div class="vKitUI_madel_child animated ' + (config.skin ? 'vKitUI_madel_' + config.skin + ' ' : '') + (config.className ? config.className : '') + ' ' + (config.anim ? config.anim : '') + '" ' + (config.style ? 'style="' + config.style + '"' : '') + '>'
            + title
            + '<div class="vKitUI_madel_cont">' + config.content + '</div>'
            + button
            + '</div>'
            + '</div>'
            + '</div>';

        document.body.appendChild(madelBox);
        var elem = _this.elem = selector('.' + rootClass[0])[0];
        config.success && config.success(elem);

        _this.action(config, elem);
        config.isFixed && elem.addEventListener('touchmove', function (e) {
            e.preventDefault();
        });
    };

    Madel.prototype.close = function (elem) {
        var _this = this;
        var elem = elem || selector('.' + rootClass[0])[0];
        if (!elem) {
            return
        }
        elem.innerHTML = '';
        doc.body.removeChild(elem);
        clearTimeout(ready.timer);
        delete ready.timer;
        typeof ready.end === 'function' && ready.end();
        delete ready.end;
    };

    Madel.prototype.action = function (config, elem) {
        var _this = this;
        //自动关闭
        if (config.expires) {
            ready.timer = setTimeout(function () {
                _this.close(elem);
            }, config.expires);
        }

        //确认取消
        var btnFn = function () {
            var type = this.getAttribute('data-type');
            if (type == 0) {
                config.no && config.no();
                _this.close(elem);
            } else {
                config.yes ? config.yes() : _this.close(elem);
            }
        };
        if (config.btn) {
            var btns = elem[classN]('vKitUI_madel_btn')[0].children;
            var btnNum = btns.length;
            for (var i = 0; i < btnNum; i++) {
                ready.touch(btns[i], btnFn);
            }
        }

        //点击遮罩关闭
        if (config.shade && config.shadeClose) {
            var shade = elem[classN]('vKitUI_madel_shade')[0];
            ready.touch(shade, function () {
                _this.close(elem);
            });
        }

        config.end && (ready.end = config.end);
    };

    var kitUI = {};
    kitUI.tips = function (config) {
        var defaultTips = {
            skin: 'tips',
            isFixed: false
        };
        var options = ready.extend(config, defaultTips);
        return new Madel(options);
    };

    kitUI.madel = function (config) {
        var options = config || {};
        return new Madel(options);
    }

    kitUI.qrcode = function (config) {
        if (!config.img) {
            throw 'need img options';
        }
        config.content && (config.content = '');
        var defaultOptions = {
            shadeClose: false,
            content: '<img src="' + config.img + '" style="width: 100%">'
        };
        var options = ready.extend(defaultOptions, config);
        return new Madel(options);
    }

    kitUI.loading = function (config) {
        var defaultOptions = {
            type: 'loading',
            shade: false,
        };
        var config = config || {};
        var options = ready.extend(config, defaultOptions);
        return new Madel(options);
    }

    try {
        if (typeof window.VIPC !== 'object') {
            window.VIPC = {}
        }
        window.VIPC.kitUI = kitUI;
    } catch (e) {
        console.error('InitError: VIPC is not initialization.');
    }
})(window, document)