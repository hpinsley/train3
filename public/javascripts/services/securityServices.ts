/// <reference path="../../../d.ts/lodash.d.ts" />
/// <reference path="../../../d.ts/traindefs.d.ts" />
/// <reference path="../../../d.ts/angular.d.ts" />
angular.module("train").factory('securityServices', ["$http", "$log", "$q", function ($http,$log,$q) {

    function isAdmin() : boolean {
        return false;
    }
    return {
        isAdmin: isAdmin
    }
}]);

