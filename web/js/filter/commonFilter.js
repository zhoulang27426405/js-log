/**
 *
 */
angular.module('cloudLog').filter('filterDateCase', function() {
    return function(dateString) {
        // "2014-10-13T12:39:40.059Z"
        return dateString.toUpperCase();
    };
});