'use strict';

angular.module('ApiExplorer', ['ngRoute', 'AdalAngular', 'ngAnimate', 'ui.bootstrap', 'ngProgress', 'ngMaterial'])
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
                clientId: '2e8459fe-87ef-4286-af70-f33a307563aa',
                endpoints: {
                    "https://graph.microsoft.com": "https://graph.microsoft.com"
                },
                cacheLocation: 'localStorage'
            },
            $httpProvider
        );
}]);
// v2 - 76a89b1b-d49c-42e0-859a-53324fe7eb6a
//test - ce268d90-5d39-403c-a3a0-8d463140d4a9
//real - 8a3eb86b-8149-4231-9ff3-3c50958ea0fd
//    "Calendars.Read":["https://outlook.office.com","https://graph.microsoft.com"],          \
//    "Calendars.ReadWrite":["https://outlook.office.com","https://graph.microsoft.com"],     \
//    "Contacts.Read":["https://outlook.office.com","https://graph.microsoft.com"],           \
//    "Contacts.ReadWrite":["https://outlook.office.com","https://graph.microsoft.com"],      \
//    "Files.Read":["https://graph.microsoft.com"],                                           \
//    "Files.ReadWrite":["https://graph.microsoft.com"],                                      \
//    "User.Read":["https://graph.microsoft.com"],                                            \
//    "User.ReadWrite":["https://graph.microsoft.com"],                                       \
//    "People.Read":["https://outlook.office.com","https://graph.microsoft.com"],             \
//    "People.ReadWrite":["https://outlook.office.com","https://graph.microsoft.com"]         \ 