'use strict';
/* global angular */

var ngOAuth = angular.module('ngOAuth');
/************************************************************************************************
 * HouseBrandOAuthAPI
 ************************************************************************************************/
//Service
function _houseBrandOAuthAPI ($http, _endpoint) {
	var services = {
		endpoint : _endpoint,
	    loadAccessToken : function(username, password) {
	    	return $http.post(this.endpoint, {username:username,password:password});
	    },
	    loadUserInfo : function( accessToken ) {
	    	return $http.get( this.endpoint );
	    },
	    authorize : function(accessToken, permissions) {

	    }

	};
	return services;
};

//Provider
ngOAuth.provider('houseBrandOAuthAPI', [function houseBrandOAuthAPIProvider() {
    var endpoint;

    this.endpoint = function( _endpoint ) {
        endpoint = _endpoint;
    };

    this.$get = [ '$http', function houseBrandOAuthAPIFactory( $http ) {
        return  _houseBrandOAuthAPI( $http, endpoint);
    }];
}]);

