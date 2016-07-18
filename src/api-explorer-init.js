'use strict';

angular.module('ApiExplorer', ['ngRoute', 'AdalAngular', 'ngAnimate', 'ui.bootstrap', 'ngProgress', 'ngMaterial'])
    .config(['$routeProvider', '$httpProvider', 'adalAuthenticationServiceProvider', '$mdThemingProvider', function ($routeProvider, $httpProvider, adalProvider, $mdThemingProvider) {

        $routeProvider.when("/Home", {
            controller: "ApiExplorerCtrl",
            templateUrl: "/App/Views/Home.html",
        }).otherwise({
            redirectTo: '/'
        });

        adalProvider.init({
                instance: 'https://login.microsoftonline.com/',
                tenant: 'common',
                clientId: '41359d1a-a069-4a6b-aaf1-b398c18b6c16', //'2e8459fe-87ef-4286-af70-f33a307563aa',
                endpoints: {
                    "https://graph.microsoft.com" :{
                    scope:["calendars.readWrite contacts.readWrite files.read.all user.readWrite mail.readWrite mail.send sites.read.all tasks.readWrite people.read notes.readWrite.all"] 
                  } 
                
                }, 
                scope:["calendars.readWrite contacts.readWrite files.read.all user.readWrite mail.readWrite mail.send sites.read.all tasks.readWrite people.read notes.readWrite.all"], 

                cacheLocation: 'localStorage'
            },
            $httpProvider
        );
        
        $mdThemingProvider.definePalette('O365PrimaryPalette', {
                '50': 'e9f0fc',
                '100': 'd3e2f8',
                '200': 'bdd3f5',
                '300': '91b6ee', 
                '400': '6599e7',
                '500': '4685e2', //blue
                '600': '387be0',
                '700': '226ddd',
                '800': '1f62c7', 
                '900': '1c57b0',
                'A100': 'FF6A00', 
                'A200': 'FF6A00', 
                'A400': 'FF6A00', 
                'A700': 'FF6A00', 
                'contrastDefaultColor': 'light',   
                'contrastDarkColors': ['50', '100', 
                 '200', '300', '400', 'A100'],
                'contrastLightColors': undefined 
        });
        
        $mdThemingProvider.definePalette('O365AccentPalette', {
                '50': 'ffc499',
                '100': 'ffb580',
                '200': 'ffa666',
                '300': 'ff974d', 
                '400': 'ff8833',
                '500': 'FF6A00', //orange
                '600': 'e66000',
                '700': 'cc5500',
                '800': 'b34a00', 
                '900': '994000',
                'A100': 'FF6A00',
                'A200': 'FF6A00', 
                'A400': 'FF6A00', 
                'A700': 'FF6A00', 
        });
                                         
        
        $mdThemingProvider.theme('default').primaryPalette('O365PrimaryPalette');
        $mdThemingProvider.theme('default').accentPalette('O365AccentPalette');
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