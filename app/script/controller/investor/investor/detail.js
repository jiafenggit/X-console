define([], function() {
    return ['$scope', '$timeout', '$state', '$stateParams', 'investorService', 'metaService', '$filter',
        function($scope, $timeout, $state, $stateParams, investorService, metaService, $filter) {
            $scope.vm = {
                table: null,
                data: {},
                //初始化bsInvestorDetailTableControl对象，并将其扔到vm里面去，防止init调用的时候还没有加载出bsInvestorDetailTableControl这个对象而报错
                bsInvestorDetailTableControl: {},
                cancel: function() {
                    $state.go('investor.investor.list');
                }
            };

            function initMetaData() {
                metaService.getMeta('ZT', function(data) {
                    $scope.vm.status = data;
                });
                metaService.getMeta('ZHKM', function(data) {
                    $scope.vm.accountSubjectCode = data;
                });
                metaService.getMeta('SFRZZT', function(data) {
                    $scope.vm.idAuthFlag = data;
                });
                metaService.getMeta('ZHUCLX', function(data) {
                    $scope.vm.registerType = data;
                });
                metaService.getMeta('SFBGSYG', function(data) {
                    $scope.vm.empFlag = data;
                });
                metaService.getMeta('STJZT', function(data) {
                    $scope.vm.trialFlag = data;
                });
                metaService.getMeta('CZLY', function(data) {
                    $scope.vm.operateOrigin = data;
                });
                metaService.getMeta('LCQDMC', function(data) {
                    $scope.vm.fundChannelName = data;
                });
                metaService.getMeta('STJSFYSY', function(data) {
                    $scope.vm.trialUsed = data;
                });
                metaService.getMeta('LCJLXM', function(data) {
                    $scope.vm.fundAccountManagerName = data;
                });
                metaService.getMeta('SFXS', function(data) {
                    $scope.vm.noviciate = data;
                });
                metaService.getMeta('TZRZHBDLX', function(data) {
                    $scope.vm.accountLogType = data;
                });
            };
            initMetaData();
            $scope.$on('$viewContentLoaded', function() {
                $scope.vm.table = $('#investorDetailTable');
            });

            function init() {
                $scope.vm.bsInvestorDetailTableControl = {
                    options: {
                        cache: false,
                        pagination: true,
                        pageSize: 10,
                        pageList: [10, 25, 50, 100, 200],
                        ajax: getDetailTable,
                        sidePagination: "server",
                        columns: [{
                            field: 'accountLogType',
                            title: '账户变动类型',
                            align: 'center',
                            valign: 'middle',
                            formatter: logFormatter
                        }, {
                            field: 'referenceId',
                            title: '参考编号',
                            align: 'center',
                            valign: 'middle',

                        }, {
                            field: 'beforeBalance',
                            title: '发生前余额',
                            align: 'center',
                            valign: 'middle',

                        }, {
                            field: 'beforeFrozenBalance',
                            title: '发生前余额冻结',
                            align: 'center',
                            valign: 'middle',

                        }, {
                            field: 'beforeFreeBalance',
                            title: '发生前可用余额',
                            align: 'center',
                            valign: 'middle',

                        }, {
                            field: 'changeAmount',
                            title: '发生额',
                            align: 'center',
                            valign: 'middle',

                        }, {
                            field: 'afterBalance',
                            title: '发生后余额',
                            align: 'center',
                            valign: 'middle',

                        }, {
                            field: 'afterFrozenBalance',
                            title: '发生后余额冻结',
                            align: 'center',
                            valign: 'middle',

                        }, {
                            field: 'afterFreeBalance',
                            title: '发生后可用余额',
                            align: 'center',
                            valign: 'middle',

                        }, {
                            field: 'beforePrincipalBalance',
                            title: '变动前待收本金',
                            align: 'center',
                            valign: 'middle',

                        }, {
                            field: 'afterPrincipalBalance',
                            title: '变动后待收本金',
                            align: 'center',
                            valign: 'middle',

                        }, {
                            field: 'beforeInterestBalance',
                            title: '变动前待收利息',
                            align: 'center',
                            valign: 'middle',

                        }, {
                            field: 'afterInterestBalance',
                            title: '变动后待收利息',
                            align: 'center',
                            valign: 'middle',

                        }, {
                            field: 'beforeTotalInterest',
                            title: '变动前总收益',
                            align: 'center',
                            valign: 'middle',

                        }, {
                            field: 'afterTotalInterest',
                            title: '变动后总收益',
                            align: 'center',
                            valign: 'middle',

                        }, {
                            field: 'balanceChangeFlag',
                            title: '余额变动标志',
                            align: 'center',
                            valign: 'middle',

                        }, {
                            field: 'createDatetime',
                            title: '创建时间',
                            formatter: dateFormatter,
                            align: 'center',
                            valign: 'middle',

                        }, {
                            field: 'memo',
                            title: '备注',
                            align: 'center',
                            valign: 'middle',

                        }]
                    }
                };


                function logFormatter(value, row, index) {
                    return $filter('meta')(value, $scope.vm.accountLogType);
                }

                function dateFormatter(value, row, index) {
                    return $filter('exDate')(value,'yyyy-MM-dd HH:mm:ss')
                }
            }

            function getDetail(investorId) {
                investorService.investorDetailLabel.get({ id: investorId }).$promise.then(function(res) {
                    //基本信息
                    console.log(res)
                    $scope.vm.data.investorInfo = res.investorInfo;
                    //账户信息
                    $scope.vm.data.accountInfo = res.accountInfo;

                    init();
                });
            }
            getDetail($stateParams.id);


            function getDetailTable(params) {
                console.log(params)
                //这里的params就是分页的json
                var paganition = { pageNum: params.paginate.pageNum, pageSize: params.paginate.pageSize, sort: params.data.sort };
                var queryCondition = { data: { accountNo: $scope.vm.data.investorInfo.accountNo }, paginate: paganition };
                investorService.investorDetailTable.query({ where: JSON.stringify(queryCondition) }).$promise.then(function(res) {
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
