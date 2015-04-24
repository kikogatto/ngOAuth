'use strict';
/* global angular, jasmine, describe, it, expect, module, inject, beforeEach, spyOn */

var demoOAuthSpecs = angular.module('dmeoOAuthSpecs', ['ngOAuth','ngMock']);

describe('The demoOAuth service provider', function(){
    var demoOAuthProviderAlias;
    beforeEach( function(){
        var ngOAuthTest = angular.module('ngOAuthTest',['ngOAuth']);
        ngOAuthTest.config(['demoOAuthProvider',function(demoOAuthProvider){
            demoOAuthProviderAlias=demoOAuthProvider;
            demoOAuthProviderAlias.users([{username:'admin', success:true}, {username:'guest',success:false}]);
        }]);

        module('ngOAuthTest');
        inject(function () {});
    });

    it( 'should expose the users method, that configures the users for the service', function() {
        expect(demoOAuthProviderAlias.users).toBeDefined();
    });
    it('should now provide a service with the configured users', inject(function(demoOAuth){
        expect( demoOAuth.users.length).toEqual(2);
    }));
});

describe('The demoOAuth service', function(){
    beforeEach( module('ngOAuth') );
    var demoOAuth;
    var $rootScope;
    beforeEach( inject( function(_$rootScope_, _demoOAuth_){
        $rootScope = _$rootScope_;
        demoOAuth = _demoOAuth_;
    }));

    it( 'should expose the authenticate method', function() {
        expect(demoOAuth.authenticate).toBeDefined();
    });

    describe('The authenticate method', function() {
        var OAuth;
        var error =  {
            status:400,
            data: {error:'invalid_grant', error_description : 'The user name or password is incorrect.' }
        };

        beforeEach( inject( function( _OAuth_ ){
            OAuth = _OAuth_;
        }));
        it('should call the authentication method on OAuth.manager, with the promise to authenticate', function(  done ) {
            spyOn(OAuth.manager, 'authentication');
            var promise = demoOAuth.authenticate('user@teste.com', 'correctPassword');
            $rootScope.$digest();
            expect(OAuth.manager.authentication).toHaveBeenCalledWith(promise, demoOAuth);
            done();
        });

        it('should return a promise for a valid access Token when given username and password', function() {
            var promise = demoOAuth.authenticate('user@teste.com', 'correctPassword');
            expect( promise ).toBeDefined();
            expect( promise.then ).toBeDefined();
            expect( promise.catch ).toBeDefined();
            expect( promise.success ).toBeDefined();
            expect( promise.error ).toBeDefined();
        });

        it(' the promise should return a valid access token if authenticated,', function(  done ) {
            var promise = demoOAuth.authenticate('user@teste.com', 'correctPassword');
            var handler = jasmine.createSpy('then');
            promise.then(handler);
            $rootScope.$digest();
            expect(handler).toHaveBeenCalledWith({'access_token':'ANiceBearerToken'});
            done();
        });

        it(' the promise should return 400 http status code if NOT authenticated,', function(  done ) {
            var promise = demoOAuth.authenticate('user@teste.com', 'incorrectPassword');
            var handler = jasmine.createSpy('catch');
            promise.catch( handler );
            $rootScope.$digest();

            expect(handler).toHaveBeenCalledWith(error);
            done();
        });
    });
    it( 'should expose the loadUser method', function() {
        expect(demoOAuth.loadUser).toBeDefined();
    });
    describe('The loadUser method', function() {
        var OAuth;

        beforeEach( inject( function( _OAuth_ ){
            OAuth = _OAuth_;
        }));

        it('should call the info method on OAuth.manager, if successfull', function(  done ) {
            spyOn(OAuth.manager, 'info');
            var promise= demoOAuth.loadUser({'access_token':'ANiceBearerToken'});
            $rootScope.$digest();
            expect(OAuth.manager.info).toHaveBeenCalledWith(promise);
            done();
        });

        it('should return a promise for a valid User when given an access Token', function() {
            var promise = demoOAuth.loadUser({'access_token':'ANiceBearerToken'});
            expect( promise ).toBeDefined();
            expect( promise.then ).toBeDefined();
            expect( promise.catch ).toBeDefined();
            expect( promise.success ).toBeDefined();
            expect( promise.error ).toBeDefined();
        });
        it(' the promise should return user info if successfull,', function(  done ) {
            var userInfo = {name:'Jonathan Doe', salutation: 'Mr.', username: 'joe'};
            var promise = demoOAuth.loadUser({'access_token':'ANiceBearerToken'});
            var handler = jasmine.createSpy('then');
            promise.then(handler);
            $rootScope.$digest();
            expect(handler).toHaveBeenCalledWith(userInfo);
            done();
        });

        it(' the promise should return an error if it fails,', function(  done ) {
            var promise = demoOAuth.loadUser({'access_token':'NotSoNiceBearerToken'});
            var handler = jasmine.createSpy('catch');
            promise.catch( handler );
            $rootScope.$digest();

            expect(handler).toHaveBeenCalledWith({code:'0001', message:'Could not load user'});
            done();
        });

    });
});

describe('The demoLogin directive', function() {
    var element;
    var $rootScope;
    beforeEach( module('ngOAuth') );
    beforeEach(inject( function ( $compile, _$rootScope_ ) {
        $rootScope = _$rootScope_;
        var scope = $rootScope.$new();
        element = $compile('<demo-login></demo-login>')( scope );
        scope.$digest();
    }));

    it('should have an isolated scope', inject( function() {
        var scope = element.isolateScope();
        expect( scope ).toBeDefined();
    }));

    it('should replace the element with the appropriate content that', function() {
        expect( $(element).prop('tagName') ).toEqual('FORM');
        expect( $(element).attr('name') ).toEqual('loginForm');
        expect( $(element).attr('novalidate') ).toEqual('');
    });
    it(' should include select user field', function() {
        expect( $(element).find('select').length ).toBe(1);
    });
    it('should add an users array to the scope', function() {
        var scope = element.isolateScope();
        expect( scope.users ).toBeDefined();
    });
    it('should add an selectedUser object to the scope, with the firts item of the users array', function() {
        var scope = element.isolateScope();
        expect( scope.selectedUser ).toBeDefined();
        expect( scope.selectedUser ).toBe( scope.users[0]);
    });

    it('should add a loginButton object to the scope, with the label', function() {
        var scope = element.isolateScope();
        expect( scope.loginButton ).toBeDefined();
        expect( scope.loginButton.label ).toEqual('Sign in');
    });

    it('should add a login method to the scope', function() {
        var scope = element.isolateScope();
        expect( scope.login ).toBeDefined();
    });
    describe('The login method', function() {
        it('should change the login button label while the login is in progress, then change it back', function(done) {
            var scope = element.isolateScope();
            scope.login();
            expect( scope.loginButton.label ).toEqual('Signing in...');
            $rootScope.$digest();
            expect( scope.error ).toBeFalsy();
            expect( scope.loginButton.label ).toEqual('Sign in');
            done();
        });
        it('should change the login button label back if login faild, and add an error property to the scope', function(done) {
            var scope = element.isolateScope();
            scope.selectedUser = scope.users[2];
            scope.login();
            expect( scope.loginButton.label ).toEqual('Signing in...');
            $rootScope.$digest();
            expect( scope.error ).toBeTruthy();
            expect( scope.loginButton.label ).toEqual('Sign in');
            done();
        });
    });
});
