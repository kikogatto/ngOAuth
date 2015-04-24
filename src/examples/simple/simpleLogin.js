
'use strict';
/* global angular */

/************************************************************************************************
 * Module definition
 ************************************************************************************************/
var simpleLogin = angular.module('simpleLogin', ['ngRoute', 'ngResource', 'ngAnimate', 'ngSanitize', 'ngOAuth']);

simpleLogin.config( ['$routeProvider', function ( $routeProvider ) {
    $routeProvider.when('/', { templateUrl: 'home.html', controller: 'HomeController', requires:[] })
    .when('/login', { templateUrl: 'login.html', controller: 'LoginController' });
}]);

simpleLogin.run(['$rootScope', '$location','OAuth', function($rootScope, $location, OAuth) {
    $rootScope.$on('OAuth.authenticated', function( e, accessToken ) {
        OAuth.loadInfo().then( function(info) { $location.path('/');} );
    });
    $rootScope.$on('OAuth.authorization.denied', function( e, args) {
        $location.path('/login');
    });
    $rootScope.$on('OAuth.userSignOut', function( e, args) {
        $location.path('/login');
    });
}]);

// ***********************************************************************************************
//  * Controllers
//  ***********************************************************************************************
simpleLogin.controller('LoginController', ['$rootScope', function ($rootScope) {
    //$rootScope.bodyClass = {'login' : true, fullScreen : true};
}]);

// ***********************************************************************************************
//  * Controllers
//  ***********************************************************************************************
simpleLogin.controller('HomeController', ['$rootScope', function ($rootScope) {
    //$rootScope.bodyClass = {'login' : true, fullScreen : true};
}]);