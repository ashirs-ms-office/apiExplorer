angular.module('ApiExplorer')
    .controller('ApiExplorerCtrl', ['$scope', '$log', 'adalAuthenticationService', '$location', 'ApiExplorerSvc', function ($scope, $log, adalService, $location, apiService) {
        var expanded = true;
        
        $scope.text = 'https://graph.microsoft.com/v1.0/';
        $scope.selectedOptions = "GET";
        $scope.selectedVersion = "v1.0";
        $scope.entityKeyPrefix = "v1";
        $scope.entityNameIsAnId = false;
        $scope.showJsonEditor = false;
        $scope.showDuration = false;
        $scope.showJsonViewer = true;
        $scope.showImage = false;

        
        parseMetadata($scope.entityKeyPrefix, apiService, $log, $scope);
        initializeJsonViewer($scope, run, apiService);

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
    .controller('DropdownCtrl', function ($scope, $log) {
        $scope.selectedOptions = "GET";

        $scope.items = [
            'GET',
            'POST',
            'PATCH',
            'DELETE'
          ];

        $scope.OnItemClick = function (selectedOption) {
            $log.log(selectedOption);
            $scope.selectedOptions = selectedOption;
            $scope.$parent.selectedOptions = selectedOption;
            if (selectedOption == 'POST' || selectedOption == 'PATCH') {
                $scope.$parent.showJsonEditor = true;
                initializeJsonEditor($scope.$parent);
            } else if (selectedOption == 'GET' || selectedOption == 'DELETE') {
                $scope.$parent.showJsonEditor = false;
            }
        }
    });  

angular.module('ApiExplorer')
    .controller('VersionCtrl', function ($scope, $log) {

        $scope.items = [
            'beta',
            'v1.0',
          ];

        $scope.OnItemClick = function (selectedVersion) {
            $log.log(selectedVersion);
            $scope.$parent.$parent.selectedVersion = selectedVersion;
            switch($scope.$parent.$parent.selectedVersion){
               case "v1.0":
                  $scope.$parent.entityKeyPrefix = "v1.0";
                  break;
              case "beta":
                  $scope.$parent.entityKeyPrefix = "beta";
            }
            $scope.$parent.text = $scope.$parent.text.replace(/https:\/\/graph.microsoft.com($|\/([\w]|\.)*($|\/))/, "https://graph.microsoft.com/" + selectedVersion + "/");
        }
    });

angular.module('ApiExplorer')
    .controller('datalistCtrl', ['$scope', '$log', 'ApiExplorerSvc', function ($scope, $log, apiService) {
        $scope.urlOptions = [];
        $scope.urlArray = []; 
        
        $scope.$parent.$on("clearUrls", function (event, args) {
            $scope.urlOptions = [];
        });
        
        $scope.getEntity = function(){
            return apiService.entity;
        }
    
        $scope.$watch("getEntity()", function(event, args){
            $log.log("entity changed - changing URLs");
            if(apiService.entity == "topLevel"){
                switch($scope.$parent.selectedVersion){
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
              if($scope.$parent.text.charAt($scope.$parent.text.length-1) != '/'){
                $scope.$parent.text += '/';
          }
        }
        
      $scope.getMatches = function(query) {
          
          $log.log("Getting matches");
          $log.log(getEntityName(query));
          
          return $scope.urlArray.filter( function(option){
              var queryInOption = (option.name.indexOf(getEntityName(query))>-1);
              var queryIsEmpty = (getEntityName(query).length == 0);
              var queryIsEntityName = (getEntityName(query) == apiService.entity.name);
              var isAnId = $scope.$parent.entityNameIsAnId;
              return isAnId || queryIsEntityName || queryIsEmpty || queryInOption;
          });
     }
        
    }]);

angular.module('ApiExplorer').controller('FormCtrl', ['$scope', '$log', 'ApiExplorerSvc', 'ngProgressFactory', function ($scope, $log, apiService, ngProgressFactory) {
    $scope.duration = "";
    $scope.progressbar = ngProgressFactory.createInstance();
    $scope.listData = "requestList";
    $scope.photoData = "";
    $scope.responseHeaders = "";
    $scope.history = [];
 
    // custom link re-routing logic to resolve links
    $scope.$parent.$on("urlChange", function (event, args) {
        msGraphLinkResolution($scope, $scope.$parent.jsonViewer.getSession().getValue(), args);
    });
    
    //function called when link in the back button history is clicked
    $scope.historyOnClick = function(input){
        if($scope.userInfo.isAuthenticated){
            
            $scope.text = input.urlText;
            $scope.$parent.selectedVersion = input.selectedVersion;
            $scope.selectedOptions = input.htmlOption;
            
            if(input.htmlOption == 'POST' || input.htmlOption == 'PATCH'){
                $scope.showJsonEditor = true;
                initializeJsonEditor($scope.$parent.$parent);
                $scope.jsonEditor.getSession().setValue(input.jsonInput);
            }else{
                //clear jsonEditor
                $scope.jsonEditor.getSession().setValue("");
                $scope.showJsonEditor = false;
            }
        }
    }

    
    $scope.submit = function (entityItem) {
        
        if(entityItem){
            $scope.text = $scope.text + entityItem.name;
            $log.log("submitting " + $scope.text);
            $log.log(entityItem);
        }
        
        parseMetadata($scope.$parent.entityKeyPrefix, apiService, $log, $scope);
        
        $scope.$emit('clearUrls');
        if ($scope.text) {
            $scope.$parent.text = $scope.text;
            
            if($scope.$parent.text.charAt($scope.$parent.text.length-1) != '/'){
                $scope.$parent.text += '/';
                $scope.text = $scope.$parent.text;
            }

            
           setEntity(entityItem, $scope, apiService);
            
            if ($scope.userInfo.isAuthenticated) {
                
                $scope.previousString = $scope.text;
            
                //create an object to store the api call
                var historyObj = {};

                historyObj.urlText = $scope.previousString,
                historyObj.selectedVersion = $scope.$parent.selectedVersion;
                historyObj.htmlOption = $scope.selectedOptions;

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
                apiService.performQuery($scope.selectedOptions)($scope.text, postBody).success(function (results, status, headers, config) {
                    if (isImageResponse(headers)) { 
                        handleImageResponse($scope, apiService, headers);
                    } else if (isHtmlResponse(headers)) {  
                        handleHtmlResponse($scope, startTime, results, headers);
                    } else if (isXmlResponse(results)) {
                        handleXmlResponse($scope, startTime, results, headers);
                    } else {
                        handleJsonResponse($scope, startTime, results, headers);
                        dynamicallyPopulateURLsForEntitySets(apiService, results);
                    }
                    
                    historyObj.success = "success";
                    
                }).error(function (err, status) {
                    handleJsonResponse($scope, startTime, err, null);
                    historyObj.success = "error";
                });
                
                //add history object to the array
                $scope.history.push(historyObj);
            }
        }
    };
}]);
