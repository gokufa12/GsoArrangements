(function() {
    'use strict';
    
    angular.module('app', [
        /* dependencies here */
        'ngRoute'
    ])
    .controller('loginController', function($scope, $http, $window) {
        $scope.formData = {};
    
        // Sign In
        $scope.signIn = function() {
            $http.post('/api/v1/authenticate', $scope.formData)
                .then(function(data) {
                    $scope.formData = {};
                    console.log(data);
                    $window.location.assign('/users/');
                }, function(error) {
                    console.log('Error: ' + error);
                });
        };
    })
    .controller('signupController', function($scope, $http, $window, $location) {
        var randomString = function(length) {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for(var i = 0; i < length; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
        };
        
        $scope.formData = {};
    
        // Sign up
        $scope.signUp = function() {
            
            if(!$window.confirm('By signing up, you agree to have your contact information published for other users to see. We will not sell your information or use it for any purposes not related to the use of this website.'))
                return;
            
            $http.post('/api/v1/signup', $scope.formData)
                .then(function(data) {
                    $http.post('/api/v1/signup/mail', { mail: $scope.formData.email, hash : randomString(20)})
                    .then(function(data) {
                        $scope.formData = {};
                        $window.alert('Please check for verification email.');
                    }, function(error) {
                        $window.alert('Error occured while signing up - try a different email');
                        console.error('Error: ' + error);
                    });
                },
                function(error) {
                    $window.alert('Error occured while signing up');
                    console.error('Error: ' + error);
                });          
        };
    });
})();