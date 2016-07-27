define(['common/path-helper', 'common/session'], function(ph,session) {
    return ['$rootScope', '$scope', '$stateParams', '$modal', 'sysService', 'toaster', function($rootScope, $scope, $stateParams, $modal, sysService, toaster) {

        $scope.listVM = {
            condition: $stateParams.condition ? $stateParams.condition : {
                pageNo: 1,
                pageSize: 10,
                type:""
            },
            paginate: {
                pageSize: 10,
                pageNumber: 1,
                pagesCount: 0,
                totalItemsCount: 0
            },
            items: []
        };

        var search = function() {
            $scope.listVM.searching = true;
            sysService.searchSchedule($scope.listVM.condition).then(function(data) {
                if (data && data.status === 200) {
                    $scope.listVM.items = data.items;
                    $scope.listVM.paginate = data.paginate;
                } else {
                    toaster.pop('error', data.msg);
                }
                $scope.listVM.searching = false;
            }, function(err) {
                $scope.listVM.searching = false;
                toaster.pop('error', '服务器请求异常！');
            });
        };
        //进入页面第一次查询
        //search();

        /**
         * 分页控件翻页事件
         * @return {[type]} [description]
         */
        $scope.pageChanged = function() {
            $scope.page($scope.listVM.paginate.pageNumber);
        };

        /**
         * search
         * @param  {[int]} index [description]
         */
        $scope.page = function(index) {
            $scope.listVM.condition.pageNo = index || 1;
            search();
        };

        /**
         * reset search form data
         */
        $scope.reset = function() {
            $scope.listVM.condition = {
                pageNo: 1,
                pageSize: 10
            }
        };

        $scope.forbid = function(item) {
            var text = '确定禁用任务[' + item.jobName + ']？';
            $modal.open({
                templateUrl: '../../../../view/shared/confirm.html',
                size: 'sm',
                controller: function($scope, $modalInstance) {
                    $scope.confirmData = {
                        text: text,
                        processing: false
                    };
                    $scope.cancel = function() {
                        $modalInstance.dismiss();
                        return false;
                    }

                    $scope.ok = function() {
                        delSchedule(item.id, $scope, $modalInstance);
                        return true;
                    }
                }
            });
        };


        /**
         * show modal dialog of user info
         * @param  {int} type [0:view, 1:add, 2:edit]
         * @param {int} id [user id]
         */
        var showModal = function(type, id) {
            var title = '任务信息';
            switch (type) {
                case 1:
                    title = '添加任务';
                    break;
                case 2:
                    title = '修改任务信息';
                    break;
                case 3:
                    title = '查看任务信息';
                    break;
                default:
                    break;
            }

            $modal.open({
                templateUrl: '../../../../view/sys/schedule/edit.html',
                size: 'lg',
                controller: function($scope, $modalInstance) {
                    $scope.scheduleVM = {
                        title: title,
                        type: type,
                        id: id
                    };


                    if (id)
                        loadSchedule($scope, id);

                    //cancel
                    $scope.cancel = function() {
                        $modalInstance.dismiss();
                        return false;
                    }

                    //save
                    $scope.ok = function(valid) {

                        $scope.scheduleVM.submitted = true;
                        if (!valid )
                            return false;
                        saveSchedule($scope, $modalInstance);
                        return true;
                    }
                }
            });
        };

        $scope.add = function() {
            showModal(1);
        };

        /**
         * show user edit dialog
         * @param  {[type]} id [user id]
         */
        $scope.edit = function(id) {
            showModal(2, id);
        };

        /**
         * show user view dialog
         * @param  {[int]} id [user id]
         */
        $scope.view = function(id) {
            showModal(3, id)
        };

        /**
         * load user detail info
         * @param  {object} userScope
         * @param  {int} id
         */
        var loadSchedule = function(userScope, id) {
            userScope.scheduleVM.loading = true;
            sysService.getSchedule(id).then(function(data) {
                userScope.scheduleVM.loading = false;
                if (data.status == 200)
                    userScope.scheduleVM.data = data.items;
            }, function(err) {
                userScope.scheduleVM.loading = false;
                toaster.pop('error', '服务器请求异常！');
            });
        };

        /**
         * add or update user info
         * @param  {object} userScope
         */
        var saveSchedule = function(userScope, modalInstance) {

            userScope.scheduleVM.saving = true;
            var method = userScope.scheduleVM.id ? 'PUT' : 'POST';
            sysService.saveSchedule(userScope.scheduleVM.data, method).then(function(data) {
                if (data.status == 200) {
                    toaster.pop('success', '保存成功！');
                    modalInstance.dismiss();
                    search()
                } else
                    toaster.pop('error', data.msg);
                userScope.scheduleVM.saving = false;

            }, function(err) {
                userScope.scheduleVM.saving = false;
                toaster.pop('error', '服务器请求异常！');
            });
        };

        var delSchedule= function(id, confirmScope, modalInstance) {
            confirmScope.confirmData.processing = true;
            sysService.delSchedule(id).then(function(res) {
                if (res && res.status == 200) {
                    toaster.pop('success', '禁用成功！');
                    modalInstance.dismiss();
                    search();
                } else
                    toaster.pop('error', res.msg);

                confirmScope.confirmData.processing = false;
            }, function(err) {
                toaster.pop('error', '服务器请求异常！')
                confirmScope.confirmData.processing = false;
            });
        };
        /**
         * reset search form data
         */
        $scope.buildIndex = function() {
            var text = '确定重建索引？';
            var type= $scope.listVM.type;
            $modal.open({
                templateUrl: '../../../../view/shared/confirm.html',
                size: 'sm',
                controller: function($scope, $modalInstance) {
                    $scope.confirmData = {
                        text: text,
                        processing: false
                    };
                    $scope.cancel = function() {
                        $modalInstance.dismiss();
                        return false;
                    }

                    $scope.ok = function() {
                        solrbuild( type,$scope, $modalInstance);
                        return true;
                    }
                }
            });
        };

        var solrbuild = function(type, confirmScope, modalInstance) {
            confirmScope.confirmData.processing = true;
            sysService.solrindexBuild(type).then(function(res) {
                if (res && res.status == 200) {
                    toaster.pop('success', '创建成功！');
                    modalInstance.dismiss();
                    //search();
                } else
                    toaster.pop('error', res.msg);

                confirmScope.confirmData.processing = false;
            }, function(err) {
                toaster.pop('error', '服务器请求异常！')
                confirmScope.confirmData.processing = false;
            });
        };


    }];
});
