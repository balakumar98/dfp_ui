var app = angular.module('appRoutes',['ngRoute']).config(['$routeProvider','$locationProvider', function($routeProvider,$locationProvider)
{
    $routeProvider
        .when('/home',{
            templateUrl: 'app/views/pages/home.html'
        })
        .when('/about',{
            templateUrl: 'app/views/pages/about.html'
        })

        .when('/register', {
            templateUrl: 'app/views/pages/users/register.html',
            controller: 'regCtrl',
            controllerAs: 'register',
            authenticated: false
        })
    
        .when('/login', {
            templateUrl: 'app/views/pages/users/login.html',
            authenticated: false
        })

        .when('/logout', {
            templateUrl: 'app/views/pages/users/logout.html',
            authenticated : true
        })

        .when('/profile', {
            templateUrl: 'app/views/pages/users/profile.html',
            authenticated: true
        })

        .when('/userManagement', {
            templateUrl: 'app/views/pages/management/userManagement.html',
            authenticated: true,
            controller: 'managementCtrl',
            controllerAs: 'management',
            permission: ['admin']
        })

        .when('/groupsManagement', {
            templateUrl: 'app/views/pages/management/groupsManagement.html',
            authenticated: true,
            controller: 'managementCtrl',
            controllerAs: 'management',
            permission: ['admin']
        })

        .when('/editUser/:id', {
            templateUrl: 'app/views/pages/management/editUser.html',
            authenticated: true,
            controller: 'managementCtrl',
            controllerAs: 'management',
            permission: ['admin']
        })

        .when('/widgets', {
            templateUrl: 'app/views/pages/users/widgets.html',
            authenticated: true,
        })

        .otherwise({redirectTo: '/'})

    $locationProvider.html5Mode({
        enabled:true,
        requireBase:false
    })

}])

app.run(['$rootScope', 'Auth', '$location', 'User', function($rootScope,Auth,$location,User){
    
    User.createFirstAdmin().then(function(err,user) {
        if(err){
            
        }
    });
    $rootScope.$on('$routeChangeStart', function(event, next, current){

        if(next.$$route != undefined) {
            if(next.$$route.authenticated == true){
    
                 if(!Auth.isLoggedIn()){
                     event.preventDefault();
                     $location.path('/home');
                 } 
                 else if(next.$$route.permission) {
                     User.getPermission().then(function(data) {
                        if(next.$$route.permission[0] != data.data.permission){                                    
                            event.preventDefault();
                            $location.path('/home');
                        }
                     })
                 } else if (next.$$route.authenticated == false) {
                        if(Auth.isLoggedIn()){
                            event.preventDefault();
                            $location.path('/profile');
                        } 
                 }
              } 
        }

    })
}]);
