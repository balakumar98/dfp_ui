angular.module('mainController',['authServices','userServices','groupServices'])
.controller('mainCtrl', function(Auth,User,AuthToken,$timeout,$route,$window,$location,$rootScope,$interval){

    var retObj = this;
    retObj.loadme = false;
    retObj.checkSession = function() {
        if(Auth.isLoggedIn()) {
            retObj.checkingSession = true;
            var interval = $interval(function(){
                var token = $window.localStorage.getItem('token');
                if(token == null) {
                    $interval.cancel(interval);
                } else {
                    self.parseJwt = function(token) {
                        var base64Url = token.split(".")[1];
                        var base64 = base64Url.replace("-","+").replace("_","/");
                        return JSON.parse($window.atob(base64));
                    }
                    var expireTime = self.parseJwt(token);
                    var timeStamp = Math.floor(Date.now() / 1000);
                    var timeCheck = expireTime.exp - timeStamp;
                    if(timeCheck <= 10) {
                        console.log('Token expires in 10 secs.')
                        showModal(1);
                        $interval.cancel(interval);
                    }
                }
            }, 2000);
        }
    }

    var showModal = function(option) {
        
        retObj.choiceMade = false;
        retObj.modalHeader = undefined;
        retObj.modalBody = undefined;
        retObj.hideButton = false;

        if(option == 1){
            retObj.modalHeader = "Timeout Warning";
            retObj.modalBody = "Your session will expire in 10 seconds. Would you like to renew ? "
            $("#myModal").modal({backdrop: "static"});
        } else if(option == 2) {
            retObj.hideButton = true;
            retObj.modalHeader = "Logging Out.";
            $("#myModal").modal({backdrop: "static"});
            $timeout(function() {
                hideModal();
                $location.path('/home');
                $route.reload();
            },2000)
        }
        $timeout(function() {
            if(!retObj.choiceMade) {
                hideModal();
            }
        },10000);
    }

    this.renewSession = function() {
        retObj.choiceMade = true;
        User.renewSession(retObj.username).then(function(data){
            if(data.data.success){
                AuthToken.setToken(data.data.token);
                retObj.checkSession();
            } else {
                retObj.modalBody = data.data.message;
            }
        })
        hideModal();
    }

    this.endSession = function() {
        retObj.choiceMade = true;
        hideModal();
    }

    var hideModal = function() {
        $("#myModal").modal('hide');
    }

    $rootScope.$on('$routeChangeStart', function() {
    
        if(retObj.checkingSession){
            retObj.checkSession();
        }


        if(Auth.isLoggedIn()) {
            retObj.isLoggedIn = true;
            Auth.getUser().then(function(data){
                retObj.username = data.data.username;
                retObj.email = data.data.email;
                User.getPermission().then(function(data) {
                    if(data.data.permission == 'admin'){
                        retObj.authorized = true;
                    } else {
                        retObj.authorized = false;
                    }
                })
                retObj.loadme = true;
            })
        } else {
            retObj.isLoggedIn = false;
            retObj.username = null;
            retObj.loadme = true;
        }

    })   

    this.doLogin = function(loginData){
        retObj.errorMessage = false;
        retObj.successMessage = false;
        retObj.loading = true;
        Auth.login(retObj.loginData)
            .then(function(data){
                 retObj.loading = false;
                 if(data.data.success){
                    retObj.successMessage = data.data.message + ': Redirecting ...';
                    $timeout(function(){
                        $location.path('/home');
                        retObj.loginData = null;
                        retObj.successMessage = false;
                        retObj.checkSession();
                    },2000)
                    
                 } else {
                    retObj.errorMessage = data.data.message;
                 }
             })
    }

    this.logout = function() {
        Auth.logout();
        showModal(2);
    }

})