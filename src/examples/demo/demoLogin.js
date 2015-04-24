
'use strict';
/* global angular */

/************************************************************************************************
 * Module definition
 ************************************************************************************************/
var demoLogin = angular.module('demoLogin', ['ngRoute', 'ngResource', 'ngAnimate', 'ngSanitize', 'ngOAuth']);

demoLogin.config( ['$routeProvider', function ( $routeProvider ) {
    $routeProvider.when('/', { template: '<div class="title">Hello {{me.info.name}}</div><div class="signOut" ng-click="me.signOut()">Sign out</div>', controller: 'emptyController', requires:[] })
    .when('/login', { template: '<div class="login"><div demo-login></div></div>', controller: 'emptyController' });
}]);

demoLogin.run(['$rootScope', '$location','OAuth', function($rootScope, $location, OAuth) {
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
demoLogin.controller('emptyController', ['$scope', function ($scope) {
}]);

