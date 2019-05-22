//app.js
const {parseQueryString} = require('./utils/util');
const request = require('./utils/request');

// console.log(App);
App({
    // onLaunch 小程序启动的时候触发，再次打开并不触发
    // fixme onShow 页面再次显示触发，调用扫码、地图等，再次切换回来也触发
    // onLaunch: function () {
    // },
    onShow: function (options) {
        this.getSettings();
        this.init(options);
    },

    onHide: function () {
        // wx.showToast({title: 'app.js onHide'});

        wx.setStorageSync('innerScan', false);
    },

    init: function (options = {}) {
        console.log(options);
        // 要启动的页面path
        const {scene: sceneType, path} = options;

        const innerScan = wx.getStorageSync('innerScan');

        // TODO 进入方式判断
        // const scanIn = '' + sceneType === '1011' || innerScan;
        //
        // // 非扫码方式进入, 统一跳到首页，提示扫码
        // if (!scanIn) {
        //     wx.removeStorageSync('storeId');
        //     wx.removeStorageSync('deskNo');
        //     this.toIndex(path);
        //     if (this.initReadyCallBack) {
        //         this.initReadyCallBack();
        //     }
        //     return;
        // }

        // 二维码中携带的参数
        const query = options && options.query || {};


        // 参数存在 进入初始化流程
        let storeId = query.storeId;
        let deskNo = query.deskNo;

        // 存在参数，优先从参数中获取storeId deskNo
        if (storeId && deskNo) {
            // 缓存storeId deskNo
            wx.setStorageSync('storeId', storeId);
            wx.setStorageSync('deskNo', deskNo);

            // 记录获取到storeId deskNo时间
            wx.setStorageSync('scanTime-' + storeId + deskNo, Date.now());
        } else {
            // 参数不存在（非扫码进入），从存储中获取storeId deskNo
            storeId = wx.getStorageSync('storeId');
            deskNo = wx.getStorageSync('deskNo');

            // 记录获取到storeId deskNo时间
            wx.setStorageSync('scanTime-' + storeId + deskNo, Date.now());

            if (storeId && deskNo && this.isExpired()) {
                storeId = null;
                deskNo = null;
                wx.setStorageSync('storeId', storeId);
                wx.setStorageSync('deskNo', deskNo);
            }
        }

        // 如果storeId deskNo不存在，部分页面要跳转到提示扫码页面
        if (!storeId && !deskNo) {
            this.toIndex(path);
        } else {
            // 登录
            wx.login({
                success: res => {

                    request.login({code: res.code, storeId, deskNo})
                        .then(res => {
                            if (res && res.data && res.data.data && res.data.data.token) {
                                const token = res.data.data.token;
                                // 登录成功之后，设置一些登录信息，比如token等
                                this.globalData.token = token;

                                // 登录成功之后，进行初始化
                                this.initStoreMessage();
                            }
                        })
                        .catch(err => {
                            console.log(err);
                            wx.showToast({
                                title: '登录失败',
                                icon: 'none',
                            });
                        });
                }
            });

        }
    },

    // 初始化点餐相关数据
    initStoreMessage: function (callBack) {
        const storeId = wx.getStorageSync('storeId');
        const deskNo = wx.getStorageSync('deskNo');

        request.getStore().then(res => {
            const {name} = res.data.data;
            const store = {
                logo: '/images/logo.png',
                name,
            };
            wx.setStorageSync('store', store);

            const checkOutType = 'before'; // before 先结账 after 后结账
            wx.setStorageSync('checkOutType', checkOutType);

            // 后付款用户，会存在未完成订单，需要跳转到首页，提示加菜、结账等
            let hasUncompletedOrder = false;
            wx.setStorageSync('hasUncompletedOrder', hasUncompletedOrder);
            if (hasUncompletedOrder) {
                // TODO 根据未完成订单恢复购物车数据、点餐人数，然后跳转到首页，提示加菜、结账
            }

            if (this.initReadyCallBack) {
                this.initReadyCallBack();
            }

        });
    },

    // 是否过期，提示重新扫码
    isExpired: function () {
        const storeId = wx.getStorageSync('storeId');
        const deskNo = wx.getStorageSync('deskNo');
        const lastScanTime = wx.getStorageSync('scanTime-' + storeId + deskNo);
        const expireTime = 1000 * 60 * 60 * 5; // fixme 5 小时后过期
        return Date.now() - lastScanTime > expireTime;
    },

    toIndex: function (currentPath) {
        // 不需要跳转的页面
        const ignorePaths = [
            'pages/index/index',
            'pages/history-orders/history-orders',
            'pages/order-detail/order-detail',
        ];

        if (ignorePaths.indexOf(currentPath) === -1) {
            wx.reLaunch({
                url: '/pages/index/index'
            })
        }
    },

    // 启动时，获取一些设置信息
    getSettings: function () {
        // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            // 可以将 res 发送给后台解码出 unionId
                            this.globalData.userInfo = res.userInfo

                            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                            // 所以此处加入 callback 以防止这种情况
                            if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res)
                            }
                        }
                    })
                }
            }
        })
    },
    globalData: {
        userInfo: null,
    }
});
