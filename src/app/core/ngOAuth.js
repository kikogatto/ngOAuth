'use strict';
/* global angular */

/************************************************************************************************
 * Module definition
 ************************************************************************************************/
var ngOAuth = angular.module('ngOAuth', ['ngRoute','ngStorage','compiledTemplates']);

ngOAuth.config( ['$provide', '$httpProvider', function ($provide, $httpProvider ) {
    var authorizer = function ( privileges ) {
        return ['OAuth', function(OAuth){ return OAuth.isAuthorized( privileges );}];
    };

    $provide.decorator('$route', ['$delegate', function($delegate){
        angular.forEach($delegate.routes, function(route, key) {
            if( angular.isDefined( route.requires ) ) {
                if( !angular.isDefined( route.resolve ) ) {
                    route.resolve = {};
                }
                route.resolve.$requiredAuthorization = authorizer(route.requires);
            }
        });
        $delegate.AuthRoute=true;
        return $delegate;
    }]);

    $httpProvider.defaults.withCredentials = true;

   // $httpProvider.interceptors.push('authInterceptors');
}]);

ngOAuth.run(['$rootScope', function($rootScope) {
    $rootScope.$on('$routeChangeError',function( e, nextRoute, lastRoute, error) {
        if( error === 'Not authorized') {
            $rootScope.$emit('OAuth.authorization.denied');
        }
    });
}]);

ngOAuth.provider('OAuth', [function OAuthProvider() {

    this.$get = ['$rootScope', '$q', '$http', '$localStorage', function OAuthFactory( $rootScope, $q, $http, $localStorage) {
        if( !angular.isDefined($localStorage.me)) {
            $localStorage.me = {
                _permissions : {},
            };
        }
        var me = $localStorage.me;
        $rootScope.me = me;
        me.amAuthenticated = function() {
            return this.accessToken ? true : false;
        };
        me.amAuthorized = function( privileges ) {
            for( var i = 0; i < privileges.length; i++ ) {
                if(!this._permissions[privileges[i]]) {
                    return false;
                }
            }
            return true;
        };
        me.signOut = function() {
            delete this.accessToken;
            delete this.info;
            delete manager.promiseToAuthenticate;
            delete manager.promiseToLoadUserInfo;
            this._permissions = {};
            $rootScope.$emit('OAuth.userSignOut' );
        };

        var manager = {
            authentication : function( promise, provider ) {
                if( !angular.isDefined(promise) ) {
                    return this.promiseToAuthenticate;
                }
                this.promiseToAuthenticate = promise;
                this.provider = provider;

                promise.then( function( accessToken ) {
                    me.accessToken = accessToken;
                    $rootScope.$emit('OAuth.authenticated', accessToken );
                });
                promise.catch( function(error){
                    delete me.accessToken;
                    $rootScope.$emit('OAuth.authenticationError', error );
                });
                return this.promiseToAuthenticate;
            },

            info : function( promise ) {
                if( !angular.isDefined(promise) ) {
                    return this.promiseToLoadUserInfo;
                }
                this.promiseToLoadUserInfo = promise;
                promise.then( function(info) {
                    me.info = info;
                    $rootScope.$emit('OAuth.userLoaded', info );
                });
                promise.catch( function(error){
                    delete me.info;
                    $rootScope.$emit('OAuth.userLoadingError', error );
                });
                return this.promiseToLoadUserInfo;
            },
            authorization : function ( promise ) {

            }
        };

        $http.defaults.transformRequest.push( function(data, headersGetter) {
            if ( me.amAuthenticated() ) {
                headersGetter().Authorization = 'Bearer ' + me.accessToken.access_token;
            }
            return data;
        } );

        return {
            me : me,
            manager : manager,
            loadInfo: function() {
                if( manager.promiseToLoadUserInfo ) {
                    return manager.promiseToLoadUserInfo
                }
                return manager.provider.loadUser(me.accessToken);
            },
            isAuthorized : function( privileges ) {
                if( !angular.isDefined(privileges)) {
                    return true;
                }
                if( !me.amAuthenticated() ) {
                    var deferred = $q.defer();
                    deferred.reject( 'Not authorized' );
                    return deferred.promise;
                }
                var toLoad=[];
                for(var i =0; i< privileges.length;i++) {
                    var perm = me._permissions[privileges[i]];
                    if( !angular.isDefined(perm) ) {
                        toLoad.push(privileges[i]);
                    } else if(!perm){
                        var deferred = $q.defer();
                        deferred.reject( 'Not authorized' );
                        return deferred.promise;
                    }
                }
                if( toLoad.length === 0 ) {
                    return true;
                }
                return manager.provider.authorize( me.accessToken, toLoad);
            }
        };
    }];
}]);