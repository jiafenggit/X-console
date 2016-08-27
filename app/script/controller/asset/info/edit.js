define([], function() {
    return ['$scope', '$timeout', '$state', '$stateParams', '$modal', 'assetService', 'metaService', 'toaster',
        function($scope, $timeout, $state, $stateParams, $modal, assetService, metaService, toaster) {

            var action = $stateParams.id ? 'edit' : 'add';

            $scope.assetVM = {
                action: action,
                title: $stateParams.id ? '修改资产信息' : '新增资产信息',
                data: {},
                cancel: function() {
                    $state.go('asset.info.list');
                },
                birthProvinceChange: function() {
                    $scope.assetVM.birthPlace.city = null;
                    $scope.assetVM.birthPlace.district = null;
                },
                birthCityChange: function() {
                    $scope.assetVM.birthPlace.district = null;
                },
                localProvinceChange: function() {
                    $scope.assetVM.localPlace.city = null;
                    $scope.assetVM.localPlace.district = null;
                },
                localCityChange: function() {
                    $scope.assetVM.localPlace.district = null;
                },
                showFiles: function(type, title) {
                    showFiles(type, title);
                },
                cache: function() {
                    $scope.assetVM.data.status = -1;
                    saveAsset();
                },
                submit: function() {
                    $scope.assetVM.data.status = 0;
                    saveAsset();
                }
            };

            $scope.dateOptions = {
                formatYear: 'yyyy',
                formatMonth: 'MM',
                startingDay: 1,
                class: 'datepicker',
                showWeeks: false
            };

            (function(id) {
                initMetaData();
                if (!id) {
                    return;
                }
                $scope.assetVM.processing = true;
                assetService.asset.get({ id: id }).$promise.then(function(res) {
                    if (res.code == 200)
                        $scope.assetVM.data = res.data;
                    else
                        toaster.pop('error', '资产信息加载失败！');
                    $scope.assetVM.processing = false;
                }, function(err) {
                    toaster.pop('error', '服务器连接失败！');
                    $scope.assetVM.processing = true;
                });
            })($stateParams.id);

            function initMetaData() {
                assetService.findChannel({ data: {}, paginate: { pageNum: 1, pageSize: 2 } }).then(function(res) {
                    if (res.code == 200)
                        $scope.assetVM.channelList = res.data.items || [];
                    else
                        toaster.pop('error', res.msg);
                });
                metaService.getMeta('XB', function(data) {
                    $scope.assetVM.genderList = data;
                });
                metaService.getMeta('SF', function(data) {
                    $scope.assetVM.ynList = data;
                });
                metaService.getMeta('YW', function(data) {
                    $scope.assetVM.ywList = data;
                });
                metaService.getMeta('ZCLX', function(data) {
                    $scope.assetVM.assetTypeList = data;
                });
                metaService.getMeta('HYZK', function(data) {
                    $scope.assetVM.marriageList = data;
                });
                metaService.getProvinces(function(res) {
                    $scope.assetVM.provinces = res;
                });
                metaService.getMeta('HKLX', function(data) {
                    $scope.assetVM.hukouTypeList = data;
                });
                metaService.getMeta('JYSP', function(data) {
                    $scope.assetVM.educationList = data;
                });
                metaService.getMeta('JZQK', function(data) {
                    $scope.assetVM.livingList = data;
                });
                metaService.getMeta('DWXZ', function(data) {
                    $scope.assetVM.corpPropList = data;
                });
                metaService.getMeta('QYHY', function(data) {
                    $scope.assetVM.industryList = data;
                });
                metaService.getMeta('QYGM', function(data) {
                    $scope.assetVM.corpScaleList = data;
                });
                metaService.getMeta('JKLX', function(data) {
                    $scope.assetVM.borrowTypeList = data;
                });
                metaService.getMeta('YTLB', function(data) {
                    $scope.assetVM.useTypeList = data;
                });
                metaService.getMeta('XYJB', function(data) {
                    $scope.assetVM.creditList = data;
                });
                metaService.getMeta('HKFS', function(data) {
                    $scope.assetVM.repaymentTypeList = data;
                });
                metaService.getMeta('HKLY', function(data) {
                    $scope.assetVM.repaymentFromList = data;
                });
                metaService.getMeta('CQR', function(data) {
                    $scope.assetVM.ownerList = data;
                });
            }


            function showFiles(type, title) {
                title = title || '文件列表';
                $modal.open({
                    templateUrl: 'view/asset/info/files.html',
                    size: 'lg',
                    controller: function($scope, $modalInstance) {
                        $scope.filesVM = {
                            title: title,
                            processing: false,
                            files: [
                                { "name": "审批文件01", "url": "/data/files/shenpi01.doc" },
                                { "name": "身份证", "url": "/data/files/shenpi01.doc" },
                                { "name": "资产证明", "url": "/data/files/shenpi01.doc" },
                                { "name": "营业执照", "url": "/data/files/shenpi01.doc" },
                                { "name": "借款协议", "url": "/data/files/shenpi01.doc" },
                                { "name": "调查文件", "url": "/data/files/shenpi01.doc" }
                            ]
                        };
                        $scope.cancel = function() {
                            $modalInstance.dismiss();
                            return false;
                        }
                    }
                });
            }

            function saveAsset() {
                var asset = $scope.assetVM.data;
                var birthPlace = $scope.assetVM.birthPlace;
                var localPlace = $scope.assetVM.localPlace;
                if (birthPlace) {
                    if (birthPlace.province)
                        asset.birthProvince = birthPlace.province.code;
                    if (birthPlace.city)
                        asset.birthCity = birthPlace.city.code;
                    if (birthPlace.district)
                        asset.birthDistrict = birthPlace.birthDistrict.code;
                }
                if (localPlace) {
                    if (localPlace.province)
                        asset.localProvince = localPlace.province.code;
                    if (localPlace.city)
                        asset.localCity = localPlace.city.code;
                    if (localPlace.district)
                        asset.localDistrict = localPlace.district.code;
                }
                asset.assetType = parseInt(asset.assetType);
                if (asset.id)
                    assetService.asset.update({ id: asset.id }, asset).$promise.then(saveSuccess, saveError);
                else
                    assetService.asset.save(asset).$promise.then(saveSuccess, saveError);

                function saveSuccess(res) {
                    if (res.code == 200) {
                        toaster.pop('success', '资产保存成功！');
                        //$state.go('asset.info.draft');
                    } else
                        toaster.pop('error', res.msg);
                    $scope.assetVM.saving = false;
                }

                function saveError(err) {
                    toaster.pop('error', '服务器连接失败！');
                    $scope.assetVM.saving = false;
                }
            }
        }
    ];
});
