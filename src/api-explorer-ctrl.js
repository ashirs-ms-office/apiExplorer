angular.module('ApiExplorer')
    .controller('ApiExplorerCtrl', ['$scope', '$log', 'adalAuthenticationService', '$location', 'ApiExplorerSvc', function ($scope, $log, adalService, $location, apiService) {
        var expanded = true;
        
        $scope.showJsonEditor = apiService.showJsonEditor;
        $scope.showJsonViewer = apiService.showJsonViewer;
        $scope.showImage = false;
        initializeJsonViewer($scope, run, apiService, $log);
        if($scope.userInfo.isAuthenticated){
            parseMetadata(apiService, $log, $scope);
        }
        
        $scope.$on("adal:loginSuccess", function () {
            console.log("login success");
            parseMetadata(apiService, $log, $scope);

        });

        
        $scope.getEditor = function(){
            return apiService.showJsonEditor;
        }
        
        $scope.$watch("getEditor()", function(event, args){
            $scope.showJsonEditor = $scope.getEditor();
            
            if($scope.showJsonEditor){
                initializeJsonEditor($scope);
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
                apiService.text = "https://graph.microsoft.com/" + apiService.selectedVersion + "/";
                if ($scope.selectedOption == 'POST' || $scope.selectedOption == 'PATCH') {
                    apiService.showJsonEditor = true;
                } else if ($scope.selectedOption == 'GET' || $scope.selectedOption == 'DELETE') {
                    apiService.showJsonEditor = false;

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
                $scope.$root.$broadcast("clearUrlOptions");
                apiService.text = apiService.text.replace(/https:\/\/graph.microsoft.com($|\/([\w]|\.)*($|\/))/, ("https://graph.microsoft.com/" + apiService.selectedVersion + "/"));
                var entityObj = {};
                entityObj.name = apiService.selectedVersion
                apiService.entity = entityObj;
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
                 $scope.urlArray.push($scope.urlOptions[x]);
            }
        }
    });

    $scope.$watch("getEntity()", function(event, args){
        $log.log("entity changed - changing URLs");
        $scope.$emit("updateUrlOptions");

    }, true);


   $scope.getMatches = function(query) {

     if(apiService.cache.get(apiService.selectedVersion + "EntitySetData") && apiService.selectedOption == "GET"){
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

angular.module('ApiExplorer').controller('FormCtrl', ['$scope', '$log', 'ApiExplorerSvc', 'ngProgressFactory', '$mdToast', function ($scope, $log, apiService, ngProgressFactory, $mdToast){
    $scope.duration = "15 ms";
    $scope.listData = "requestList";
    $scope.photoData = "";
    $scope.history = [];
    $scope.historySelected = null;
    $scope.text = apiService.text;
    $scope.progressVisibility = "hidden";
    $scope.durationVisibility = "hidden";
    $scope.entityItem = null;
    $scope.selectedIndex = 0;
    $scope.hasAResponse = false;
    
    $scope.historyHeading = {};
    $scope.historyHeading.urlText = "Query";
    $scope.historyHeading.statusCode = "Status Code";
    $scope.history.push($scope.historyHeading);
    
    
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
        
        if($scope.userInfo.isAuthenticated){
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
    
    $scope.submit = function (query) {

        if(!query){
            return;
        }
        
        apiService.text = query;
        
        
        $log.log("submitting " + apiService.text);
        
        if ($scope.userInfo.isAuthenticated) {
            $scope.progressVisibility = "not-hidden";

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
            var startTime = new Date();
            var endTime = null;
            apiService.performQuery(apiService.selectedOption)(apiService.text, postBody).success(function (results, status, headers, config) {
                if (isImageResponse(headers)) { 
                    handleImageResponse($scope, apiService, headers, status);
                } else if (isHtmlResponse(headers)) {  
                    handleHtmlResponse($scope, startTime, results, headers, status);
                } else if (isXmlResponse(results)) {
                    handleXmlResponse($scope, startTime, results, headers, status);
                } else {
                    handleJsonResponse($scope, startTime, results, headers,  status);
                }

                historyObj.success = "success";
                historyObj.statusCode = status;
                $scope.hasAResponse = true;
                
                
                if(apiService.cache.get(apiService.selectedVersion + "Metadata") && apiService.selectedOption == "GET"){
                    setEntity($scope.entityItem, apiService, $log, true);
                }

            }).error(function (err, status) {
                handleJsonResponse($scope, startTime, err, null, status);
                historyObj.success = "error";
                historyObj.statusCode = status;
                $scope.hasAResponse = true;
                if(apiService.cache.get(apiService.selectedVersion + "Metadata") && apiService.selectedOption == "GET"){
                    setEntity($scope.entityItem, apiService, $log, false);
                }
            });

            $scope.selectedIndex = 0;
            //add history object to the array
            $scope.history.splice(1, 0, historyObj);
        }else{
            //user is not logged in
            $log.log("not logged in");
            $scope.showLoginToast();
        }

    };
}]);
