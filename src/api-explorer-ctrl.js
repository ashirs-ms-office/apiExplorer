'use strict';

angular.module('ApiExplorer')
    .controller('ApiExplorerCtrl', ['$scope', 'adalAuthenticationService', '$location', 'ApiExplorerSvc', function ($scope, adalService, $location, apiService) {
        var expanded = true;

        $scope.selectedOptions = "GET";
        $scope.selectedVersion = "v1.0";
        $scope.showJsonEditor = false;
        $scope.showDuration = false;

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
            $scope.$parent.selectedVersion = selectedVersion;
            $scope.$parent.text = $scope.$parent.text.replace(/https:\/\/graph.microsoft.com($|\/([\w]|\.)*($|\/))/, "https://graph.microsoft.com/" + selectedVersion + "/");
        }
    });

angular.module('ApiExplorer')
    .controller('datalistCtrl', function ($scope, $log) {});

angular.module('ApiExplorer').controller('FormCtrl', ['$scope', '$log', 'ApiExplorerSvc', 'ngProgressFactory', function ($scope, $log, apiService, ngProgressFactory) {
    $scope.text = 'https://graph.microsoft.com/v1.0/';
    $scope.duration = "";
    $scope.progressbar = ngProgressFactory.createInstance();

    // custom link re-routing logic to resolve links
    $scope.$parent.$on("urlChange", function (event, args) {
        if (args.indexOf("https://") == -1) {
            if($scope.text.indexOf(args.substr(1)) != -1){
                
            }
            else if ($scope.text.indexOf("/me") != -1 && $scope.text.indexOf("/me/") == -1) {
                $scope.text = $scope.text.replace("/me", "") + "/users/" + args.substr(1);
            } else {
                if ($scope.text.indexOf("?") != -1) {
                    $scope.text = $scope.text.substr(0, $scope.text.indexOf("?"));
                }
                $scope.text = $scope.text + "/" + args.substr(1);
            }
        } else {
            $scope.text = args.replace("\"", "");
        }
        $scope.selectedOptions = 'GET';
        $scope.submit();
    });

    $scope.submit = function () {
        if ($scope.text) {
            $scope.previousString = $scope.text;
            $log.log($scope.text);

            if ($scope.userInfo.isAuthenticated) {
                $scope.progressbar.reset();
                $scope.progressbar.start();
                var postBody = "";
                if ($scope.jsonEditor != undefined) {
                    postBody = $scope.jsonEditor.getSession().getValue();
                }
                var startTime = new Date();
                var endTime = null;
                apiService.performQuery($scope.selectedOptions)($scope.text, postBody).success(function (results, status, headers, config) {
                    handleResponse($scope, startTime, results);
                }).error(function (err, status) {
                    handleResponse($scope, startTime, err);
                });
            }
        }
    };
}]);