/**
 * Created by jinguangguo on 2014/9/15.
 */
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/', {
            controller: 'indexController',
            templateUrl: 'html/parts/product.html'
        }).
        when('/:phash', {
            controller: 'applicationController',
            templateUrl: 'html/parts/application.html'
        }).
        when('/:phash/pvuv', {
            controller: 'pvUvController',
            templateUrl: 'html/parts/pvuv.html'
        }).
        when('/:phash/click', {
            controller: 'picClickController',
            templateUrl: 'html/parts/pic_click.html'
        }).
        when('/:phash/hot', {
            controller: 'picHotController',
            templateUrl: 'html/parts/pic_hot.html'
        }).
        when('/help/system', {
            controller: 'helpController',
            templateUrl: 'html/parts/help/help.html'
        }).
        when('/help/change_log', {
            controller: 'helpController',
            templateUrl: 'html/parts/help/help.html'
        }).
        when('/help/about_us', {
            controller: 'helpController',
            templateUrl: 'html/parts/help/help.html'
        }).
        otherwise({
            redirectTo: '/'
        });
}]);
