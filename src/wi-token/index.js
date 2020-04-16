import jwt_decode from 'jwt-decode';

export const name = 'wiToken';
export default { name };

let app = angular.module(name, []);
app.factory(name, function () {
    return new TokenService();
});

function TokenService() {
    this.token = null;
    this.setToken = function (tokenVal) {
        this.token = tokenVal;
        localStorage.setItem('token',tokenVal);
    }
    this.setPassword = function(password){
        return localStorage.setItem('password',password);
    }
    this.setCurrentProjectName = function(currentProjectName){
        return localStorage.setItem('currentProjectName',currentProjectName);
    }
    this.getCurrentProjectName = function(){
        return localStorage.getItem('currentProjectName');
    }

    this.getPassword = function(){
        return localStorage.getItem('password');
    }
    this.getUserName = function () {
        if (this.token === undefined || (localStorage.getItem("token")) === null) {
            localStorage.clear();
        }
        return localStorage.getItem("username");
    }

    this.getCompany = function () {
        if (!this.token) {
            return "";
        }
        //var decoded = jwt.decode(this.token);
        var decoded = jwt_decode(this.token);
        return decoded.company;
    }
    this.getToken = function () {
        if (localStorage.getItem("token")) {
            return localStorage.getItem("token");
        }
        return this.token;

    }
    this.saveToken = function (tokenVal) {
        var decoded = jwt_decode(this.token);
        localStorage.setItem('token', tokenVal.token);
        localStorage.setItem('refresh_token', tokenVal.refresh_token);
        localStorage.setItem('username', decoded.username);
    }
    this.removeToken = function () {
        localStorage.clear();
    }
}
