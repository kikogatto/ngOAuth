'use strict';
/* global angular, jasmine, describe, it, expect, module, inject, beforeEach, spyOn */

var AuthSpecs = angular.module('AuthSpecs', ['ngOAuth']);

AuthSpecs.config( ['$routeProvider', function ( $routeProvider ) {
    $routeProvider.when('/secureRoute', { redirectTo:'/', requires :['redir'] })
    .when('/secureRoute2', { redirectTo:'/404', requires :['redir'], resolve : {'requirement': ['$q', function($q) { var d =$q.defer(); d.reject('because'); return d.promise;}]} })
    .when('/openRoute', { redirectTo:'/404'});
}]);

describe('The ngOAuth module', function() {
    var httpProvider;
    var $route;
    beforeEach( module('AuthSpecs') );
    beforeEach( module('ngOAuth', function($httpProvider) {
        httpProvider = $httpProvider;
    }));
    beforeEach(inject(function( _$route_) {
        $route = _$route_;
    }));

    it('should have these requirements', function() {
        var ngOAuth = angular.module('ngOAuth');
        expect(ngOAuth.requires.length).toBe(3);
        expect(ngOAuth.requires).toContain('ngRoute');
        expect(ngOAuth.requires).toContain('ngStorage');
        expect(ngOAuth.requires).toContain('compiledTemplates');
    });

    it('should set the $httpProvider default for the withCredentials to true', inject( function( ) {
        expect(httpProvider.defaults.withCredentials).toBeTruthy();
    }));

    it('should decorate $route service augmenting each route with a requires array', inject( function( ) {
        expect($route.AuthRoute).toBeDefined();
    }));
    it(' that adds a $requiredAuthorization to the resolve map (adds the map if needed)', inject( function( ) {
        var resolve = $route.routes['/secureRoute'].resolve;
        expect(resolve).toBeDefined();
        expect( angular.isObject(resolve)).toBeTruthy();
        expect(resolve.$requiredAuthorization).toBeDefined();
        expect( angular.isArray(resolve.$requiredAuthorization)).toBeTruthy();
        expect( angular.isString(resolve.$requiredAuthorization[0])).toBeTruthy();
        expect( angular.isFunction(resolve.$requiredAuthorization[1])).toBeTruthy();
    }));

    it(' that does not change the resolve if not needed', inject( function( ) {
        expect($route.routes['/openRoute'].resolve).not.toBeDefined();
    }));

    it(' that will not resolve if not authorized', inject( function( $rootScope, $location, OAuth ) {
        OAuth.me.signOut();
        $location.path('/');
        $rootScope.$apply();
        $location.path('/secureRoute');
        $rootScope.$apply();
        expect( $location.path()).toBe('/');
        //expect( $route.current.path).toBe('/');
    }));

    it(' but does nothing if open', inject( function( $rootScope, $location ) {
        $location.path('/');
        $location.path('/openRoute');
        $rootScope.$apply();
        expect( $location.path()).toBe('/404');
    }));

    it(' does not change other resolve errors', inject( function( $rootScope, $location, OAuth ) {
        OAuth.me.signOut();
        $location.path('/aaa');
        $location.path('/secureRoute2');
        $rootScope.$apply();
        expect( $location.path()).toBe('/404');
    }));


});

describe('The OAuth service provider', function(){
    var OAuthProviderAlias;
    //var http;
    beforeEach( function( ){
        var ngOAuthTest = angular.module('ngOAuthTest',['ngOAuth']);
        ngOAuthTest.config(['OAuthProvider',function(OAuthProvider){
            OAuthProviderAlias=OAuthProvider;
        }]);

        module('ngOAuthTest');
        inject(function () {});
    });
});

describe('The OAuth service', function(){
    beforeEach( module('ngOAuth') );
    var OAuth;
    var $rootScope;
    var $q;
    var $http;
    beforeEach( inject( function(_$rootScope_, _$q_,_$http_, _OAuth_){
        $rootScope = _$rootScope_;
        $q = _$q_;
        $http=_$http_;
        OAuth = _OAuth_;
        OAuth.me.signOut();
    }));

    it('should add a transformRequest to the $http defaults', inject( function( ) {
        //expect(http.defaults.transformRequest.length).toBe( 2 );
    }));

    describe('should expose a manager object that', function() {
        var manager;
        beforeEach(function() {
            manager = OAuth.manager;
        });
        it( 'exists', function() {
            expect(manager).toBeDefined();
        });
        describe('should expose a authentication method that', function() {
            it( 'exists', function() {
                expect(manager.authentication).toBeDefined();
            });

            it('should save the given promise to authenticate', function() {
                var defered = $q.defer();
                var provider= {};
                manager.authentication(defered.promise, provider);
                expect( manager.authentication() ).toBe(defered.promise);
            });
            it('should save the given OAuth provider', function() {
                var defered = $q.defer();
                var provider= {};
                manager.authentication(defered.promise, provider);
                expect( manager.provider).toBe( provider);
            });
            it('should save the given access Token to the OAuth.me object when the promise resolves', function(done) {
                var defered = $q.defer();
                var provider= {};
                manager.authentication(defered.promise, provider);
                defered.resolve({'access_token':'ANiceBearerToken'});
                $rootScope.$digest();
                expect(OAuth.me.accessToken).toEqual( {access_token:'ANiceBearerToken'});
                done();
            });
            it('should emit a OAuth.authenticated event with the given access Token when the promise resolves', function(done) {
                spyOn($rootScope, '$emit');
                var defered = $q.defer();
                var provider= {};
                manager.authentication(defered.promise, provider);
                defered.resolve({'access_token':'ANiceBearerToken'});
                $rootScope.$digest();
                expect($rootScope.$emit).toHaveBeenCalledWith('OAuth.authenticated', {access_token:'ANiceBearerToken'});
                done();
            });
        });
        describe('should expose a info method that', function() {
            it( 'exists', function() {
                expect(manager.info).toBeDefined();
            });

            it('should save the given promise to load user info', function() {
                var defered = $q.defer();
                manager.info(defered.promise);
                expect( manager.info() ).toBe(defered.promise);
            });
            it('should add the given userInfo to the $rootScope.me object as info, when the promise resolves', function( done ) {
                var userInfo = {name:'Virgulino Ferreira', salutation: 'Cap.', username: 'Lampião'};
                var defered = $q.defer();
                manager.info(defered.promise);
                defered.resolve(userInfo);
                $rootScope.$digest();
                expect( OAuth.me.info.name).toEqual('Virgulino Ferreira');
                expect( OAuth.me.info.salutation).toEqual('Cap.');
                expect( OAuth.me.info.username).toEqual('Lampião');
                done();
            });
            it('should emit a OAuth.userLoaded event with the given userinfo when the promise resolves', function(done) {
                var userInfo = {name:'Virgulino Ferreira', salutation: 'Cap.', username: 'Lampião'};
                var defered = $q.defer();
                spyOn($rootScope, '$emit');
                manager.info(defered.promise);
                defered.resolve(userInfo);
                $rootScope.$digest();
                expect($rootScope.$emit).toHaveBeenCalledWith('OAuth.userLoaded',userInfo);
                done();
            });
        });
    });

    describe('should expose a me object that', function() {
        var me;
        beforeEach(function() {
            me = OAuth.me;
        });
        it( 'exists', function() {
            expect(me).toBeDefined();
        });
        it( 'should also be exposed on the $rootScope', function() {
            expect($rootScope.me).toBeDefined();
            expect($rootScope.me).toBe(me);
        });
        it( 'should expose a amAuthenticated method that', function() {
            expect(me.amAuthenticated).toBeDefined();
        });
        it( ' should return false if there is no authenticated user', function() {
            expect(me.amAuthenticated()).toBeFalsy();
        });
        it( ' and should return true if the user is  authenticated', function() {
            var defered = $q.defer();
            var provider= {};
            OAuth.manager.authentication(defered.promise, provider);
            defered.resolve({'access_token':'ANiceBearerToken'});
            $rootScope.$digest();
            expect($rootScope.me.amAuthenticated()).toBeTruthy();
        });
        it( 'should expose a amAuthorized method that', function() {
            expect(me.amAuthorized).toBeDefined();
        });
        it( ' should return true if the user have ALREADY LOADED all of the given privileges AND have them as true', function() {
            me._permissions={'read':true,'write':true};
            expect(me.amAuthorized(['read'])).toBeTruthy();
            expect(me.amAuthorized(['write'])).toBeTruthy();
            expect(me.amAuthorized(['read','write'])).toBeTruthy();
        });
        it( ' should return false if the user have ALREADY LOADED all of the given privileges BUT AT LEAT one of them is false', function() {
            me._permissions={'read':true,'write':false};
            expect(me.amAuthorized(['read','write'])).toBeFalsy();
        });
        it( ' should return false if the user does not have ALREADY LOADED all of the given privileges ', function() {
            expect(me.amAuthorized(['read'])).toBeFalsy();
            me._permissions={'read':true};
            expect(me.amAuthorized(['read','write'])).toBeFalsy();
        });
        it( 'should expose a signOut method that', function() {
            expect(me.signOut).toBeDefined();
        });
        it( ' should delete the accessToken', function() {
            var defered = $q.defer();
            var provider= {};
            OAuth.manager.authentication(defered.promise, provider);
            defered.resolve({'access_token':'ANiceBearerToken'});
            $rootScope.$digest();
            expect(me.amAuthenticated()).toBeTruthy();
            me.signOut();
            $rootScope.$digest();
            expect(me.amAuthenticated()).toBeFalsy();
        });
        it( ' should delete the me.info', function() {
            me.accessToken = {'access_token':'ANiceBearerToken'};
            me.info = {name:'Virgulino'};
            me.signOut();
            $rootScope.$digest();
            expect(me.info).not.toBeDefined();
        });
        it( ' should clear the loaded permissions', function() {
            me.accessToken = {'access_token':'ANiceBearerToken'};
            me.info = {name:'Virgulino'};
            me._permissions.somePermission = true;
            me.signOut();
            $rootScope.$digest();
            expect(me._permissions).toBeDefined();
            expect(me._permissions.somePermission).not.toBeDefined();
        });
        it( ' should clear the promises to lodad data', function() {
            var defered = $q.defer();
            var provider= {};
            OAuth.manager.authentication(defered.promise, provider);
            defered.resolve({'access_token':'ANiceBearerToken'});
            $rootScope.$digest();
            expect(me.amAuthenticated()).toBeTruthy();

            defered = $q.defer();
            OAuth.manager.info(defered.promise);
            me.signOut();
            expect( OAuth.manager.promiseToAuthenticate).not.toBeDefined();
            expect( OAuth.manager.promiseToLoadUserInfo).not.toBeDefined();
        });

        it(' and should emit a OAuth.userSignOut', function(done) {
            spyOn($rootScope, '$emit');
            me.signOut();
            $rootScope.$digest();
            expect($rootScope.$emit).toHaveBeenCalledWith('OAuth.userSignOut');
            done();
        });
    });
    describe('should expose a loadInfo method that', function() {
        it( 'exists', function() {
            expect(OAuth.loadInfo).toBeDefined();
        });
        it( 'should return the current prppomise to load user info, if it exists', function() {
            expect( OAuth.manager.info()).not.toBeDefined();
            var defered = $q.defer();
            OAuth.manager.info(defered.promise);
            expect( OAuth.manager.info()).toBe(defered.promise);
            expect( OAuth.loadInfo() ).toBe(defered.promise);
        });
        it( 'or should create a new one and return it if it does not exist', function() {
            expect( OAuth.manager.info()).not.toBeDefined();
            var promise = $q.defer().promise;
            OAuth.manager.provider = {loadUser:function() {return promise;}};
            var prom = OAuth.loadInfo();
            expect( prom).toBe(promise);
        });
    });
    describe('should expose a isAuthorized method that', function() {
        it( 'exists', function() {
            expect(OAuth.isAuthorized).toBeDefined();
        });
        it( 'should return true if no privileges are given' , function() {
            var prom = OAuth.isAuthorized();
            expect(prom).toBeDefined();
            expect(prom).toBeTruthy();
        });
        it( 'should return a rejected promise if there is no user BUT the are given privileges', function() {
            var prom = OAuth.isAuthorized([]);
            expect(prom).toBeDefined();
            expect(prom.$$state.status).toBe(2);
            expect(prom.$$state.value).toBe('Not authorized');
        });
        it( 'should return true if the user is authenticated and has already loaded positive authorizations for ALL given privileges', function() {
            OAuth.me._permissions={'read':true,'write':true};
            OAuth.me.accessToken = {access_token:'dsf'};
            var prom = OAuth.isAuthorized(['read','write']);
            expect(prom).toBeDefined();
            expect(prom).toBeTruthy();
        });
        it( 'should return a rejected promise if the user has already loaded a false authorization for at least one of the given privileges', function() {
            OAuth.me._permissions={'read':true,'write':false};
            OAuth.me.accessToken = {access_token:'dsf'};
            var prom = OAuth.isAuthorized(['read','write']);
            expect(prom).toBeDefined();
            expect(prom.$$state.status).toBe(2);
            expect(prom.$$state.value).toBe('Not authorized');
        });
        it( 'should return a promise to load all the not loaded privileges, if all already loaded are true', function() {
            OAuth.me.accessToken = {access_token:'dsf'};
            var promise = $q.defer().promise;
            OAuth.manager.provider = {authorize:function(accessToken, privileges) {return promise;}};
            OAuth.me._permissions={'read':true};
            var prom = OAuth.isAuthorized(['read','write']);
            expect( prom).toBe(promise);
        });
    });
});
