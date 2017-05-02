/**
 * Created by jinguangguo on 2014/12/22.
 */
app.controller('applicationController', function($scope, $location, $routeParams, appService, util, products) {
    var phash = $routeParams.phash;
    var pinfo = _.findWhere(products, {hash: phash});

    $scope.productInfo = pinfo;

    $scope.selectPvUvByProduct = function(productInfo) {
        window.location.href = '#/' + productInfo.hash + '/pvuv';
    };

    $scope.selectClickByProduct = function(productInfo) {
        window.location.href = '#/' + productInfo.hash + '/click';
    };

    $scope.selectHotByProduct = function(productInfo) {
        window.location.href = '#/' + productInfo.hash + '/hot';
    };
});