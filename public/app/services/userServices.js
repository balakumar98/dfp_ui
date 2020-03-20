angular.module('userServices',[])

.factory('User', function($http){
    var userFactory = {};

    userFactory.createFirstAdmin = function() {
        return $http.post('/api/firstAdmin');
    }

    userFactory.create = function(regData) {
        return $http.post('/api/users', regData);
    }

    userFactory.checkUsername = function(regData) {
        return $http.post('/api/checkUsername', regData);
    }

    userFactory.checkEmail = function(regData) {
        return $http.post('/api/checkEmail', regData);
    }

    userFactory.renewSession = function(username) {
        return $http.get('/api/renewToken' + username);
    }

    userFactory.getPermission = function() {
        return $http.get('/api/permission');
    }

    userFactory.getUsers = function() {
        return $http.get('/api/userManagement');
    }

    userFactory.deleteUser = function(username) {
        return $http.delete('/api/userManagement/' + username);
    }

    userFactory.activateUser = function(user) {
        return $http.post('/api/activateUser/',user);
    }

    userFactory.deactivateUser = function(id) {
        return $http.put('/api/deactivateUser/' + id);
    }

    return userFactory;
})