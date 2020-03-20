angular.module('managementController',['userServices','groupServices'])
.controller('managementCtrl', function(User,Group,$route,$location,$timeout){
    console.log('Management test');
    var retObj = this;
    retObj.loading = true;
    retObj.accessDenied = true;
    retObj.errMsg = false;
    retObj.editAccess = false;
    retObj.deleteAccess = false;
    
    retObj.sortType     = 'username'; 
    retObj.sortReverse  = false;  
    retObj.searchUsername  = '';   

    function getUsers() {
        User.getUsers().then(function(data) {
            if(data.data.success) {
                if(data.data.permission == 'admin'){
                    retObj.users = data.data.users;
                    retObj.loading = false;
                    retObj.accessDenied = false;
                    retObj.editAccess = true;
                    retObj.deleteAccess = true;
                } else {
                    retObj.errMsg = 'Access denied';
                    retObj.loading = false;
                }
            } else {
                retObj.errMsg = data.data.message;
                retObj.loading = false;
            }
        })

    }

    function getGroups() {
        Group.getGroups().then(function(data) {
            if(data.data.success) {
                if(data.data.permission == 'admin') {
                    retObj.groups = data.data.groups;
                    retObj.loading = false;
                    retObj.accessDenied = false;
                    retObj.editAccess = true;
                    retObj.deleteAccess = true;
                } else {
                    retObj.errMsg = 'Access denied';
                    retObj.loading = false;
                }
            } else {
                retObj.errMsg = data.data.message;
                retObj.loading = false;
            }
        
        })
    }

    
    getUsers();
    getGroups();

    retObj.deleteUser = function(username) {
        User.deleteUser(username).then(function(data) {
            if(data.data.success) {
                getUsers();
            } else {
                retObj.showMoreError = data.data.message;
            }
        })
    }

    retObj.activateUserFinal = function(activateData){
        retObj.activateData.id = retObj.activatingId;
        retObj.activateData.__proto__ = null;
        console.log(retObj.activateData);
        User.activateUser(retObj.activateData).then(function(data){
            if(data.data.success){
                getUsers();
                retObj.activatingId = false;
                retObj.activatingUsername = false;
                retObj.activatingFullname = false;
                retObj.activatingEmail = false;
                retObj.activatingGroup = false;
                retObj.activatingsubGroup = false;
                retObj.activatingRole = false;
                this.closeActivation();
                $location.path('/userManagement');
                $route.reload();
            } else {
                retObj.showMoreError = data.data.message;
            }
        })
    }

    retObj.activateUser = function(user) {
        retObj.activatingId = user._id;
        retObj.activatingUsername = user.username;
        retObj.activatingFullname = user.firstname;
        retObj.activatingEmail = user.email;
        retObj.activatingGroup = user.group;
        retObj.activatingsubGroup = user.subGroup;
        retObj.activatingRole = user.role;
        Group.getGroups().then(function(data) {
            if(data.data.success){
                retObj.groups = data.data.groups;
                $("#activateUserModal").modal('show');
            }else {
                retObj.showMoreError = data.data.message;
            }
        })
        
        
    }

    retObj.deactivateUser = function(id) {
        User.deactivateUser(id).then(function(data){
            if(data.data.success){
                getUsers();
            } else {
                retObj.showMoreError = data.data.message;
            }
        })
    }

    retObj.regUser = function(regData){
        retObj.errorMessage = false;
        retObj.successMessage = false;
        retObj.loading = true;
        console.log(regData);
        User.create(retObj.regData)
            .then(function(data){
                 retObj.loading = false;
                 if(data.data.success){
                    retObj.successMessage = data.data.message + ': Redirecting ...';
                    $timeout(function(){
                        hideModal();
                        $location.path('/userManagement');
                        $route.reload();
                    },2000)
                    
                 } else {
                    retObj.errorMessage = data.data.message;
                 }
             })
    }


    this.checkUsername = function(regData){
        retObj.checkingUsername = true;
        retObj.usernameMsg = false;
        retObj.usernameInvalid = false;

        User.checkUsername(retObj.regData).then(function(data){
            retObj.checkingUsername = false;
            if(data.data.success) {
                retObj.usernameInvalid = false;
            } else {
                retObj.usernameMsg = data.data.message;
                retObj.usernameInvalid = true;
            }
        })
    }

    this.checkEmail = function(regData){
        retObj.checkingEmail = true;
        retObj.emailMsg = false;
        retObj.emailInvalid = false;

        User.checkEmail(retObj.regData).then(function(data){
            retObj.checkingEmail = false;
            if(data.data.success) {
                retObj.emailInvalid = false;
            } else {
                retObj.emailMsg = data.data.message;
                retObj.emailInvalid = true;
            }
        })
    }

    var hideModal = function() {
        $("#addNewUserModal").modal('hide');
    }

    this.updateSubGroup = function() {
        console.log(this.activateData.group);
        var groups = JSON.parse(JSON.stringify(this.groups));
        var index = groups.map(function(d) { return d['group']; }).indexOf(this.activateData.group);
        this.subGroups = groups[index].subGroups;
    }

    this.closeActivation = function() {
        $("activateUserModal").modal('hide');
    }

})

.directive('passwordMatch', function(){
    return{
        restrict: 'A',
        controller: function($scope){

            $scope.confirmed = false;

            $scope.doConfirm = function(values){
                values.forEach(function(ele){

                    if($scope.confirm == ele){
                        $scope.confirmed = true;
                    } else {
                        $scope.confirmed = false;
                    }
                });
            }
        },

        link: function(scope, element, attrs){
            attrs.$observe('passwordMatch', function(){
                scope.matches = JSON.parse(attrs.passwordMatch);
                scope.doConfirm(scope.matches);
            })

            scope.$watch('confirm', function(){
                scope.matches = JSON.parse(attrs.passwordMatch);
                scope.doConfirm(scope.matches);
            })
        }
    };
})

  

.controller('/editUser/:id')