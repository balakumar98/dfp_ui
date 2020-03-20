angular.module('userController', ['userServices'])

.controller('regCtrl', function($http,$location,$timeout,User){

    var retObj = this;
    
    this.regUser = function(regData){
        retObj.errorMessage = false;
        retObj.successMessage = false;
        retObj.loading = true;
        User.create(retObj.regData)
            .then(function(data){
                 retObj.loading = false;
                 if(data.data.success){
                    retObj.successMessage = data.data.message + ': Redirecting ...';
                    $timeout(function(){
                        $location.path('/home');
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


})

.directive('match', function(){
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
            attrs.$observe('match', function(){
                scope.matches = JSON.parse(attrs.match);
                scope.doConfirm(scope.matches);
            })

            scope.$watch('confirm', function(){
                scope.matches = JSON.parse(attrs.match);
                scope.doConfirm(scope.matches);
            })
        }
    };
})