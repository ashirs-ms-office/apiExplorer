'use strict';

angular.module('ApiExplorer')
    .factory('ApiExplorerSvc', ['$http', function ($http) {
        return {
            performQuery: function (queryType) {
                if (queryType == "GET") {
                    return function (query, postString) {
                        return $http.get(query);
                    };
                }
                if (queryType == "POST") {
                    return function (query, postString) {
                        return $http.post(query, postString, {headers : "Content-Type:application/json"});
                    };
                }
                if (queryType == "PATCH") {
                    return function (query, postString) {
                        return $http.patch(query, postString, {headers : "Content-Type:application/json"});
                    };
                }
                if (queryType == "DELETE") {
                    return function (query, postString) {
                        return $http.delete(query);
                    };
                }
                
                return null;
            }
        };
    }]);