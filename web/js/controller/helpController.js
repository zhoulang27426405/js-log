/**
 * Created by jinguangguo on 2014/12/22.
 */
app.controller('helpController', function($scope, $location, products) {
    $scope.$on('$routeChangeSuccess', function () {
        $scope.helpUrl = $location.$$url;
    });
});