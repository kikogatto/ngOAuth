'use strict';
/* global angular */

var ngOAuth = angular.module('ngOAuth');

/************************************************************************************************
 * HouseBrandOAuth
 ************************************************************************************************/
 // Service
ngOAuth.service('houseBrandOAuth', ['OAuth', 'houseBrandOAuthAPI', function(OAuth, houseBrandOAuthAPI) {
    return {
        authenticate : function( username, password ) {
            var promiseToAuthenticate = houseBrandOAuthAPI.loadAccessToken( username, password);
            OAuth.manager.authentication(promiseToAuthenticate, this);
            return promiseToAuthenticate;
        },

        loadUser : function( accessToken ) {
            var promiseToLoadUser = houseBrandOAuthAPI.loadUserInfo(accessToken);
            OAuth.manager.info(promiseToLoadUser);
            return promiseToLoadUser;
        },

        authorize : function( accessToken, permissions ) {
            var promiseToAuthorize = houseBrandOAuthAPI.authorize(accessToken, permissions);
            OAuth.manager.authorize(promiseToAuthorize);
            return promiseToAuthorize;
        }
    };
}]);

// Directive
ngOAuth.directive('houseBrandLogin', [ 'houseBrandOAuth',  function ( houseBrandOAuth ) {
    return {
        restrict: 'EA',
        templateUrl:  'core/houseBrandLogin.html',
        replace: true,
        scope:{},
        link: function (scope, iElement, iAttrs) {
            scope.loginData = {};
            scope.loginButton = {
                label : 'Sign in'
            };
            scope.validate = function() {
                return( scope.loginData.Email && scope.loginData.Email.length > 0 && scope.loginData.Password && scope.loginData.Password.length > 0 );
            };
            scope.login = function() {
                if( !scope.validate() ) {
                    return false;
                }
                scope.error = false;
                scope.loginButton.label='Signing in...';
                var $promise = houseBrandOAuth.authenticate( scope.loginData.Email, scope.loginData.Password );
                $promise.then( function (accessToken) {
                    scope.loginButton.label = 'Sign in';
                }).catch( function(error) {
                    scope.error = true;
                    scope.loginButton.label = 'Sign in';
                });
                return true;
            };
        }
    };
}]);
