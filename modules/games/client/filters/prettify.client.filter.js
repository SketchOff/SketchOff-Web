'use strict';

angular.module('games.admin').filter('prettify', [function() {
    return function(items) {
        var filtered = [];
        angular.forEach(items, function(item) {
            filtered.push(item);
        });
        return filtered;
    };
}]);
