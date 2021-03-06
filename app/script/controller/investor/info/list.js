define([], function () {
    return ['$scope', '$state',  '$modal','$filter','metaService', 'investorService', function ($scope, $state,  $modal,$filter,metaService, investorService) {

        var defaultCondition = {
            data: {},
            paginate:{
                pageNum: 1,
                pageSize: 10
            }
        };

        $scope.listView = {
            condition: angular.copy(defaultCondition),
            table: null
        };

        $scope.$on('$viewContentLoaded', function () {
            $scope.listView.table = $('#investmentListTable');
        });

        function initMetaData() {
            metaService.getMeta('LCQDMC', function(data) {
                $scope.listView.fundChannelName = data;
            });
            metaService.getMeta('TZLBZT', function(data) {
                $scope.listView.status = data;
            });
            metaService.getMeta('SFBHSTJ', function(data) {
                $scope.listView.hasTrial = data;
            });
        };
        initMetaData();
        var getData = function (params) {
            var paganition = { pageNum: params.paginate.pageNum, pageSize: params.paginate.pageSize, sort: params.data.sort };
            var condition = $scope.listView.condition;
            if($scope.listView.condition.data.fundChannel) {
                condition.data.fundChannelId = $scope.listView.condition.data.fundChannel.value;
            }
            if($scope.listView.condition.data.statusName){
                condition.data.status= $scope.listView.condition.data.statusName;
            }
            if(condition.data.debtStartDateStart){
                condition.data.debtStartDateStart = $filter('exDate')(condition.data.debtStartDateStart);
            }
            if(condition.data.debtStartDateEnd){
                condition.data.debtStartDateEnd = $filter('exDate')(condition.data.debtStartDateEnd);
            }
            if(condition.data.debtEndDateStart){
                condition.data.debtEndDateStart = $filter('exDate')(condition.data.debtEndDateStart);
            }
            if(condition.data.debtEndDateEnd){
                condition.data.debtEndDateEnd = $filter('exDate')(condition.data.debtEndDateEnd);
            }
            condition.paginate = paganition;
            investorService.infoList.query({where: JSON.stringify(condition)}).$promise.then(function (res) {
                res.paginate = res.paginate || { totalCount: 0 };
                res.data = res.data || { paginate: res.paginate, items: [] };
                params.success({
                    total: res.data.paginate.totalCount,
                    rows: res.data.items
                });
            });
        };

        (function init() {
            initMeta();

            $scope.bsInvestmentListTableControl = {
                options: {
                    cache: false,
                    //height: 600,
                    pagination: true,
                    pageSize: 10,
                    pageList: [10, 25, 50, 100, 200],
                    ajax: getData,
                    sidePagination: "server",
                    columns: [{
                        field: 'state',
                        checkbox: true
                    }, {
                        field: 'projectVO.projectId',
                        title: '项目编号',
                        align: 'center'

                    }, {
                        field: 'projectVO.projectName',
                        title: '项目名称',
                        align: 'center'
                    }, {
                        field: 'investorVO.investorId',
                        title: '投资人编号',
                        align: 'center'
                    }, {
                        field: 'investorVO.name',
                        title: '投资人名称',
                        align: 'center'
                    }, {
                        field: 'investmentVO.repaymentType',
                        title: '还款方式',
                        align: 'center',
                        formatter:repaymentTypeFormatter,
                    }, {
                        field: 'investmentVO.debtStartDate',
                        title: '开始日期',
                        formatter:timerFormatter,
                        align: 'center'
                    }, {
                        field: 'investmentVO.debtEndDate',
                        title: '结束日期',
                        formatter:timerFormatter,
                        align: 'center'
                    }, {
                        field: 'investmentVO.status',
                        title: '状态',
                        formatter:statusFormatter,
                        align: 'center'
                    }, {
                        field: 'investmentVO.interestRate',
                        title: '借款利率',
                        formatter:rateFormatter,
                        align: 'center'
                    }, {
                        field: 'investmentVO.totalPrincipal',
                        title: '本金',
                        align: 'center'
                    }, {
                        field: 'investmentVO.investmentPrice',
                        title: '买入价格',
                        align: 'center'
                    }, {
                        field: 'investmentVO.totalInterest',
                        title: '利息',
                        align: 'center'
                    }, {
                        field: 'investmentVO.principalPaid',
                        title: '已付本金',
                        align: 'center'
                    }, {
                        field: 'investmentVO.principalBalance',
                        title: '剩余本金',
                        align: 'center'
                    }, {
                        field: 'investorVO.fundAccountManagerId',
                        title: '理财客户经理编号',
                        align: 'center'
                    }, /*{
                        field: 'investorVO.fundAccountManagerCode',
                        title: '理财客户经理代码',
                        align: 'center'
                    }, */{
                        field: 'investorVO.fundAccountManagerId',
                        title: '理财客户经理姓名',
                        align: 'center',
                        formatter:ManagerNameFormatter
                    }, {
                        field: 'investmentVO.fundChannelId',
                        title: '理财渠道代码',
                        align: 'center',
                        formatter:fundChannelCodeFormatter
                    }, {
                        field: 'investmentVO.fundChannelId',
                        title: '理财渠道名称',
                        align: 'center',
                        formatter:fundChannelNameFormatter
                    }, {
                        field: 'investmentVO.contractGenFlag',
                        title: '合同生成标志',
                        align: 'center'
                    }, {
                        field: 'investmentVO.createDatetime',
                        title: '创建时间',
                        formatter:timeFormatter,
                        align: 'center'
                    }, {
                        field: 'investmentVO.updateDatetime',
                        title: '更新时间',
                        formatter:timeFormatter,
                        align: 'center'
                    }, {
                        field: 'investmentVO.hasTrial',
                        title: '是否包含试投金',
                        formatter:hasTrialFormatter,
                        align: 'center'
                    }, {
                        field: 'investmentVO.trialAmt',
                        title: '试投金金额',
                        align: 'center'
                    }, {
                        field: 'flag',
                        title: '操作',
                        align: 'center',
                        clickToSelect: false,
                        formatter: flagFormatter,
                        events: {
                            'click .btn-info': editRow
                        }
                    }]
                }
            };
            function timeFormatter(value, row, index) {
                return $filter('exDate')(value, 'yyyy-MM-dd HH:mm:ss');
            }
            function timerFormatter(value, row, index) {
                return $filter('exDate')(value).slice(0,10);
            }
            function statusFormatter(value, row, index) {
                return $filter('meta')(value, $scope.listView.statusList);
            }
            function hasTrialFormatter(value, row, index) {
                return $filter('meta')(value, $scope.listView.hasTrialList);
            }
            function fundChannelNameFormatter(value, row, index) {
                return $filter('meta')(value, $scope.listView.fundChannelNameList);
            }
            function fundChannelCodeFormatter(value, row, index) {
                return $filter('metaCM')(value, $scope.listView.fundChannelCodeList);
            }
            function ManagerNameFormatter(value, row, index) {
                return $filter('meta')(value, $scope.listView.ManagerNameList);
            }
            function repaymentTypeFormatter(value, row, index) {
                return $filter('meta')(value, $scope.listView.repaymentTypeList);
            }
            function rateFormatter(value, row, index) {
                return parseFloat(value*100).toFixed(2)+'%/年';
            }
            function flagFormatter(value, row, index) {
                var btnHtml = [
                    '<button type="button" class="btn btn-xs btn-info"><i class="fa fa-arrow-right"></i></button>'
                ];
                return btnHtml.join('');
            }

        })();
        function initMeta() {
            metaService.getMeta('TZLBZT', function(items) {
                $scope.listView.statusList = items;
            });
            metaService.getMeta('SFBHSTJ', function(items) {
                $scope.listView.hasTrialList = items;
            });
            metaService.getMeta('LCQD', function(items) {
                $scope.listView.fundChannelNameList=items;
            });
            metaService.getMeta('LCJLXM', function(items) {
                $scope.listView.ManagerNameList=items;
            });
            metaService.getMeta('LCQDMC', function(items) {
                $scope.listView.fundChannelCodeList=items;
            });
            metaService.getMeta('HKFS', function(items) {
                $scope.listView.repaymentTypeList=items;
            });
        }
        function editRow(e, value, row, index) {
            $state.go('investor.info.detail', {id: row.investmentVO.investmentId});
        }

        $scope.search = function () {
            $scope.listView.table.bootstrapTable('refresh');
        };

        $scope.reset = function () {
            $scope.listView.condition = angular.copy(defaultCondition);
        };

    }];
});
