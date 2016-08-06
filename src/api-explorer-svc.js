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
            
            login: function(){
                window.location = 
               /*$http.get(*/
                "https://login.microsoftonline.com/" + "common" + "/oauth2/v2.0/authorize?" + 
                "client_id=" + clientId +
                "&response_type=id_token" +
                "&redirect_uri=" +  encodeURIComponent(redirectUri) + 
                "&scope=openid%20" + encodeURIComponent(userScopes) + 
                "&response_mode=fragment" +
                "&state=" + guid() + 
                "&nonce=" + guid();
                //);
                
            },
            
            getMetadata: function(){
                 return this.performQuery("GET")("https://graph.microsoft.com/" + this.selectedVersion +"/$metadata");

            }
        };
    }]);