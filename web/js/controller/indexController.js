/**
 * @author jinguangguo 
 * @date
 */
app.controller('indexController', function($scope, $location, products) {
    $scope.$on('$routeChangeSuccess', function () {
        var url = $location.$$url;
        if (url === '/') {
            $scope.currentPhash = '/';
        } else {
            $scope.currentPhash = url.split('/')[1];
        }
        $scope.products = products;
    });

    // 登录&注销
    $scope.login = function() {
        $('.ui.modal').modal('show');
    };
});