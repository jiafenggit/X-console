define([], function() {
    return ['$scope', '$timeout', '$state', '$stateParams', 'borrowerService',
        function($scope, $timeout, $state, $stateParams, borrowerService) {
            $scope.vm = {
                table: null,
                data: {},
                borrowerAccountLogType: [{ code: 'BR_REPAYMENT_ASSIGNMENT', title: "还款分配" }, { code: 'BR_REPAYMENT', title: "还款" }, { code: 'BR_NEW', title: "借款人开户" }],
                status: [{ code: "C", title: "关闭" }, { code: "O", title: "正常" }],
                //初始化bsBorrowDetailTableControl对象，并将其扔到vm里面去，防止init调用的时候还没有加载出bsBorrowDetailTableControl这个对象而报错
                bsBorrowDetailTableControl: {},
                cancel: function() {
                    $state.go('borrower.info.list');
                }
            };

            $scope.$on('$viewContentLoaded', function() {
                $scope.vm.table = $('#borrowDetailTable');
            });

            function init() {
                $scope.vm.bsBorrowDetailTableControl = {
                    options: {
                        cache: false,
                        pagination: true,
                        pageSize: 10,
                        pageList: [10, 25, 50, 100, 200],
                        ajax: getDetailTable,
                        sidePagination: "server",
                        columns: [{
                            field: 'accountSubjectCode',
                            title: '账户科目',
                            align: 'center',
                            valign: 'middle'
                        }, {
                            field: 'borrowerAccountLogType',
                            title: '账户变动类型',
                            align: 'center',
                            valign: 'middle',
                            formatter: logFormatter
                        }, {
                            field: 'referenceId',
                            title: '参考编号',
                            align: 'center',
                            valign: 'middle',
                            sortable: true
                        }, {
                            field: 'beforeBalance',
                            title: '发生前余额',
                            align: 'center',
                            valign: 'middle',
                            sortable: true
                        }, {
                            field: 'beforeFrozenBalance',
                            title: '发生前余额冻结',
                            align: 'center',
                            valign: 'middle',
                            sortable: true
                        }, {
                            field: 'beforeFreeBalance',
                            title: '发生前可用余额',
                            align: 'center',
                            valign: 'middle',
                            sortable: true
                        }, {
                            field: 'changeAmount',
                            title: '发生额',
                            align: 'center',
                            valign: 'middle',
                            sortable: true
                        }, {
                            field: 'afterBalance',
                            title: '发生后余额',
                            align: 'center',
                            valign: 'middle',
                            sortable: true
                        }, {
                            field: 'afterFrozenBalance',
                            title: '发生后余额冻结',
                            align: 'center',
                            valign: 'middle',
                            sortable: true
                        }, {
                            field: 'afterFreeBalance',
                            title: '发生后可用余额',
                            align: 'center',
                            valign: 'middle',
                            sortable: true
                        }, {
                            field: 'balanceChangeFlag',
                            title: '余额变动标志',
                            align: 'center',
                            valign: 'middle',
                            sortable: true
                        }, {
                            field: 'createDatetime',
                            title: '创建时间',
                            align: 'center',
                            valign: 'middle',
                            sortable: true
                        }, {
                            field: 'memo',
                            title: '备注',
                            align: 'center',
                            valign: 'middle',
                            sortable: true
                        }]
                    }
                };


                function logFormatter(value, row, index) {
                    var result = '';
                    $scope.vm.borrowerAccountLogType.forEach(function(item) {
                        if (value === item.code) {
                            result = item.title;
                            return;
                        }
                    });
                    return result;
                }
            }

            function getDetail(borrowerId) {
                //query: {where: JSON.stringify({'borrowerAccountNo':borrowerAccountNo})}
                borrowerService.borrowerDetail.get({ id: borrowerId }).$promise.then(function(res) {
                    //基本信息
                    $scope.vm.status.forEach(function(item) {
                        if (item.code === res.data.status) {
                            res.data.status = item.title;
                            return;
                        }
                    });
                    $scope.vm.data = res.data;
                    //账户信息
                    $scope.vm.data.accountSubjectCode = res.data.borrowerAccount.accountSubjectCode;
                    $scope.vm.data.balance = res.data.borrowerAccount.balance;
                    $scope.vm.data.frozenBalance = res.data.borrowerAccount.frozenBalance;
                    $scope.vm.data.freeBalance = res.data.borrowerAccount.freeBalance;
                    $scope.vm.data.createDatetime = res.data.borrowerAccount.createDatetime;
                    init();
                });
            }
            getDetail($stateParams.id);


            function getDetailTable(params) {
                //这里的params就是分页的json
                paganition = { pageNum: params.paginate.pageNum, pageSize: params.paginate.pageSize, sort: params.data.sort };
                console.log($scope.vm.data.borrowerAccountNo);
                var queryCondition = { data: { borrowerAccountNo: $scope.vm.data.borrowerAccountNo }, paginate: paganition };
                borrowerService.borrowerDetailTable.query({ where: JSON.stringify(queryCondition) }).$promise.then(function(res) {
                    res.data = res.data || { paginate: paganition, items: [] };
                    params.success({
                        total: res.data.paginate.totalCount,
                        rows: res.data.items
                    });

                });
            }
        }
    ];
});
