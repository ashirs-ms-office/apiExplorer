'use strict';

angular.module('ApiExplorer')
    .factory('ApiExplorerSvc', ['$http', '$cacheFactory', function ($http, $cacheFactory) {
        return {
            
            cache: $cacheFactory('myCache'),
            
            performQuery: function (queryType) {
                if (queryType == "GET") {
                    return function (query, postString) {
                        return $http.get(query);
                    };
                }
                if (queryType == "GET_BINARY") {
                    return function (query, postString) {
                        return $http.get(query, {responseType:"arraybuffer"});
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
            },
            
            getV1Metadata: function(){
                 var data = this.performQuery("GET")("https://graph.microsoft.com/v1.0/$metadata");
                
                this.cache.put("v1Metadata", data);
            },
            
            getBetaMetadata: function(){
                var data =  this.performQuery("GET")("https://graph.microsoft.com/v1.0/$metadata");
                
                this.cache.put("betaMetadata", data);
            }
        };
    }]);