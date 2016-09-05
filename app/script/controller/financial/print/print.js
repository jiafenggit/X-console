define([], function() {
    return ['$scope', '$http','metaService', '$timeout', '$modal', 'financialService','toaster',
        function($scope, $http,metaService, $timeout, $modal, financialService,toaster) {

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
            table: null,
            search: search,
            reset: function() {
                $scope.listView.condition = angular.copy(defaultCondition);
            },
            //depositType:[{id:1,title:'托管户=>盒子支付'},{id:2,title:'准备金=>恒丰银行'},{id:3,title:'托管户=>准备金'},{id:4,title:'托管户=>收益户'},{id:5,title:'收益户=>结算户打款'},{id:6,title:'托管户=>恒丰结算户'},{id:7,title:'托管户=>盒子结算户'},{id:8,title:'盒子还款户=>托管户'}],
            //status:[{id:1,title:'未打印'},{id:2,title:'已打印'}]
        };

        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            class: 'datepicker',
            showWeeks: false
        };
            function initMetaData() {
                metaService.getMeta('HZLX', function(data) {
                    $scope.listView.remitPrintType = data;
                });
                metaService.getMeta('DYZT', function(data) {
                    $scope.listView.status = data;
                });
            }
            initMetaData();
            /**
             * do something after view loaded
             * @param  {string}     event type                       
             * @param  {function}   callback function
             */
        $scope.$on('$viewContentLoaded', function() {
            $scope.listView.table = $('#transferCashPrintTable');
        });


        var getData = function(params) {
             var paganition = { pageNum: params.paginate.pageNum, pageSize: params.paginate.pageSize, sort: params.data.sort };
             var data = $scope.listView.condition;
             var queryCondition = { "data":data,"paginate": paganition };
             financialService.transferCashPrintTable.query({ where: JSON.stringify(queryCondition) }).$promise.then(function(res)
             {$timeout(function() {
                    params.success({
                        total: res.data.paginate.totalCount,
                        rows: res.data.items
                    });
                }, 500);
            });
        };

        (function init() {
            $scope.bsTransferCashPrintTableControl = {
                options: {
                    cache: false,
                    height: 650,
                    //striped: true,
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
                        field: 'remitPrintId',
                        title: '打印号',
                        align: 'center',
                        valign: 'middle'
                    },{
                        field: 'remitPrintType',
                        title: '划账类型',
                        align: 'center',
                        valign: 'middle',
                        formatter: remitPrintTypeFormatter
                    }, {
                        field: 'amount',
                        title: '金额',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'arrivalDate',
                        title: '预期到账时间',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'status',
                        title: '状态',
                        align: 'center',
                        valign: 'middle',
                        formatter: statusFormatter
                    }, {
                        field: 'printCount',
                        title: '打印次数',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'payCapitalAccountId',
                        title: '付款资金账户标识',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'payCapitalAccountName',
                        title: '付款资金账户名',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'payCapitalAccount',
                        title: '付款资金账户',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'payBankName',
                        title: '付款开户行',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'payBankProvince',
                        title: '付款开户行省份',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'payBankCity',
                        title: '付款开户行地市',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'receiveCapitalAccountId',
                        title: '收款资金账户标识',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'receiveCapitalAccountName',
                        title: '收款资金账户名',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'receiveCapitalAccount',
                        title: '收款资金账户',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'receiveBankName',
                        title: '收款开户行',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'receiveBankProvince',
                        title: '收款开户行省份',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'receiveBankCity',
                        title: '收款开户行地市',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'largePayBankCode',
                        title: '大额支付行号',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'op',
                        title: '操作员',
                        align: 'center',
                        valign: 'middle'
                    }, {
                        field: 'createDatetime',
                        title: '创建日期',
                        align: 'center',
                        valign: 'middle'
                    }]
                }
            };

            function flagFormatter(value, row, index) {
                return '<button class="btn btn-sm btn-danger" ng-click="del()"><i class="fa fa-remove"></i></button>';
            }

        })();

        function remitPrintTypeFormatter(value, row, index) {
            return $filter('meta')(value, $scope.listView.remitPrintType);
        };function statusFormatter(value, row, index) {
            return $filter('meta')(value, $scope.listView.status);
        };

        function search() {
            $scope.listView.table.bootstrapTable('refresh');
        };
        var pageChange = function(num, size) {
            console.log(num + ' - ' + size);
        };
    }];
});
