define([], function() {
    return ['$scope', '$http', '$timeout', '$modal', 'investorService','toaster',
        function($scope, $http, $timeout, $modal,investorService,toaster) {

        /**
         * the default search condition
         * @type {Object}
         */
        var defaultCondition = {
            sorting: 'update_time desc',
            pageNum: 1,
            pageSize: 10
        };

        $scope.listView = {
            condition: angular.copy(defaultCondition),
            table: null
        };

        /**
         * do something after view loaded
         * @param  {string}     event type                       
         * @param  {function}   callback function
         */
        $scope.$on('$viewContentLoaded', function() {
            $scope.listView.table = $('#investorCheckTable');
        });


        var getData = function(params) {
            var paganition = { pageNum: params.paginate.pageNum, pageSize: params.paginate.pageSize, sort: params.data.sort };
            var data = $scope.listView.condition;


            var queryCondition = { "data":data,"paginate": paganition };
            investorService.investorCheckTable.query({ where: JSON.stringify(queryCondition) }).$promise.then(function(res) {
                res.data = res.data || { paginate: paganition, items: [] };
                params.success({
                    total: res.data.paginate.totalCount,
                    rows: res.data.items || []
                });
            });
        };

        (function init() {

            $scope.bsInvestorCheckTableControl = {
                options: {
                    cache: false,
                    pagination: true,
                    pageSize: 10,
                    pageList: [10, 25, 50, 100, 200],
                    ajax: getData,
                    onPageChange: pageChange,
                    sidePagination: "server",
                    columns: [
                        {
                        field: 'state',
                        checkbox: true,
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'id',
                        title: '审核编号',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'investorId',
                        title: '投资人编号',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'investorName',
                        title: '投资人姓名',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'fundChannelId',
                        title: '渠道编号',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'fundChannelName',
                        title: '渠道名称',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'fundAccountManagerId',
                        title: '理财经理编号',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'fundAccountManagerName',
                        title: '理财经理姓名',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'bindIboxpayUser ',
                        title: '绑定钱盒商户',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'submitDateTime',
                        title: '申请时间',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'submitOp',
                        title: '操作员',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'flag',
                        title: '操作',
                        align: 'center',
                        valign: 'middle',
                        clickToSelect: false,
                        formatter: flagFormatter,
                        events: {
                            'click .btn': edit
                        }
                    }]
                }
            };

            function flagFormatter(value, row, index) {
                var buttons = [
                    '<button name="btn-edit" class="btn btn-xs btn-info"><i class="fa fa-edit"></i></button>'
                ]
                return buttons.join('');
            }
            function edit(e, value, row, index) {
                showChannelModal(row.id, row.investorId);
                e.stopPropagation();
                e.preventDefault();
            }

        })();
            function showChannelModal(updateId, investorId) {
                var title = "审核操作";
                var joinupTypeList = [];// $scope.listVM.joinupTypeList;
                $modal.open({
                    templateUrl: 'view/investor/check/edit.html',
                    size: 'md',
                    controller: function($scope, $modalInstance) {

                        $scope.vm = {
                            title: title,
                            processing: false,
                            joinupTypeList: joinupTypeList,
                            //data: {},
                            cancel: cancel,
                            approve:approve,
                            reject: reject
                        };

                        (function() {
                            investorService.getUpdateInvestor(updateId).then(function(res) {
                                $scope.vm.data = res;
                                $scope.vm.loading = false;
                            }, function() {
                                $scope.vm.loading = false;
                                toaster.pop('error', '服务器连接出错，请稍候再试！')
                            });
                            investorService.updateInvestorDetail.get({ id: investorId }).$promise.then(function(res) {
                                $scope.vm.data1 = res;
                                $scope.vm.loading = false;
                            }, function() {
                                $scope.vm.loading = false;
                                toaster.pop('error', '服务器连接出错，请稍候再试！')
                            });
                            $scope.vm.loading = true;
                        })();

                        function cancel() {
                            $modalInstance.dismiss();
                            return false;
                        }

                        function approve() {
                            investorService.approvalInvestor(updateId).then(function(res) {
                                if(res.code == 200) {
                                    toaster.pop('success', '操作成功！');
                                    $modalInstance.dismiss();
                                }
                                else
                                    toaster.pop('error', res.msg);
                            }, function(err) {
                                toaster.pop('error', '服务器连接出错！');
                            });
                            return false;
                        }

                        function reject() {
                            investorService.rejectInvestor(updateId).then(function(res) {
                                if(res.code == 200) {
                                    toaster.pop('success', '操作成功！');
                                    $modalInstance.dismiss();
                                }
                                else
                                    toaster.pop('error', res.msg);
                            }, function(err) {
                                toaster.pop('error', '服务器连接出错！');
                            });
                        }

                        //function saveChannel(data) {
                        //    if (channel) {
                        //        assetService.channel.update({ id: data.id }, data).$promise.then(saveSuccess, saveError);
                        //    } else {
                        //        assetService.channel.save(data).$promise.then(saveSuccess, saveError);
                        //    }
                        //};

                        //function saveSuccess(res) {
                        //    toaster.pop('success', '保存成功！');
                        //    $modalInstance.dismiss();
                        //    refreshChannel();
                        //}
                        //
                        //function saveError(res) {
                        //    toaster.pop('error', '连接服务器出错，请重试');
                        //}
                    }
                });
            }
        var pageChange = function(num, size) {
            console.log(num + ' - ' + size);
        };
    }];
});
