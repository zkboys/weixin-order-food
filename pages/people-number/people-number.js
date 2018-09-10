const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {},
        hasUserInfo: false,
        peopleNumber: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })
        }
    },

    handleNumberClick: function (e) {
        const {number} = e.currentTarget.dataset;
        this.setData({peopleNumber: number});

        wx.setStorageSync('peopleNumber', number);
        wx.navigateTo({
            url: '/pages/dishes/dishes',
        })
    },
});