/**
 * Created by jinguangguo on 2014/10/11.
 */

angular.module('cloudLog').directive('userFocus', function ($timeout) {
    return function (scope, elem, attrs) {
        scope.$watch(attrs.userFocus, function (newVal) {
            if (newVal) {
                $timeout(function () {
                    elem[0].focus();
                }, 0, false);
            }
        });
    };
});

/*
angular.module('cloudLog')
    .directive('userEscape', function () {
        var ESCAPE_KEY = 27;
        return function (scope, elem, attrs) {
            elem.bind('keydown', function (event) {
                if (event.keyCode === ESCAPE_KEY) {
                    scope.$apply(attrs.userEscape);
                }
            });
        };
    });*/

angular.module('cloudLog').directive('onFinishRenderFilters', function ($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function() {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    };
});
