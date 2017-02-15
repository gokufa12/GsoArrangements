(function() {
    'use strict';
    
    angular
        .module('app')
        .config(clientRoutes);
        
    clientRoutes.$inject = [
        // inject required dependencies here as STRINGS
        '$locationProvider',
        '$routeProvider',
        '$log'
    ];
    
    function clientRoutes(
        // reiterate dependencies listed in $inject
        $locationProvider,
        $routeProvider,
        $log
    ) {
        var _routes = [
            // example routing below: create your own relative paths!
            /*{path: '/ex/ample', view: 'client/url/example.html'}*/
            {path: '/', view: 'index.html'}
        ];
        
        _.each(_routes, function(route) {
            $routeProvider.when(route.path, {templateUrl: route.view});
        });
        
        $routeProvider.otherwise({
            redirectTo: '/'   
        });
        
        $locationProvider.html5Mode(true);
    }
})();