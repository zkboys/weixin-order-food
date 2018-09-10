//index.js
//获取应用实例
const app = getApp();
const request = require('../../utils/request');

Page({
    data: {
        hasUncompletedOrder: false,
        store: {},
        storeId: '',
        deskNo: '', // 当前点餐桌号
        showScanTip: false, // 显示提示扫码
        showOrderButton: false, // 显示点餐按钮
        showAddPayButton: false, // 显示加菜 结账按钮
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
    },

    onLoad: function (options) {
        console.log('index.js onLoad', options);

        let isInit = false;
        app.initReadyCallBack = () => { // 初始化成功回调
            this.init();
            isInit = true;
        };
        if (!isInit) this.init();
    },

    init: function (options) {
        const hasUncompletedOrder = wx.getStorageSync('hasUncompletedOrder');
        const store = wx.getStorageSync('store');
        const storeId = wx.getStorageSync('storeId');
        const deskNo = wx.getStorageSync('deskNo'); // 当前点餐桌号
        const showScanTip = !storeId && !deskNo;
        const showAddPayButton = hasUncompletedOrder;
        const showOrderButton = storeId && deskNo && !showAddPayButton;

        this.setData({
            hasUncompletedOrder,
            store,
            storeId,
            deskNo,
            showScanTip,
            showAddPayButton,
            showOrderButton,
        });

        this.initUserInfo();
    },

    // 用户已经授权，获取用户信息
    initUserInfo: function () {
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })
        } else if (this.data.canIUse) {
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            app.userInfoReadyCallback = res => {
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                })
            }
        } else {
            // 在没有 open-type=getUserInfo 版本的兼容处理
            wx.getUserInfo({
                success: res => {
                    app.globalData.userInfo = res.userInfo
                    this.setData({
                        userInfo: res.userInfo,
                        hasUserInfo: true
                    })
                }
            })
        }
    },

    // 点击头像，如果未授权，弹出授权询问框
    getUserInfo: function (e) {
        if (e.detail.userInfo) {
            app.globalData.userInfo = e.detail.userInfo;
            this.setData({
                userInfo: e.detail.userInfo,
                hasUserInfo: true
            })
        } else {
            // 用户点击了拒绝
        }
        this.toHistoryOrders();
    },

    // 两个点餐按钮点击事件
    handleOrderClick: function (e) {
        // 多人、单人 multiple single
        const {type} = e.currentTarget.dataset;

        wx.setStorageSync('orderType', type);

        wx.navigateTo({
            url: '/pages/people-number/people-number'
        });
    },

    // 扫描二维码点餐
    handleScanQRCodeClick: function (e) {
        wx.scanCode({
            scanType: ['qrCode'],
            success: (data) => {
                console.log('success');
                console.log(data);

                // TODO 获取扫描结果中的storeId deskNo
                const storeId = '1';
                const deskNo = '1';
                wx.setStorageSync('storeId', storeId);
                wx.setStorageSync('deskNo', deskNo);
                wx.setStorageSync('innerScan', true);

                app.initStoreMessage(() => {
                    this.init();
                });

                this.setData({
                    showScanTip: false,
                    showAddPayButton: false,
                    showOrderButton: true,
                });
            }
        });
    },
    // 加菜按钮点击事件
    handleAddDishClick: function (e) {
        // TODO
    },

    // 结账按钮点击事件
    handlePayClick: function (e) {
        // TODO
    },

    // 跳转到用户历史订单
    toHistoryOrders: function () {
        wx.navigateTo({
            url: '/pages/history-orders/history-orders'
        })
    },
});
