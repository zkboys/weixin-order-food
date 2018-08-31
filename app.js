//app.js
wx.test = '可以扩展wx';
App({
    onLaunch: function (options) {
        // 扫码超过时间 清空数据
        const scanQRCodeTime = wx.getStorageSync('scanQRCodeTime');
        // fixme 修改这个时间限制，或者从后台设置中获取
        const time = 2 * 60 * 60 * 10000;

        if (Date.now() - scanQRCodeTime > time) {
            // 清空相关数据，桌号清空，就要重新扫码了，其他数据不用清除
            wx.removeStorageSync('deskNum');
        }

        // 非扫码进入其他页面，并且桌号不存在，跳转到首页，提示用户扫码
        const {path} = options;
        const deskNum = wx.getStorageSync('deskNum');
        // 不需要跳转的页面
        // TODO 添加忽略页面 应该就一个历史订单
        const ignorePaths = [
            'pages/index/index',
        ];

        if (ignorePaths.indexOf(path) === -1 && !deskNum) {
            wx.reLaunch({
                url: 'pages/index/index'
            })
        }

        // 登录
        wx.login({
            success: res => {
                // TODO 发送 res.code 到后台换取 openId, sessionKey, unionId

                // 登录成功之后，设置一些登录信息，比如token等
                this.globalData.token = 'test-token';
                if (this.loginReadyCallBack) {
                    this.loginReadyCallBack();
                }
            }
        });

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