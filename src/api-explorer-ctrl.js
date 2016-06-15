angular.module('ApiExplorer')
    .controller('ApiExplorerCtrl', ['$scope', '$log', 'adalAuthenticationService', '$location', 'ApiExplorerSvc', function ($scope, $log, adalService, $location, apiService) {
        var expanded = true;
        
        $scope.text = 'https://graph.microsoft.com/v1.0/';
        $scope.selectedOptions = "GET";
        $scope.selectedVersion = "v1.0";
        $scope.showJsonEditor = false;
        $scope.showDuration = false;
        $scope.showJsonViewer = true;
        $scope.showImage = false;

        
        parseMetadata($scope.selectedVersion, apiService, $log, $scope);
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
        $scope.selectedVersion = "Version";

        $scope.items = [
            'beta',
            'v1.0',
          ];

        $scope.OnItemClick = function (selectedVersion) {
            $log.log(selectedVersion);
            $scope.selectedVersion = selectedVersion;
            $scope.$parent.$parent.selectedVersion = selectedVersion;
            $scope.$parent.text = $scope.$parent.text.replace(/https:\/\/graph.microsoft.com($|\/([\w]|\.)*($|\/))/, "https://graph.microsoft.com/" + selectedVersion + "/");
        }
    });

angular.module('ApiExplorer')
    .controller('datalistCtrl', ['$scope', '$log', 'ApiExplorerSvc', function ($scope, $log, apiService) {
        $scope.urlOptions = [];
        
        $scope.$parent.$on("clearUrls", function (event, args) {
            $scope.urlOptions = [];
        });
    
             
      $scope.getMatches = function(query) {
          $log.log("in querySearch");
          if(apiService.entity == "" /*at top level*/){
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

          var urlArray = [];
          for(var x in $scope.urlOptions){
             urlArray.push($scope.urlOptions[x]);
          }
          $log.log(urlArray);
          return urlArray;
     }
        
        $scope.$parent.$on("populateUrls", function (event, args) {
            $log.log("populating URLS");
            if(apiService.entity == "" /*at top level*/){
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
            $log.log($scope.urlOptions);
            
        });
    }]);

angular.module('ApiExplorer').controller('FormCtrl', ['$scope', '$log', 'ApiExplorerSvc', 'ngProgressFactory', function ($scope, $log, apiService, ngProgressFactory) {
    $scope.duration = "";
    $scope.progressbar = ngProgressFactory.createInstance();
    $scope.listData = "requestList";
    $scope.photoData = "";
    $scope.responseHeaders = "";
    $scope.history = [];

    //$scope.$emit('populateUrls');

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

    
    $scope.submit = function (text) {
        
        $log.log("submitting " + text);
        $scope.text = text;
        
        parseMetadata($scope.$parent.selectedVersion, apiService, $log, $scope);
        
        $scope.$emit('clearUrls');
        if ($scope.text) {
            $scope.$parent.text = $scope.text;
            if($scope.$parent.text.charAt($scope.$parent.text.length-1) != '/'){
                $scope.$parent.text += '/';
            }
            
            //FIX WHEN THERE ARE TWO SLASHES AFTER ENTRY
            $scope.entityName = getEntityName($scope.text);
            $log.log($scope.entityName);
            
            switch($scope.$parent.selectedVersion){
                case "v1.0":
                    var entityKeyPrefix = "v1";
                    break;
                case "beta":
                    var entityKeyPrefix = "beta";
            }
            
            
            //FOUR CASES - 
            //entityName is an entitySet
            //entityName is an entityType
            //entityName is an ID
            //we are at top level URL
            
            var entityNameIsEntitySet = apiService.cache.get(entityKeyPrefix + "EntitySetData")[$scope.entityName];
            var entityNameIsAnId = apiService.entity != null && apiService.entity.isEntitySet;
            var topLevel = $scope.entityName == $scope.$parent.selectedVersion;
            $log.log(apiService.cache.get("v1EntitySetData"));
            $log.log(entityNameIsAnId);
            $log.log(topLevel);
            
            if(topLevel){
                   apiService.entity = "";
            }else if(entityNameIsEntitySet){
                   apiService.entity = entityNameIsEntitySet;
            }else if(entityNameIsAnId){
                   var typeName = apiService.entity.entityType; 
                   apiService.entity = apiService.cache.get(entityKeyPrefix + "EntityTypeData")[typeName];
            }else{
                   apiService.entity = apiService.cache.get(entityKeyPrefix + "EntityTypeData")[$scope.entityName];
            }
            
            $log.log(apiService.entity);
            
            
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
                    
                    $scope.$emit('populateUrls');
                    historyObj.success = "success";
                    
                }).error(function (err, status) {
                    handleJsonResponse($scope, startTime, err, null);
                    historyObj.success = "error";
                    $scope.$emit('populateUrls');
                });
                
                //add history object to the array
                $scope.history.push(historyObj);
            }
        }
    };
}]);
