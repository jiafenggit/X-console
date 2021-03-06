define([], function() {
    return ['$scope', 'toaster', '$timeout', '$state', '$stateParams', 'metaService', '$filter', 'investorService', 'publicService', function($scope, toaster, $timeout, $state, $stateParams, metaService, $filter, investorService, publicService) {
        $scope.vm = {
            data: {},
            table: null,
            bankProvince: [],
            cancel: function() {
                $state.go('investor.investor.list');
            },
            bankProvinceChange: function() {
                $scope.vm.data.bankCity = null;
            },
            getCities: function(provinceCode) {
                var result = [];
                $scope.vm.bankProvince.forEach(function(item) {
                    if (item.code == provinceCode) {
                        result = item.children;
                        return;
                    }
                });
                return result;
            },
            submit: submit,
            getBankName: getBankName,
        };
        $scope.$on('$viewContentLoaded', function() {
            $scope.vm.table = $('#bankAccountTable');
        });

        function initMetaData() {
            metaService.getMeta("ZT", function(data) {
                $scope.vm.status = data;
            });
            metaService.getProvinces(function(res) {
                $scope.vm.bankProvince = res;
            });
            metaService.getCities(function(res) {
                $scope.vm.bankCity = res;
            });

        }
        initMetaData();


        function getBankName(id) {
            $scope.vm.data.bankCode = null;
            investorService.getBankName.get({ id: id }).$promise.then(function(res) {
                if (res.data == null || res.data == undefined) {
                    $scope.vm.data.bankCode = null;
                    return false;
                }
                $scope.vm.data.bankCode = res.data.bankName;
                //存储bankName以便save的时候转化为code
                $scope.vm.bankNameCode = res.data.bankCode;

            });
        }
        var getData = function(params) {
            investorService.bankListTable.get({ id: $stateParams.id }).$promise.then(function(res) {
                params.success({
                    rows: res.data
                });
            });
        };
        (function init() {

            $scope.bsBankAccountTableControl = {
                options: {
                    cache: false,
                    pagination: false,
                    pageList: [10, 25, 50, 100, 200],
                    ajax: getData,
                    sidePagination: "server",
                    columns: [{
                        field: 'bankAccount',
                        title: '银行账号',
                        align: 'center',
                        valign: 'middle',

                    }, {
                        field: 'bankAccountMask',
                        title: '银行账号掩码',
                        align: 'center',
                        valign: 'middle',

                    }, {
                        field: 'bankName',
                        title: '银行',
                        align: 'center',
                        valign: 'middle',

                    }, {
                        field: 'branchName',
                        title: '支行',
                        align: 'center',
                        valign: 'middle',

                    }, {
                        field: 'bankProvince',
                        title: '省份',
                        formatter: provinceFormatter,
                        align: 'center',
                        valign: 'middle',

                    }, {
                        field: 'bankCity',
                        title: '地市',
                        formatter: cityFormatter,
                        align: 'center',
                        valign: 'middle',

                    }, {
                        field: 'status',
                        title: '状态',
                        align: 'center',
                        valign: 'middle',
                        formatter: statusFormatter

                    }, {
                        field: 'createDatetime',
                        title: '创建时间',
                        formatter: dateFormatter,
                        align: 'center',
                        valign: 'middle',

                    }]
                }
            };

            function statusFormatter(value, row, index) {
                return $filter('meta')(value, $scope.vm.status);
            }

            function provinceFormatter(value, row, index) {
                return $filter('metaPCA')(value, $scope.vm.bankProvince);
            }

            function cityFormatter(value, row, index) {
                return $filter('metaPCA')(value, $scope.vm.bankCity);
            }

            function dateFormatter(value, row, index) {
                return $filter('exDate')(value, 'yyyy-MM-dd HH:mm:ss');
            }
        })();

        function submit(invalid) {
            $scope.vm.submitted = true;
            if (invalid) {
                return;
            }
            if ($scope.vm.data.bankCode == null || $scope.vm.data.bankCode == undefined) {
                toaster.pop('error', '银行名称不能为空，请输入正确的银行卡号！');
                return false;
            }else{
                 save();
            }
           
            return true;
        };

        function refresh() {
            $scope.vm.table.bootstrapTable('refresh');
        };

        $scope.reset = function() {
            $scope.vm.data = {};
        };

        function save() {
            //新增银行账号
            $scope.vm.data.bankCode = $scope.vm.bankNameCode;
            $scope.vm.data.investorId = $stateParams.id;
            investorService.createBankAcc.save($scope.vm.data).$promise.then(function(res) {
                    if (res.code == 200) {
                        toaster.pop('success', '新增银行账户成功！');
                        $scope.vm.data = {};
                        refresh();
                        $scope.vm.submitted = false;
                        $scope.maintainForm.$setPristine();
                    } else {
                        $scope.vm.data = {};
                        toaster.pop('error', res.msg);
                    }

                },
                function(err) {
                    $scope.vm.data = {};
                    toaster.pop('error', '服务器连接失败！');
                });
            return;
        }

    }];
});
