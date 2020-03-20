angular.module('groupServices',[])

.factory('Group', function($http){
    var groupFactory = {};

    groupFactory.getGroups = function() {
        return $http.get('/api/groupManagement');
    }

    return groupFactory;
})