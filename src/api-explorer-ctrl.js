angular.module('ApiExplorer')
    .controller('ApiExplorerCtrl', ['$scope', '$log', 'adalAuthenticationService', '$location', '$mdDialog', 'ApiExplorerSvc', function ($scope, $log, adalService, $location, $mdDialog, apiService) {
        var expanded = true;
        
        $scope.showJsonEditor = apiService.showJsonEditor;
        $scope.showJsonViewer = apiService.showJsonViewer;
        $scope.showImage = false;

        
        initializeJsonViewer($scope, run, apiService);
        if($scope.userInfo.isAuthenticated){
            parseMetadata(apiService, $log, adalService);
        }
        
        $scope.$on("adal:loginSuccess", function () {
            console.log("login success");
            parseMetadata(apiService, $log, adalService);

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
            $log.log(adalService.l)
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


        $scope.items = [
            'GET',
            'POST',
            'PATCH',
            'DELETE'
          ];
    
    
        $scope.getOption = function(){
                return $scope.selectedOption;
        }

        $scope.$watch("getOption()", function(newVal, oldVal) {
            $log.log($scope.selectedOption);
            apiService.selectedOption = $scope.selectedOption;
            $log.log("resetting text");
            apiService.text = "https://graph.microsoft.com/" + apiService.selectedVersion + "/";
            if ($scope.selectedOption == 'POST' || $scope.selectedOption == 'PATCH') {
                apiService.showJsonEditor = true;
            } else if ($scope.selectedOption == 'GET' || $scope.selectedOption == 'DELETE') {
                apiService.showJsonEditor = false;

            }
            
        });

    }]);  

function DialogController($scope, $mdDialog) {
    $scope.hide = function() {
        $mdDialog.hide();
    };
    
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    
    $scope.answer = function(answer) {
        $mdDialog.hide(answer);
    };
}

angular.module('ApiExplorer').controller('settingsCtrl', ['$scope', '$log', '$mdDialog', function($scope, $log, $mdDialog){
    
   $scope.showDialog = function(event){
       $mdDialog.show({
           controller: DialogController,
           templateUrl: 'settings.html',
           clickOutsideToClose:true
       })
   }
    
}]);

angular.module('ApiExplorer')
    .controller('VersionCtrl', ['$scope', '$log', 'ApiExplorerSvc', 'adalAuthenticationService', function ($scope, $log, apiService, adalService) {

        $scope.selectedVersion = apiService.selectedVersion;
        
        $scope.items = [
            'beta',
            'v1.0',
          ];
    
        $scope.getVersion = function(){
            return $scope.selectedVersion;
        }

        $scope.$watch("getVersion()", function(newVal, oldVal) {
                apiService.selectedVersion = $scope.selectedVersion;
                $log.log("switching to: " + apiService.selectedVersion);
                parseMetadata(apiService, $log, adalService);
                apiService.text = apiService.text.replace(/https:\/\/graph.microsoft.com($|\/([\w]|\.)*($|\/))/, ("https://graph.microsoft.com/" + apiService.selectedVersion + "/"));
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
        
        $scope.urlHashFunction = function(urlObj){
            var hash = urlObj.autocompleteVal.length;
            for(var i=0; i<urlObj.name.length; i++){
                hash += urlObj.name.charCodeAt(i);
            }
            
            return hash;
        }
    
        $scope.$watch("getEntity()", function(event, args){
            $log.log("entity changed - changing URLs");
            if(apiService.entity == "topLevel"){
                     $scope.urlOptions = apiService.cache.get(apiService.selectedVersion + "EntitySetData");
            }else if(apiService.entity != null){
                 $scope.urlOptions = apiService.entity.URLS;  
            }
            
            //for each new URL to add
            for(var x in $scope.urlOptions){
                $scope.urlOptions[x].autocompleteVal = apiService.text + $scope.urlOptions[x].name;
                $log.log("attempting to add: " + $scope.urlOptions[x].autocompleteVal);
                //find the hash bucket that it would be in
                var hashNumber = $scope.urlHashFunction($scope.urlOptions[x]);
                var bucket = $scope.urlArrayHash[hashNumber.toString()];
                //if it exists
                if(bucket){
                    $log.log("bucket " + hashNumber + " already exists");
                    var inBucket = false;
                    //for each value already in the hash, 
                     for(var i=0; i<bucket.length; i++){
                        //check to see if its the value to add
                        if(bucket[i].autocompleteVal === $scope.urlOptions[x].autocompleteVal){
                            $log.log("value already in bucket");
                            inBucket = true;
                            break;
                        } 
                     }
                     
                    if(!inBucket){
                         $log.log("value not yet in bucket");
                        //if its not, add it
                         bucket.push($scope.urlOptions[x]);
                         $scope.urlArray.push($scope.urlOptions[x]);
                    }
                    
                }else{
                    $log.log("bucket " + hashNumber + " does not yet exist");
                    //if the bucket does not already exist, create a new array and add it
                     $scope.urlArrayHash[hashNumber.toString()] = [$scope.urlOptions[x]];
                     $scope.urlArray.push($scope.urlOptions[x]);
                }
            }
            
        }, true);
        
        
        $scope.searchTextChange = function(searchText){  
              if(apiService.text && apiService.text.charAt(apiService.text.length-1) != '/'){
                apiService.text += '/';
          }
        }
        
      $scope.getMatches = function(query) {
          
         if(apiService.cache.get(apiService.selectedVersion + "EntitySetData") && apiService.selectedOption == "GET"){
              return $scope.urlArray.filter( function(option){
                  var queryInOption = (option.autocompleteVal.indexOf(getEntityName(query))>-1);
                  var queryIsEmpty = (getEntityName(query).length == 0);
                  /*var isAnId = apiService.entityNameIsAnId;
                  if(isAnId){
                      var previousEntity = apiService.cache.get(apiService.selectedVersion + "EntitySetData")[getEntityName(getPreviousCall(query, getEntityName(query)))];
                    //print nothing
                  }*/
                  /*var queryIsEntityName = (getEntityName(query) == apiService.entity.name) || (isAnId && previousEntity != null && (previousEntity.entityType == apiService.entity.name));*/
                  return /*(isAnId && queryInOption) || queryIsEntityName ||*/ queryIsEmpty || queryInOption;
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
    $scope.duration = "";
    $scope.listData = "requestList";
    $scope.photoData = "";
    $scope.responseHeaders = "";
    $scope.history = [];
    $scope.historySelected = null;
    $scope.text = apiService.text;
    $scope.progressVisibility = "hidden";
    $scope.entityItem = null;
    
    $scope.getText = function(){
        return apiService.text;
    }
    
    $scope.$watch("getText()", function(event, args) {
         $scope.text = apiService.text;
    });
 
    // custom link re-routing logic to resolve links
    $scope.$parent.$on("urlChange", function (event, args) {
        msGraphLinkResolution($scope, $scope.$parent.jsonViewer.getSession().getValue(), args);
    });
    
    //function called when link in the back button history is clicked
    $scope.historyOnClick = function(input){
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

    $scope.selectedItemChange = function(item){
       $scope.entityItem = item; 
    }
    
    $scope.submit = function (query) {

        if(!query){
            return;
        }
        
        if(query.charAt(query.length-1) != '/'){
            query += '/';
        }
        
        apiService.text = query;
        
        
        $log.log("submitting " + apiService.text);
        
       // parseMetadata(apiService, $log);
        if(apiService.cache.get(apiService.selectedVersion + "Metadata") && apiService.selectedOption == "GET"){
            setEntity($scope.entityItem, apiService, $log);
        }

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

            //$scope.progressbar.reset();
            //$scope.progressbar.start();

            var postBody = "";
            if ($scope.jsonEditor != undefined) {
                postBody = $scope.jsonEditor.getSession().getValue();
            }
            var startTime = new Date();
            var endTime = null;
            apiService.performQuery(apiService.selectedOption)(apiService.text, postBody).success(function (results, status, headers, config) {
                if (isImageResponse(headers)) { 
                    handleImageResponse($scope, apiService, headers);
                } else if (isHtmlResponse(headers)) {  
                    handleHtmlResponse($scope, startTime, results, headers, $mdToast);
                } else if (isXmlResponse(results)) {
                    handleXmlResponse($scope, startTime, results, headers, $mdToast);
                } else {
                    handleJsonResponse($scope, startTime, results, headers, $mdToast);
//                    dynamicallyPopulateURLsForEntitySets(apiService, results);
                }

                historyObj.success = "success";

            }).error(function (err, status) {
                handleJsonResponse($scope, startTime, err, null, $mdToast);
                historyObj.success = "error";
            });

            //add history object to the array
            $scope.history.unshift(historyObj);
        }
    };
}]);
