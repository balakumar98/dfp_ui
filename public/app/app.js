angular.module('userApp', ['appRoutes','managementController','userController','userServices','mainController','authServices','groupServices'])
.config(function($httpProvider){
    $httpProvider.interceptors.push('AuthInterceptors');
});
