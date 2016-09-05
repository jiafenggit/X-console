define([], function() {
    return ['$scope', '$timeout', '$state', '$stateParams', '$modal', 'assetService', 'metaService',
        function($scope, $timeout, $state, $stateParams, $modal, assetService, metaService) {

            var action = $stateParams.id ? 'edit' : 'add';

            $scope.productVM = {
                action: action,
                title: '产品上架信息',
                data: {},
                cancel: function() {
                    $state.go('asset.release.todo');
                },
                submit: submit
            };

            (function(id) {
                initMetaData();
                if (!id) {
                    return;
                }
                assetService.product.get({ id: id }).$promise.then(function(res) {
                    $scope.productVM.data = res.data;
                }, function(err) {});

            })($stateParams.id);


            function initMetaData() {
                assetService.platform.query(JSON.stringify({ data: {}, paginate: { pageNum: 1, pageSize: 100 } })).$promise.then(function(res) {
                    if (res.code == 200) {
                        $scope.productVM.saleplatformList = res.data.items;
                    } else
                        console.log('获取销售平台失败：' + res.msg);
                }, function(err) {
                    console.log('获取销售平台失败：服务器连接错误！')
                });
                metaService.getMeta('ZCLX', function(data) {
                    $scope.productVM.assetTypeList = data;
                });
                metaService.getMeta('HKFS', function(data) {
                    $scope.productVM.repaymentTypeList = data;
                });
                metaService.getMeta('CQR', function(data) {
                    $scope.productVM.ownerList = data;
                });
                metaService.getMeta('JBFS', function(data) {
                    $scope.productVM.approveTypeList = data;
                });
            }

            function submit(invalid) {
                if (invalid) {
                    return false;
                }

                assetService.onshelf($scope.productVM.data).then(function(res) {
                    if (res.code == 200) {
                        toaster.pop('success', '产品上架成功！');
                        $state.go('asset.release.todo');
                    } else
                        toaster.pop('error', res.msg);
                }, function(err) {
                    toaster.pop('error', '服务器连接出错！');
                });
            }
        }
    ];
});
