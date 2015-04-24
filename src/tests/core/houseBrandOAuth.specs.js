'use strict';
/* global angular, jasmine, describe, it, expect, module, inject, beforeEach, spyOn */

describe('The houseBrandOAuth service', function(){
    var houseBrandOAuth;
    var $rootScope;
    var $q;
    var mockHouseBrandOAuthAPI = {
        loadAccessToken : function(username, password) {
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
                defered.resolve( {access_token:'ANiceBearerToken'});
            }
            return defered.promise;
        },
        loadUserInfo : function( accessToken ) {
            var defered = $q.defer();
            defered.promise.success = defered.promise.then;
            defered.promise.error = defered.promise.catch;
            if( accessToken.access_token.indexOf('ANiceBearerToken') ===0 ) {
                defered.resolve( {name:'Virgulino Ferreira', salutation: 'Cap.', username: 'Lampião'});
            } else {
                defered.reject( {code:'0001', message:'Could not load user'} );
            }
            return defered.promise;
        },
        authorize : function(accessToken, permissions) {

        }
    };
    beforeEach( module('ngOAuth', function($provide){
        $provide.value('houseBrandOAuthAPI', mockHouseBrandOAuthAPI );
    }) );
    beforeEach( inject( function(_$rootScope_, _$q_, _houseBrandOAuth_){
        $rootScope = _$rootScope_;
        $q = _$q_;
        houseBrandOAuth = _houseBrandOAuth_;
    }));

    it( 'should expose the authenticate method', function() {
        expect(houseBrandOAuth.authenticate).toBeDefined();
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
            var promise = houseBrandOAuth.authenticate('user@teste.com', 'correctPassword');
            $rootScope.$digest();
            expect(OAuth.manager.authentication).toHaveBeenCalledWith(promise, houseBrandOAuth);
            done();
        });

        it('should return a promise for a valid access Token when given username and password', function() {
            var promise = houseBrandOAuth.authenticate('user@teste.com', 'correctPassword');
            expect( promise ).toBeDefined();
            expect( promise.then ).toBeDefined();
            expect( promise.catch ).toBeDefined();
            expect( promise.success ).toBeDefined();
            expect( promise.error ).toBeDefined();
        });

        it(' the promise should return a valid access token if authenticated,', function(  done ) {
            var promise = houseBrandOAuth.authenticate('user@teste.com', 'correctPassword');
            var handler = jasmine.createSpy('then');
            promise.then(handler);
            $rootScope.$digest();
            expect(handler).toHaveBeenCalledWith({'access_token':'ANiceBearerToken'});
            done();
        });

        it(' the promise should return 400 http status code if NOT authenticated,', function(  done ) {
            var promise = houseBrandOAuth.authenticate('user@teste.com', 'incorrectPassword');
            var handler = jasmine.createSpy('catch');
            promise.catch( handler );
            $rootScope.$digest();

            expect(handler).toHaveBeenCalledWith(error);
            done();
        });
    });
    it( 'should expose the loadUser method', function() {
        expect(houseBrandOAuth.loadUser).toBeDefined();
    });
    describe('The loadUser method', function() {
        var OAuth;

        beforeEach( inject( function( _OAuth_ ){
            OAuth = _OAuth_;
        }));

        it('should call the info method on OAuth.manager, if successfull', function(  done ) {
            spyOn(OAuth.manager, 'info');
            var promise= houseBrandOAuth.loadUser({'access_token':'ANiceBearerToken'});
            $rootScope.$digest();
            expect(OAuth.manager.info).toHaveBeenCalledWith(promise);
            done();
        });

        it('should return a promise for a valid User when given an access Token', function() {
            var promise = houseBrandOAuth.loadUser({'access_token':'ANiceBearerToken'});
            expect( promise ).toBeDefined();
            expect( promise.then ).toBeDefined();
            expect( promise.catch ).toBeDefined();
            expect( promise.success ).toBeDefined();
            expect( promise.error ).toBeDefined();
        });
        it(' the promise should return user info if successfull,', function(  done ) {
            var userInfo = {name:'Virgulino Ferreira', salutation: 'Cap.', username: 'Lampião'};
            var promise = houseBrandOAuth.loadUser({'access_token':'ANiceBearerToken'});
            var handler = jasmine.createSpy('then');
            promise.then(handler);
            $rootScope.$digest();
            expect(handler).toHaveBeenCalledWith(userInfo);
            done();
        });

        it(' the promise should return an error if it fails,', function(  done ) {
            var promise = houseBrandOAuth.loadUser({'access_token':'NotSoNiceBearerToken'});
            var handler = jasmine.createSpy('catch');
            promise.catch( handler );
            $rootScope.$digest();

            expect(handler).toHaveBeenCalledWith({code:'0001', message:'Could not load user'});
            done();
        });

    });
});

describe('The houseBrandLogin directive', function() {
    var element;
    var $rootScope;
    var $q;
    var mockHouseBrandOAuthAPI = {
        loadAccessToken : function(username, password) {
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
                defered.resolve( {access_token:'ANiceBearerToken'});
            }
            return defered.promise;
        },
        loadUserInfo : function( accessToken ) {
            var defered = $q.defer();
            defered.promise.success = defered.promise.then;
            defered.promise.error = defered.promise.catch;
            if( accessToken.access_token.indexOf('ANiceBearerToken') ===0 ) {
                defered.resolve( {name:'Virgulino Ferreira', salutation: 'Cap.', username: 'Lampião'});
            } else {
                defered.reject( {code:'0001', message:'Could not load user'} );
            }
            return defered.promise;
        },
        authorize : function(accessToken, permissions) {

        }
    };
    beforeEach( module('ngOAuth', function($provide){
        $provide.value('houseBrandOAuthAPI', mockHouseBrandOAuthAPI );
    }) );
    beforeEach(inject( function ( $compile, _$q_, _$rootScope_ ) {
        $rootScope = _$rootScope_;
        $q = _$q_;
        var scope = $rootScope.$new();
        element = $compile('<house-brand-login></house-brand-login>')( scope );
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
    it(' should include username and passoword fields', function() {
        expect( $(element).find('input[type="email"]').length ).toBe(1);
        expect( $(element).find('input[type="password"]').length ).toBe(1);
    });
    it('should add an empty loginData object to the scope', function() {
        var scope = element.isolateScope();
        expect( scope.loginData ).toBeDefined();
    });
    it('should add a loginButton object to the scope, with the label', function() {
        var scope = element.isolateScope();
        expect( scope.loginButton ).toBeDefined();
        expect( scope.loginButton.label ).toEqual('Sign in');
    });
    it('should add a validate method to the scope, that validates the fields', function() {
        var scope = element.isolateScope();
        expect( scope.validate ).toBeDefined();
        expect( scope.validate() ).toBeFalsy();
        scope.loginData.Email='user@teste.com';
        scope.loginData.Password='correctPassword';
        expect( scope.validate() ).toBeTruthy();
    });

    it('should add a login method to the scope', function() {
        var scope = element.isolateScope();
        expect( scope.login ).toBeDefined();
    });
    describe('The login method', function() {
        it('should do nothing and return falsy if the username and password dont validate', function(done) {
            var scope = element.isolateScope();

            scope.loginData.Email='user';
            scope.loginData.Password='';
            var valid = scope.login();
            $rootScope.$digest();
            expect( valid ).toBeFalsy();
            done();
        });

        it('should change the login button label while the login is in progress, then change it back', function(done) {
            var scope = element.isolateScope();

            scope.loginData.Email='user@teste.com';
            scope.loginData.Password='aaaaaaaaa';
            scope.login();
            expect( scope.loginButton.label ).toEqual('Signing in...');
            $rootScope.$digest();
            expect( scope.error ).toBeFalsy();
            expect( scope.loginButton.label ).toEqual('Sign in');
            done();
        });
        it('should change the login button label back if login faild, and add an error property to the scope', function(done) {
            var scope = element.isolateScope();

            scope.loginData.Email='user@teste.com';
            scope.loginData.Password='incorrectPassword';
            scope.login();
            expect( scope.loginButton.label ).toEqual('Signing in...');
            $rootScope.$digest();
            expect( scope.error ).toBeTruthy();
            expect( scope.loginButton.label ).toEqual('Sign in');
            done();
        });
    });
});
