angular.module('ApiExplorer')
    .controller('ApiExplorerCtrl', ['$scope', '$log', 'adalAuthenticationService', '$location', 'ApiExplorerSvc', function ($scope, $log, adalService, $location, apiService) {
        var expanded = true;

        
        $scope.$on('$locationChangeStart', function (e) {
                if ($location.path().indexOf('access_token') > -1 ||
                    $location.path().indexOf('id_token') > -1) {
                    e.preventDefault();
                }
        });
        
        $scope.showJsonEditor = apiService.showJsonEditor;
        $scope.showJsonViewer = apiService.showJsonViewer;
        $scope.showImage = false;
        initializeJsonViewer($scope, run, apiService, $log);
        
        var requestVal = $location.search().request;
        var actionVal = $location.search().method;
        var bodyVal = $location.search().body;
        var versionVal = $location.search().version;
        var headersVal = $location.search().headers;
        
        handleQueryString(apiService, actionVal, versionVal, requestVal);
        
        initializeJsonEditorHeaders($scope, headersVal); 
        
        parseMetadata(apiService, $log, $scope);
        
        $scope.$on("adal:loginSuccess", function () {
            console.log("login success");
        });
        
        $scope.getEditor = function(){
            return apiService.showJsonEditor;
        }
        
        $scope.$watch("getEditor()", function(event, args){
            $scope.showJsonEditor = $scope.getEditor();
            if($scope.showJsonEditor){
                initializeJsonEditor($scope, bodyVal);
            }
        });

        $scope.login = function () {
            adalService.login();
        };
        
        $scope.logout = function () {
            adalService.logOut();
        };
        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };
        
}]);

angular.module('ApiExplorer')
    .controller('DropdownCtrl', ['$scope', '$log', 'ApiExplorerSvc', function ($scope, $log, apiService) {
    
        $scope.selectedOption = apiService.selectedOption;

        $scope.onItemClick = function(choice){
            $scope.selectedOption = choice;
        }

        $scope.items = [
            'GET',
            'POST',
            'PATCH',
            'DELETE'
          ];
    
        $scope.getServiceOption = function(){
            return apiService.selectedOption;
        }
    
        $scope.getOption = function(){
                return $scope.selectedOption;
        }

        $scope.$watch("getOption()", function(newVal, oldVal) {
            if(oldVal !== newVal){
                $log.log("switching to: " + $scope.selectedOption);
                apiService.selectedOption = $scope.selectedOption;
                apiService.text = apiService.text.replace(/https:\/\/graph.microsoft.com($|\/([\w]|\.)*($|\/))/, ("https://graph.microsoft.com/" + apiService.selectedVersion + "/"));
                if ($scope.selectedOption == 'POST' || $scope.selectedOption == 'PATCH') {
                    apiService.showJsonEditor = true;
                    showRequestHeaders($scope);
                    $scope.setSelectedTab(1);
                } else if ($scope.selectedOption == 'GET' || $scope.selectedOption == 'DELETE') {
                    apiService.showJsonEditor = false;
                    $scope.setSelectedTab(1);
                }
            }
        });
    }]);  
        
angular.module('ApiExplorer')
    .controller('VersionCtrl', ['$scope', '$log', 'ApiExplorerSvc', 'adalAuthenticationService', function ($scope, $log, apiService, adalService) {

        $scope.selectedVersion = "Version";

        $scope.selectedVersion = apiService.selectedVersion;
        
        $scope.items = [
            'beta',
            'v1.0',
          ];
    
        $scope.getVersion = function(){
            return $scope.selectedVersion;
        }
        
       $scope.getServiceVersion = function(){
            return apiService.selectedVersion;
        }
        
        $scope.onItemClick = function(choice){
            $scope.selectedVersion = choice;
            apiService.selectedVersion = choice;
        }
        $scope.$watch("getVersion()", function(newVal, oldVal) {
            if(oldVal !== newVal){
                apiService.selectedVersion = $scope.selectedVersion;
                $log.log("switching to: " + apiService.selectedVersion);
                if($scope.$parent.searchText){
                    apiService.text = $scope.$parent.searchText.replace(/https:\/\/graph.microsoft.com($|\/([\w]|\.)*($|\/))/, ("https://graph.microsoft.com/" + apiService.selectedVersion + "/"));
                }else{
                    apiService.text = apiService.text.replace(/https:\/\/graph.microsoft.com($|\/([\w]|\.)*($|\/))/, ("https://graph.microsoft.com/" + apiService.selectedVersion + "/"));    
                }
                parseMetadata(apiService, $log, $scope);
            }
        });
}]);

angular.module('ApiExplorer')
    .controller('datalistCtrl', ['$scope', '$log', 'ApiExplorerSvc', function ($scope, $log, apiService) {
        $scope.urlOptions = {};
        $scope.urlArray = []; 
        $scope.urlArrayHash = {};
        
        $scope.getEntity = function(){
            return apiService.entity;
        }

        $scope.getText = function(){
            return apiService.text;
        }
        
        $scope.$watch("getText()", function(event, args) {
             $scope.text = apiService.text;
             this.searchText = $scope.text;
        });

       $scope.searchTextChange = function(searchText){
            this.searchText = searchText;
            if(searchText.charAt(searchText.length-1) === "/" && apiService.entity && getEntityName(searchText) !== apiService.entity.name){
                if(apiService.cache.get(apiService.selectedVersion + "Metadata") ){
                    apiService.text = searchText;
                    setEntity(getEntityName(searchText), apiService, $log, true);
                }
            }
       }

       $scope.urlHashFunction = function(urlObj){
            var hash = urlObj.autocompleteVal.length;
            for(var i=0; i<urlObj.name.length; i++){
                hash += urlObj.name.charCodeAt(i);
            }
            return hash;
       }


        $scope.$on("clearUrlOptions", function(){
            $log.log("clearing options");
            $scope.urlOptions = {};
            $scope.urlArray = [];
            $scope.urlArrayHash = {};
        });

       $scope.urlHashFunction = function(urlObj){
            var hash = urlObj.autocompleteVal.length;
            for(var i=0; i<urlObj.name.length; i++){
                hash += urlObj.name.charCodeAt(i);
            }

            return hash;
       }

        $scope.$on("updateUrlOptions", function(){
            $log.log("updating url options");
            $log.log(apiService.entity);
            if(apiService.entity && apiService.entity.name === apiService.selectedVersion){
                 $scope.urlOptions = apiService.cache.get(apiService.selectedVersion + "EntitySetData");
                 apiService.entity.name = apiService.selectedVersion;
            }else if(apiService.entity != null){
                $scope.urlOptions = apiService.entity.URLS;  
            }else{
                return;
            }

            //for each new URL to add
            for(var x in $scope.urlOptions){

                if(apiService.text.charAt((apiService.text).length-1) != '/'){
                    $scope.urlOptions[x].autocompleteVal = apiService.text + '/' + $scope.urlOptions[x].name;
                }else{
                    $scope.urlOptions[x].autocompleteVal = apiService.text + $scope.urlOptions[x].name;
                }

                //find the hash bucket that it would be in
                var hashNumber = $scope.urlHashFunction($scope.urlOptions[x]);
                var bucket = $scope.urlArrayHash[hashNumber.toString()];
                //if it exists
                if(bucket){
                    var inBucket = false;
                    //for each value already in the hash, 
                     for(var i=0; i<bucket.length; i++){
                        //check to see if its the value to add
                        if(bucket[i].autocompleteVal === $scope.urlOptions[x].autocompleteVal){
                            inBucket = true;
                            break;
                        } 
                     }

                    if(!inBucket){
                        //if its not, add it
                         bucket.push($scope.urlOptions[x]);
                         $scope.urlArray.push($scope.urlOptions[x]);
                    }

                }else{
                    //if the bucket does not already exist, create a new array and add it
                     $scope.urlArrayHash[hashNumber.toString()] = [$scope.urlOptions[x]];
                     $scope.urlArray.unshift($scope.urlOptions[x]);
                }
            }

        });

        $scope.$watch("getEntity()", function(event, args){
            $log.log("entity changed - changing URLs");
            $scope.$emit("updateUrlOptions");

        }, true);


       $scope.getMatches = function(query) {
         if(apiService.cache.get(apiService.selectedVersion + "EntitySetData")){
              return $scope.urlArray.filter( function(option){

                  var queryInOption = (option.autocompleteVal.indexOf(query)>-1);
                  var queryIsEmpty = (getEntityName(query).length == 0);

                  return  queryIsEmpty || queryInOption;
              });
         }else{
             var obj = {
                 autocompleteVal: apiService.text
             }
             return [obj];
         }
     }
        
}]);


angular.module('ApiExplorer').controller('FormCtrl', ['$scope', '$log', 'ApiExplorerSvc',  'adalAuthenticationService', function ($scope, $log, apiService, adalService){
    $scope.duration = "15 ms";
    $scope.listData = "requestList";
    $scope.photoData = "";
    $scope.history = [];
    $scope.text = apiService.text;
    $scope.progressVisibility = "hidden";
    $scope.goVisibility = "not-hidden";
    $scope.entityItem = null;
    $scope.hasAResponse = false;
    $scope.insufficientPrivileges = false;
    if(apiService.selectedOption === 'POST' || apiService.selectedOption === 'PATCH'){
        $scope.requestTab = 1;
    }else{
        $scope.requestTab = 0;
    }

    $scope.submissionInProgress = false;
            
    $scope.getConsentText = function(){
        if(localStorage.getItem("adminConsent")){
            return "This query requires administrator privileges to complete. Are you an admin? Consent propogation can take 5 minutes";
        }else{
            return "This query requires administrator privileges to complete. Are you an admin?";
        }
    }
    
    $scope.getText = function(){
        return apiService.text;
    }
    
    $scope.$watch("getText()", function(event, args) {
         $scope.text = apiService.text;
    });
 
    // custom link re-routing logic to resolve links
    $scope.$parent.$on("urlChange", function (event, args) {
        msGraphLinkResolution($scope, $scope.$parent.jsonViewer.getSession().getValue(), args, apiService);
    });
    
    //function called when link in the back button history is clicked
    $scope.historyOnClick = function(input){
        if(input.urlText == "Query"){
            return;
        }
        
        $scope.text = input.urlText;
        apiService.selectedVersion = input.selectedVersion;
        apiService.selectedOption = input.htmlOption;

        if(input.htmlOption == 'POST' || input.htmlOption == 'PATCH'){
            apiService.showJsonEditor = true;
            if($scope.jsonEditor){
                $scope.jsonEditor.getSession().setValue(input.jsonInput);
            }else{
                $log.log("error: json editor watch event not firing");
            }
        }else{
            //clear jsonEditor
            if($scope.jsonEditor){
                $scope.jsonEditor.getSession().setValue("");
            }
            apiService.showJsonEditor = false;

        }
        $scope.submit($scope.text);
    }
    
    $scope.closeAdminConsentBar = function(){
        $scope.insufficientPrivileges = false;
    }
    
    $scope.addAdminScopes = function(){
        $log.log("requesting admin priviliges");
        localStorage.setItem("adminConsent", true);
        adalService.config.scope = [adminScopes];
        adalService.login();                                                                                                      
    }
    
    $scope.requestBodyDisabled = function(){
         if((apiService.selectedOption == "POST") || (apiService.selectedOption == "PATCH")){
             return false;
         }else{
             return true;
         }
    }
    
    $scope.selectedItemChange = function(item){
       $scope.entityItem = item; 
    }
    
    $scope.setSelectedTab = function(num){
        if(num >= 2 || num < 0){
            return;
        }else{
            $scope.requestTab = num;
        }
    }
    
    $scope.submit = function (query) {

        if(!query){
            return;
        }
        
        apiService.text = query;
        
        $log.log("submitting " + apiService.text);
        $scope.progressVisibility = "not-hidden";
        $scope.goVisibility = "hidden";
        
        var accountType = "";
        if ($scope.userInfo.isAuthenticated) {
            accountType = adalService.getAccountType();
        }else{
            accountType = "anonymous";
        }
        $log.log("account type: ")
        $log.log(accountType);
        
        //ga('send', 'account', 'GraphExplorer', accountType);
        //ga('send', 'query', 'GraphExplorer', apiService.selectedOption + " " + query);
        /*MscomCustomEvent('ms.InteractionType', '4', 'ms.controlname', 'graphexplorer', 'ms.ea_action', $scope.selectedOptions, 'ms.contentproperties', $scope.text);*/
        
        //create an object to store the api call
        var historyObj = {};

        historyObj.urlText = apiService.text;
        historyObj.selectedVersion = apiService.selectedVersion;
        historyObj.htmlOption = apiService.selectedOption;

        if(historyObj.htmlOption == 'POST' || historyObj.htmlOption == 'PATCH'){
            historyObj.jsonInput = $scope.jsonEditor.getSession().getValue();
        }else{
            historyObj.jsonInput ="";
        }

        $scope.showJsonViewer = true;
        $scope.showImage = false;


        var postBody = "";
        if ($scope.jsonEditor != undefined) {
            postBody = $scope.jsonEditor.getSession().getValue();
        }
        var requestHeaders = "";
            if($scope.jsonEditorHeaders != undefined){
                requestHeaders = $scope.jsonEditorHeaders.getSession().getValue();
                requestHeaders = formatRequestHeaders(requestHeaders);
                console.log(requestHeaders);
        }
        var startTime = new Date();
        var endTime = null;
        if ($scope.userInfo.isAuthenticated) {
            apiService.performQuery(apiService.selectedOption)(apiService.text, postBody, requestHeaders).success(function (results, status, headers, config) {

                if (isImageResponse(headers)) { 
                    handleImageResponse($scope, apiService, headers, status);
                } else if (isHtmlResponse(headers)) {  
                    handleHtmlResponse($scope, startTime, results, headers, status);
                } else if (isXmlResponse(results)) {
                    handleXmlResponse($scope, startTime, results, headers, status);
                } else {
                    handleJsonResponse($scope, startTime, results, headers, status);
                }

                historyObj.success = "success";
                historyObj.statusCode = status;
                $scope.hasAResponse = true;
                
                
                if(apiService.cache.get(apiService.selectedVersion + "Metadata") && apiService.selectedOption == "GET"){
                    setEntity($scope.entityItem, apiService, $log, true, apiService.text);
                }

                $scope.insufficientPrivileges = false;
            }).error(function (err, status) {
                handleJsonResponse($scope, startTime, err, null, status);
                historyObj.success = "error";
                historyObj.statusCode = status;
                $scope.hasAResponse = true;
                if(apiService.cache.get(apiService.selectedVersion + "Metadata") && apiService.selectedOption == "GET"){
                    setEntity($scope.entityItem, apiService, $log, false, apiService.text);
                }
                
                if(status === 401 || status === 403){
                    $scope.insufficientPrivileges = true;
                }
            });

        }else{
            if(apiService.selectedOption == "POST" || apiService.selectedOption == "PATCH" || apiService.selectedOption == "DELETE"){
                var error = "action: " + apiService.selectedOption +  " not supported in anonymous login scenario";
                $log.log(error);
                handleJsonResponse($scope, startTime, error, null, status);
                return;
            }
            
            apiService.performAnonymousQuery(apiService.selectedOption)(apiService.text, postBody, requestHeaders).success(function (results, status, headers, config) {
                if (isImageResponse(headers)) { 
                    handleImageResponse($scope, apiService, headers, status);
                } else if (isHtmlResponse(headers)) {  
                    handleHtmlResponse($scope, startTime, results, headers, status);
                } else if (isXmlResponse(results)) {
                    handleXmlResponse($scope, startTime, results, headers, status);
                } else {
                    handleJsonResponse($scope, startTime, results, headers, status);
                }
                
                historyObj.success = "success";
                historyObj.statusCode = status;
                $scope.hasAResponse = true;
                
                
                if(apiService.cache.get(apiService.selectedVersion + "Metadata") && apiService.selectedOption == "GET"){
                    setEntity($scope.entityItem, apiService, $log, true, apiService.text);
                }

                $scope.insufficientPrivileges = false;
           }).error(function (err, status) {
                handleJsonResponse($scope, startTime, err, null, status);
                historyObj.success = "error";
                historyObj.statusCode = status;
                $scope.hasAResponse = true;
                if(apiService.cache.get(apiService.selectedVersion + "Metadata") && apiService.selectedOption == "GET"){
                    setEntity($scope.entityItem, apiService, $log, false, apiService.text);
                }
                
                if(status === 401 || status === 403){
                    $scope.insufficientPrivileges = true;
                }
            });
      }
        
    $scope.setSelectedTab(1);
    //add history object to the array
    historyObj.duration = $scope.duration;
    $scope.history.splice(0, 0, historyObj);
    };
}]);
