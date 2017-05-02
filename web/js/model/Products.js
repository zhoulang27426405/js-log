/**
 * 产品注册文件
 * Created by jinguangguo on 2014/11/26.
*/
app.factory('products', function () {
    return [
        // 直达号
        {
            pid: 100,
            hash: 'zhida',
            name: '直达号',
            host: 'http://m.baidu.com/lightapp',
            icon: 'bullseye',
            show: true,
            logo: 'logo_zhida.png',
            defaults: {
                path: 'http://m.baidu.com/lightapp',
                desc: '首页',
                recent_click: 1,
                recent_hot: 1,
                recent: 7,
                src: 'http://m.baidu.com/lightapp',
                test: 'http://172.22.149.24/roverthree/dist/'
            },
            path_array: [
                {
                    path: 'http://m.baidu.com/lightapp',
                    desc: '首页'
                },
                {
                    path: 'http://m.baidu.com/lightapp/#rank',
                    desc: '排行'
                },
                {
                    path: 'http://m.baidu.com/lightapp/#type',
                    desc: '分类'
                },
                {
                    path: 'http://m.baidu.com/lightapp/#mine',
                    desc: '我的'
                },
                {
                    path: 'http://m.baidu.com/lightapp/#search',
                    desc: '搜索'
                }
            ],
            product_desc: '商家在百度移动平台的官方服务账号。基于移动搜索、@账号、地图、个性化推荐等多种方式，让亿万客户随时随地直达商家服务。'
        },
        // 未来商店
        {
            pid: 2,
            hash: 'store',
            name: '未来商店',
            host: 'http://store.baidu.com',
            icon: 'truck',
            logo: 'logo_yingjian.png',
            show: false,
            defaults: {
                path: 'http://store.baidu.com',
                desc: '首页',
                recent_click: 1,
                recent_hot: 1,
                recent: 7,
                src: 'http://store.baidu.com',
                test: 'http://172.22.149.24/roverthree/dist/'
            },
            path_array: [
                {
                    path: 'http://store.baidu.com',
                    desc: '首页'
                }
            ],
            product_desc: '百度未来商店作为行业内首个基于生活需求和场景的智能硬件信息互动平台，将围绕可穿戴、智能家居、安全出行等几大领域，提供最前沿、最时尚、最实用、' +
                '最专业的硬件产品介绍、服务定制、最新资讯、圈子交流等服务，打造行业最专业的智能硬件信息互动平台'
        },
        {
            pid: 3,
            hash: 'pan',
            name: '网盘',
            host: 'pan.baidu.com',
            icon: 'cloud',
            logo: 'logo_pan.png',
            show: false,
            path: [
                {
                    path: 'http://m.pan.baidu.com/',
                    desc: '首页'
                }
            ],
            product_desc: '百度网盘为您提供文件的网络备份、同步和分享服务。空间大、速度快、安全稳固，支持教育网加速，支持手机端。现在注册即有机会享受15G的免费存储空间。'
        }
    ];
});