'use strict';

angular.module('ApiExplorer', ['ngRoute', 'AdalAngular', 'ngAnimate', 'ui.bootstrap', 'ngProgress'])
    .config(['$routeProvider', '$httpProvider', 'adalAuthenticationServiceProvider', function ($routeProvider, $httpProvider, adalProvider) {

        $routeProvider.when("/Home", {
            controller: "ApiExplorerCtrl",
            templateUrl: "/App/Views/Home.html",
        }).otherwise({
            redirectTo: '/'
        });

        adalProvider.init({
                instance: 'https://login.microsoftonline.com/',
                tenant: 'common',
                clientId: '76a89b1b-d49c-42e0-859a-53324fe7eb6a',
                endpoints: {
                    "https://graph.microsoft.com": "https://graph.microsoft.com"
                },
                scope:["https://graph.microsoft.com/mail.read"],
                cacheLocation: 'localStorage'
            },
            $httpProvider
        );
}]);
// v2 - 76a89b1b-d49c-42e0-859a-53324fe7eb6a
//test - ce268d90-5d39-403c-a3a0-8d463140d4a9
//real - 8a3eb86b-8149-4231-9ff3-3c50958ea0fd
