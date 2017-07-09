(function() {
    'use strict';
    
    angular
        .module('app.user')
        .factory('UserDataService', UserDataService);
        
    UserDataService.$inject = [
        '$log',
        '$http'
    ];
    
    function UserDataService(
        $log,
        $http
    ) {
        var service = {
            testServiceFn: testServiceFn,
            userAuthenticate: userAuthenticate
        };
        return service;
        
        function testServiceFn() {
            return 'wassup g';
        }
        
        function userAuthenticate(formData) {
            $http.post('/api/v1/authenticate', formData)
                .then(function(data) {
                    $log.debug(data);
                    return data; // in the controller that calls this, do something with the data
                }, function(error) {
                    $log.debug('Error: ' + error);
                });
        }
    }
})();