angular.module('ApiExplorer')
    .controller('ApiExplorerCtrl', ['$scope', '$log', 'adalAuthenticationService', '$location', 'ApiExplorerSvc', function ($scope, $log, adalService, $location, apiService) {
        var expanded = true;

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
    });  angular.module('ApiExplorer')
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

        $scope.$parent.$on("populateUrls", function (event, args) {
            
            var cacheKey;
            
            switch($scope.$parent.selectedVersion){
                case "v1.0":
                    cacheKey = "v1EntitySetData";
                    break;
                case "beta":
                    $log.log("here");
                    cacheKey = "betaEntitySetData";
                    
            }
                    
            var data = apiService.cache.get(cacheKey);
            for(var i=0; i<data.length; i++){
                   $scope.urlOptions.push('https://graph.microsoft.com/v1.0/' + data[i]);
            }
            
            $log.log($scope.urlOptions);
            
            //$scope.urlOptions = "graph.microsoft.com"
            
            
            
                /*[
                
                "https://graph.microsoft.com/v1.0/me",
                "https://graph.microsoft.com/v1.0/users",
                "https://graph.microsoft.com/v1.0/me/messages",
                "https://graph.microsoft.com/v1.0/drive",
                "https://graph.microsoft.com/v1.0/groups",
                "https://graph.microsoft.com/v1.0/devices",
                "https://graph.microsoft.com/beta/me",
                "https://graph.microsoft.com/beta/users",
                "https://graph.microsoft.com/beta/me/messages",
                "https://graph.microsoft.com/beta/drive",
                "https://graph.microsoft.com/beta/devices",
                "https://graph.microsoft.com/beta/groups",
                "https://graph.microsoft.com/beta/me/notes/notebooks"
            ];*/
        });
    }]);

angular.module('ApiExplorer').controller('FormCtrl', ['$scope', '$log', 'ApiExplorerSvc', 'ngProgressFactory', function ($scope, $log, apiService, ngProgressFactory) {
    $scope.text = 'https://graph.microsoft.com/v1.0/';
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

    $scope.submit = function () {
        
        var entitySetData, entityTypeData;
//        parseMetadata($scope.$parent.selectedVersion, apiService, $log, $scope);
        
        
        $scope.$emit('clearUrls');
        if ($scope.text) {
            
            $log.log($scope.text);
            
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
