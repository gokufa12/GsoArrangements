(function() {
    'use strict';
    
    angular
        .module('app.user')
        .controller('UserSignUpController', UserSignUpController);
    
    UserSignUpController.$inject = [
        '$log',
        '$scope',
        'UserDataService'
    ];
    
    function UserSignUpController(
        $log,
        $scope,
        UserDataService
    ) {
        var vm = this;
        
        vm.testString = testFn();
        
        function testFn() {
            return UserDataService.testServiceFn();
        }
    }
})();