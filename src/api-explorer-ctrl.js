angular.module('ApiExplorer')
    .controller('ApiExplorerCtrl', ['$scope', '$log', 'adalAuthenticationService', '$location', '$mdDialog', 'ApiExplorerSvc', function ($scope, $log, adalService, $location, $mdDialog, apiService) {
        var expanded = true;
        
        $scope.showJsonEditor = apiService.showJsonEditor;
        $scope.showJsonViewer = apiService.showJsonViewer;
        $scope.showImage = false;

        
        parseMetadata(apiService.entityKeyPrefix, apiService, $log, $scope);
        initializeJsonViewer($scope, run, apiService);
        
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


        $scope.items = [
            'GET',
            'POST',
            'PATCH',
            'DELETE'
          ];
    
    
        $scope.getOption = function(){
                return $scope.selectedOption;
        }

        $scope.$watch("getOption()", function(event, args) {
            $log.log($scope.selectedOption);
            apiService.selectedOption = $scope.selectedOption;
            apiService.text = "https://graph.microsoft.com/v1.0/";
            if ($scope.selectedOption == 'POST' || $scope.selectedOption == 'PATCH') {
                apiService.showJsonEditor = true;
            } else if ($scope.selectedOption == 'GET' || $scope.selectedOption == 'DELETE') {
                apiService.showJsonEditor = false;

            }
        }, true);

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
    .controller('VersionCtrl', ['$scope', '$log', 'ApiExplorerSvc', function ($scope, $log, apiService) {

        $scope.selectedVersion = apiService.selectedVersion;
        
        $scope.items = [
            'beta',
            'v1.0',
          ];
    
        $scope.getVersion = function(){
            return $scope.selectedVersion;
        }

        $scope.$watch("getVersion()", function(event, args) {
            apiService.selectedVersion = $scope.selectedVersion;
            $log.log(apiService.selectedVersion);
            switch(apiService.selectedVersion){
               case "v1.0":
                  apiService.entityKeyPrefix = "v1.0";
                  break;
              case "beta":
                  apiService.entityKeyPrefix = "beta";
            }
            apiService.text = apiService.text.replace(/https:\/\/graph.microsoft.com($|\/([\w]|\.)*($|\/))/, "https://graph.microsoft.com/" + apiService.selectedVersion + "/");
            $scope.$parent.text = apiService.text;
        }, true);
}]);

angular.module('ApiExplorer')
    .controller('datalistCtrl', ['$scope', '$log', 'ApiExplorerSvc', function ($scope, $log, apiService) {
        $scope.urlOptions = [];
        $scope.urlArray = []; 
        
        $scope.getEntity = function(){
            return apiService.entity;
        }
    
        $scope.$watch("getEntity()", function(event, args){
            $log.log("entity changed - changing URLs");
            if(apiService.entity == "topLevel"){
                switch(apiService.selectedVersion){
                    case "v1.0":
                       $scope.urlOptions = apiService.cache.get("v1EntitySetData");
                       break;
                    case "beta":
                       $scope.urlOptions = apiService.cache.get("betaEntitySetData")
                }
            }else if(apiService.entity != null){
                 $scope.urlOptions = apiService.entity.URLS;  
            }
            
            $scope.urlArray = [];
            for(var x in $scope.urlOptions){
                 $scope.urlArray.push($scope.urlOptions[x]);
           }
            
        }, true);
        
        
        $scope.searchTextChange = function(searchText){  
              if(apiService.text.charAt(apiService.text.length-1) != '/'){
                apiService.text += '/';
          }
        }
        
      $scope.getMatches = function(query) {
          $log.log("Getting matches");
          $log.log($scope.urlArray);
          
          //maybe this should be in the version controller?
         $scope.$parent.text = apiService.text;
         if(apiService.selectedOption == "GET"){
             
              return $scope.urlArray.filter( function(option){
                  var queryInOption = (option.name.indexOf(getEntityName(query))>-1);
                  var queryIsEmpty = (getEntityName(query).length == 0);
                  var isAnId = apiService.entityNameIsAnId;
                  if(isAnId){
                      var previousEntity = apiService.cache.get(apiService.entityKeyPrefix + "EntitySetData")[getEntityName(getPreviousCall(query, getEntityName(query)))];
                  }
                  var queryIsEntityName = (getEntityName(query) == apiService.entity.name) || (isAnId && previousEntity != null && (previousEntity.entityType == apiService.entity.name));
                  return (isAnId && queryInOption) || queryIsEntityName || queryIsEmpty || queryInOption;
              });
         }else{
             return [apiService.text];
         }
     }
        
    }]);

angular.module('ApiExplorer').controller('FormCtrl', ['$scope', '$log', 'ApiExplorerSvc', 'ngProgressFactory', '$mdToast', function ($scope, $log, apiService, ngProgressFactory, $mdToast){
    $scope.duration = "";
    $scope.progressbar = ngProgressFactory.createInstance();
    $scope.listData = "requestList";
    $scope.photoData = "";
    $scope.responseHeaders = "";
    $scope.history = [];
    $scope.historySelected = null;
    $scope.text = apiService.text;
    $scope.entityItem = null;
 
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
                $scope.jsonEditor.getSession().setValue(input.jsonInput);
            }else{
                //clear jsonEditor
                $scope.jsonEditor.getSession().setValue("");
                apiService.showJsonEditor = false;
            }
        }
    }

    $scope.selectedItemChange = function(item){
       $log.log("selected item changed to " + item);
       $scope.entityItem = item; 
       $log.log(item);     
    }
    
    $scope.submit = function (query) {
        $log.log("in submit");
        $scope.text = query; 
        $log.log(query);
        
        if($scope.entityItem){
            $log.log("submitting " + $scope.text);
            $log.log($scope.entityItem);
        }
        
        parseMetadata(apiService.entityKeyPrefix, apiService, $log, $scope);
        
        apiService.text = $scope.text;

        if(apiService.text != null && apiService.text.charAt(apiService.text.length-1) != '/'){
            apiService.text += '/';
            $scope.text = apiService.text;
        }

       setEntity($scope.entityItem, $scope, apiService, $log);

        if ($scope.userInfo.isAuthenticated) {

            $scope.previousString = apiService.text;

            //create an object to store the api call
            var historyObj = {};

            historyObj.urlText = $scope.previousString,
            historyObj.selectedVersion = apiService.selectedVersion;
            historyObj.htmlOption = apiService.selectedOption;

            if(historyObj.htmlOption == 'POST' || historyObj.htmlOption == 'PATCH'){
                historyObj.jsonInput = $scope.jsonEditor.getSession().getValue();
            }else{
                historyObj.jsonInput ="";
            }

            $scope.showJsonViewer = true;
            $scope.showImage = false;

            $scope.progressbar.reset();
            $scope.progressbar.start();

            var postBody = "";
            if ($scope.jsonEditor != undefined) {
                postBody = $scope.jsonEditor.getSession().getValue();
            }
            var startTime = new Date();
            var endTime = null;
            apiService.performQuery(apiService.selectedOption)($scope.text, postBody).success(function (results, status, headers, config) {
                if (isImageResponse(headers)) { 
                    handleImageResponse($scope, apiService, headers);
                } else if (isHtmlResponse(headers)) {  
                    handleHtmlResponse($scope, startTime, results, headers, $mdToast);
                } else if (isXmlResponse(results)) {
                    handleXmlResponse($scope, startTime, results, headers, $mdToast);
                } else {
                    handleJsonResponse($scope, startTime, results, headers, $mdToast);
                    dynamicallyPopulateURLsForEntitySets(apiService, results);
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
