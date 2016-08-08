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
                    var headersObj = {
                         "Authorization": "Bearer {token:https://graph.microsoft.com/}",
                         "Accept": "application/json"    
                    };
       /*             
                    if(requestHeaders && requestHeaders["Authorization"]){
                        headersObj["Authorization"] = requestHeaders["Authorization"];
                    }
                    
                    if(requestHeaders && requestHeaders[""])*/
                    
                    return function (query, postString, requestHeaders) {
                        console.log(requestHeaders);
                        return $http({
                            url: 'https://apiexproxy-dev.azurewebsites.net/svc?url=' + encodeURIComponent(query),
                            method: 'GET',
                            headers: headersObj
                                
                            
                        });
                    };
                }
                if (queryType == "GET_BINARY") {
                    return function (query, postString, requestHeaders) {
                        return $http({
                            url: 'https://apiexproxy-dev.azurewebsites.net/svc?url=' + encodeURIComponent(query),
                            method: 'GET',
                            headers: {
                               /* if(!requestHeaders["Authorization"]){
                                    "Authorization": "Bearer {token:https://graph.microsoft.com/}",
                                    "Accept": "application/json"    
                                }*/
                            },
                            responseType: "arraybuffer"
                        });
                    };
                }
                       
                return null;
            },

            performQuery: function (queryType) {
                if (queryType == "GET") {
                    return function (query, postString, requestHeaders) {
                        console.log(requestHeaders);
                        return $http.get(query, {headers : requestHeaders});
                    };
                }
                if (queryType == "GET_BINARY") {
                    return function (query, postString, requestHeaders) {
                        return $http.get(query, {responseType:"arraybuffer"}, {headers : requestHeaders});
                    };
                }
                
                if (queryType == "POST") {
                    return function (query, postString, requestHeaders) {
                        return $http.post(query, postString, {headers : requestHeaders});
                    };
                }
                if (queryType == "PATCH") {
                    return function (query, postString, requestHeaders) {
                        return $http.patch(query, postString,{headers : requestHeaders});
                    };
                }
                if (queryType == "DELETE") {
                    return function (query, postString, requestHeaders) {
                        return $http.delete(query, {headers : requestHeaders});
                    };
                }
                
                return null;
            },
            
            getMetadata: function(loggedIn){
                if(loggedIn){
                     return this.performQuery("GET")("https://graph.microsoft.com/" + this.selectedVersion +"/$metadata");
                }else{
                     return this.performAnonymousQuery("GET")("https://graph.microsoft.com/" + this.selectedVersion +"/$metadata");
                }

            }
        };
    }]);