/**
 * Created by lx828 on 2016/4/5.
 */
define(['common/path-helper', 'common/session'], function(ph, session) {
    return ['$rootScope', '$scope','$stateParams', '$injector', 'sysService', 'toaster', function($rootScope, $scope,$stateParams, $injector, sysService, toaster) {

        ph.mark($rootScope, {
            state: 'sys.user.password',
            title: '密码重置'
        });
        //alert($stateParams.id);

        $scope.pwdVM = {
            title: '密码重置',
            data: {
                id:$stateParams.id
            }
        };

        /**
         * save my password
         * @param  {bool} valid [if form is valid]
         */
        $scope.save = function(valid) {
            $scope.pwdVM.submitted = true;
            if (!valid || !verify())
                return false;

            $scope.pwdVM.saving = true;
            sysService.changeUserPsw($scope.pwdVM.data).then(function(res) {
                if (res && res.status == 200 && res.items == true) {
                    toaster.pop('success', '密码修改成功！');
                    //resetForm();
                    var $state = $injector.get('$state');
                    var stateName = $state.current.name;
                    $state.go('sys.user.list', {
                        r: stateName
                    }, {
                        reload: true
                    });
                } else
                    toaster.pop('error', res.msg);
                $scope.pwdVM.saving = false;
            }, function(err) {
                $scope.pwdVM.saving = false;
            });
        };

        /**
         * verify password form is valid or not
         * @return {[type]} [description]
         */
        var verify = function() {
            if ($scope.pwdVM.data.newPsd != $scope.pwdVM.data.confirmPsw) {
                return false;
            }
            return true;
        };

        $scope.confirmPswValid = function() {
            return $scope.pwdVM.data.newPsd == $scope.pwdVM.data.confirmPsw;
        };


        //重置表单
        var resetForm = function() {
            $scope.pwdVM.data = {
                id: session.getLoginUserInfo().id
            };
            $scope.pwdform.$setPristine();
            $scope.pwdVM.submitted = false;
        };

    }];
});
