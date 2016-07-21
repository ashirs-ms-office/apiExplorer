'use strict';

angular.module('ApiExplorer')
    .factory('ApiExplorerSvc', ['$http', '$cacheFactory', function ($http, $cacheFactory) {
        return {
            
            text: 'https://graph.microsoft.com/v1.0/me/',
            
            selectedVersion: "v1.0",
            
            selectedOption: "GET",
            
            showJsonEditor: false,
            
            showJsonViewer: true,
            
            cache: $cacheFactory('myCache'),
            
         /*   id: null,*/
            
            entity: "",
            
            entityNameIsAnId: false,
            
            performAnonymousQuery: function (queryType) {
                if (queryType == "GET") {
                    return function (query, postString) {
                        return $http({
                            url: 'http://apiexproxy-dev.azurewebsites.net/svc?url=' + encodeURIComponent(query),
                            method: 'GET',
                            headers: {
                                "Authorization": "Bearer {token:https://graph.microsoft.com/}",
                                "Accept": "application/json"
                            }
                        });
                    };
                }
                if (queryType == "GET_BINARY") {
                    return function (query, postString) {
                        return $http({
                            url: 'http://apiexproxy-dev.azurewebsites.net/svc?url=' + encodeURIComponent(query),
                            method: 'GET',
                            headers: {
                                "Authorization": "Bearer {token:https://graph.microsoft.com/}",
                                "Accept": "application/json"
                            },
                            responseType: "arraybuffer"
                        });
                    };
                }
                
/*                if (queryType == "POST") {
                    return function (query, postString) {
                        return $http({
                            url: 'http://apiexproxy-dev.azurewebsites.net/svc?url=' + encodeURIComponent(query),
                            method: 'POST',
                            headers: {
                                "Authorization": "Bearer {token:https://graph.microsoft.com/}",
                                "Content-Type": "application/json",
                                "Accept": "application/json"
                            },
                            data: postString
                        });
                    };
                }
                if (queryType == "PATCH") {
                    return function (query, postString) {
                        return $http({
                            url: 'http://apiexproxy-dev.azurewebsites.net/svc?url=' + encodeURIComponent(query),
                            method: 'PATCH',
                            headers: {
                                "Authorization": "Bearer {token:https://graph.microsoft.com/}",
                                "Content-Type": "application/json",
                                "Accept": "application/json"
                            }
                        });
                    };
                }
                if (queryType == "DELETE") {
                    return function (query, postString) {
                        return $http({
                            url: 'http://apiexproxy-dev.azurewebsites.net/svc?url=' + encodeURIComponent(query),
                            method: 'DELETE',
                            headers: {
                                "Authorization": "Bearer {token:https://graph.microsoft.com/}",
                                "Accept": "application/json"
                            }
                        });
                    };
                }*/
                
                return null;
            },

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
            
            getMetadata: function(){
                 return this.performAnonymousQuery("GET")("https://graph.microsoft.com/" + this.selectedVersion +"/$metadata");

            }
        };
    }]);