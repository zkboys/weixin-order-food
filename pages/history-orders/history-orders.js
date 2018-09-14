const request = require('../../utils/request');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        storeName: '世纪金源店',
        activeTabStatus: 'all',
        tabs: [
            {status: 'all', name: '全部'},
            {status: '1', name: '待消费'},
            {status: '2', name: '已完成'},
            {status: '3', name: '已退单'},
        ],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const {activeTabStatus} = this.data;
        this.getOrdersByStatus(activeTabStatus);
    },

    getOrdersByStatus: function (status) {
        // TODO 基于 status 查询历史订单 是否做滚动加载
        status = status === 'all' ? void 0 : status;
        request.getHistoryOrders({status})
            .then(res => {
                console.log(res);
            });
    },

    handleTabClick: function (e) {
        const {status} = e.currentTarget.dataset;
        this.setData({activeTabStatus: status});
        this.getOrdersByStatus(status);
    },

    handleOrderClick: function (e) {
        const {id} = e.currentTarget.dataset;
        wx.navigateTo({
            url: '/pages/order-detail/order-detail?id=' + id,
        })
    },
});