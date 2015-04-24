'use strict';
/* global angular */

var ngOAuth = angular.module('ngOAuth');

/************************************************************************************************
 * HouseBrandOAuth
 ************************************************************************************************/
 // Service
function _demoOAuth($q, OAuth, users) {
    return {
        users : users,
        authenticate : function( username, password ) {
            var defered = $q.defer();
            defered.promise.success = defered.promise.then;
            defered.promise.error = defered.promise.catch;
            if( password.indexOf('incorrect') >=0 ) {
                var error = {
                    status :400,
                    data: {error:'invalid_grant', error_description : 'The user name or password is incorrect.' }
                };
                defered.reject( error);
            } else {
                defered.resolve( {access_token: username === 'lampião' ? 'access_token_lampiao' : username === 'maria_bonita' ? 'access_token_maria_bonita' : 'ANiceBearerToken'});
            }
            OAuth.manager.authentication(defered.promise, this);
            return defered.promise;
        },

        loadUser : function( accessToken ) {
            var defered = $q.defer();
            defered.promise.success = defered.promise.then;
            defered.promise.error = defered.promise.catch;
            if( accessToken.access_token.indexOf('lampiao') > 0 ) {
                defered.resolve( {name:'Virgulino Ferreira', salutation: 'Cap.', username: 'Lampião'});
            } else if( accessToken.access_token.indexOf('maria_bonita') > 0 ) {
                defered.resolve( {name:'Maria Déia', salutation: 'Sra.', username: 'maria_bonita'});
            } else if( accessToken.access_token.indexOf('ANiceBearerToken') === 0 ) {
                defered.resolve( {name:'Jonathan Doe', salutation: 'Mr.', username: 'joe'});
            } else {
                defered.reject( {code:'0001', message:'Could not load user'} );
            }
            OAuth.manager.info(defered.promise);
            return defered.promise;
        },

        authorize : function( accessToken, permissions ) {
        }
    };
}

//Provider
ngOAuth.provider('demoOAuth', [function demoOAuthProvider() {
    var users = [{username:'lampião', success : true}, {username:'maria_bonita', success : true}, {username:'corisco', success : false}];

    this.users = function( customUsers ) {
        users = customUsers;
    };

    this.$get = [ '$q', 'OAuth', function demoOAuthFactory( $q, OAuth ) {
        return  _demoOAuth( $q, OAuth, users);
    }];
}]);

// Directive
ngOAuth.directive('demoLogin', [ 'demoOAuth',  function ( demoOAuth ) {
    return {
        restrict: 'EA',
        templateUrl:  'core/demoLogin.html',
        replace: true,
        scope:{},
        link: function (scope, iElement, iAttrs) {
            scope.users = demoOAuth.users;
            scope.selectedUser = demoOAuth.users[0];
            scope.loginButton = {
                label : 'Sign in'
            };
            scope.login = function() {
                scope.error = false;
                scope.loginButton.label='Signing in...';
                var $promise = demoOAuth.authenticate( scope.selectedUser.username, scope.selectedUser.success ? 'somePassword' : 'incorrectPassword' );
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
