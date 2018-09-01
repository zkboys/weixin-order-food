//index.js
//获取应用实例
const app = getApp();
const request = require('../../utils/request');
const {parseQueryString} = require('../../utils/util');

Page({
    data: {
        store: {},
        deskNum: '', // 当前点餐桌号
        showOrderButton: false, // 显示 单人点餐 多人同步点餐按钮
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo')
    },

    getQRCodeParams: function (params) {
        const {storeId, deskNum} = params;

        if (deskNum) {
            this.setData({deskNum, showOrderButton: true});
            wx.setStorageSync('deskNum', deskNum);
            wx.setStorageSync('scanQRCodeTime', Date.now());
        }

        if (storeId) {
            wx.setStorageSync('storeId', storeId);
            // TODO 基于storeId 获取门店信息
            const store = {
                logo: '/images/logo.png',
                name: '望湘园金源时代店',
            };
            this.setData({store});
        }
    },

    onLoad: function (options) {
        // 通过二维码扫描进入时，获取参数
        // options 中的 scene 需要使用 decodeURIComponent 才能获取到生成二维码时传入的 scene
        const scene = decodeURIComponent(options.scene);
        this.getQRCodeParams(parseQueryString(scene));


        app.loginReadyCallBack = () => {
            // 登录是异步的 ，需要使用callback方式
            // 这个时候可以发送请求之类的了
            // request.getOrderStatus({
            //     url: '/getOrderStatus',
            // })
        };
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

    // 带菜按钮点击事件
    handleOrderClick: function (e) {
        // 多人、单人 multiple single
        const {type} = e.currentTarget.dataset;

        wx.setStorageSync('orderType', type);

        wx.navigateTo({
            url: '/pages/people-number/people-number'
        })
    },

    // 跳转到用户历史订单
    toHistoryOrders: function () {
        wx.showToast({title: '跳转到历史订单'});
    },
});
