'use strict';
/* global angular, jasmine, describe, it, expect, module, inject, beforeEach, spyOn */

describe('The houseBrandOAuthAPI service provider', function(){
    var houseBrandOAuthAPIProviderAlias;
    //var http;
    beforeEach( function( ){
        var ngOAuthTest = angular.module('ngOAuthTest',['ngOAuth']);
        ngOAuthTest.config(['houseBrandOAuthAPIProvider',function(houseBrandOAuthAPIProvider){
            houseBrandOAuthAPIProviderAlias=houseBrandOAuthAPIProvider;
            houseBrandOAuthAPIProviderAlias.endpoint('http://unit-tests/api/signin');
        }]);

        module('ngOAuthTest');
        inject(function () {});
    });

    it('should expose a enpoint method that', function() {
        expect(houseBrandOAuthAPIProviderAlias.endpoint).toBeDefined();
    });
    it('should allow for the configuration of the api endpoint', inject(function(houseBrandOAuthAPI) {
        expect(houseBrandOAuthAPI.endpoint).toEqual('http://unit-tests/api/signin');
    }));
});


describe('The houseBrandOAuthAPI service', function(){
    beforeEach( module('ngOAuth') );
    var houseBrandOAuthAPI;
    var $rootScope;
    beforeEach( inject( function(_$rootScope_, _houseBrandOAuthAPI_){
        $rootScope = _$rootScope_;
        houseBrandOAuthAPI = _houseBrandOAuthAPI_;
    }));

    it( 'should expose the loadAccessToken method that', function() {
        expect(houseBrandOAuthAPI.loadAccessToken).toBeDefined();
    });
    it( 'should return a promise that will load a accessToken for a given valid username and password', function() {
        var promise = houseBrandOAuthAPI.loadAccessToken('lampião', 'correctPassword');
        //expect().toBeDefined();
    });
    it( 'should return a promise that will be rejected for a given INvalid username and password', function() {
        var promise = houseBrandOAuthAPI.loadAccessToken('lampião', 'incorrectPassword');
        //expect().toBeDefined();
    });
    it( 'should expose the loadUserInfo method that', function() {
        expect(houseBrandOAuthAPI.loadUserInfo).toBeDefined();
    });
    it( 'should return a promise that will load the user info for a given valid accessToken', function() {
        var promise = houseBrandOAuthAPI.loadUserInfo('lampião');
        //expect().toBeDefined();
    });
    it( 'should return a promise that will be rejected if cannot be loadd', function() {
        var promise = houseBrandOAuthAPI.loadUserInfo('lampião');
        //expect().toBeDefined();
    });

});