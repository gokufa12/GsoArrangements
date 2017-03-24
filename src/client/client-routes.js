(function() {
    'use strict';
    
    angular
        .module('app')
        .config(clientRoutes);
        
    clientRoutes.$inject = [
        // inject required dependencies here as STRINGS
        '$locationProvider',
        '$routeProvider'
    ];
    
    function clientRoutes(
        // reiterate dependencies listed in $inject
        $locationProvider,
        $routeProvider
    ) {
        var _routes = [
            // example routing below: create your own relative paths!
            /*{path: '/ex/ample', view: 'client/url/example.html'}*/
            
            {path: '/home', view: 'client/common/views/home.html'},
            
            {path: '/signup', view: 'client/user/views/user-signup.html'},
            {path: '/login', view: 'client/user/views/user-login.html'}
        ];
        
        _.each(_routes, function(route) {
            $routeProvider.when(route.path, {templateUrl: route.view});
        });
        
        $routeProvider.otherwise({
            redirectTo: '/home'   
        });
        
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }
})();