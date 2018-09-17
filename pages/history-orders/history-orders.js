const request = require('../../utils/request');
const {formatCurrency} = require('../../utils/util');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        storeName: '世纪金源店',
        activeTabStatus: 'all',
        tabs: [
            {status: 'all', name: '全部'},
            {status: '03', name: '待支付'},
            {status: '00', name: '已完成'},
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
        // fixme 是否做滚动加载
        status = status === 'all' ? void 0 : status;
        const statusList = {
            '00': '已完成',
            '01': '支付失败',
            '02': '订单初始化',
            '03': '待支付',
        };
        request.getHistoryOrders({status})
            .then(res => {
                let dataSource = [];
                if (res.data.code === '0000') {
                    dataSource = res.data.data;
                }
                const ds = dataSource.map(item => {
                    const {date, time} = item;
                    const status = statusList[item.status] || '';
                    let orderTime = '';
                    if (date && time) {
                        const year = date.substr(0, 4);
                        const month = date.substr(4, 2);
                        const day = date.substr(6, 2);
                        const hour = time.substr(0, 2);
                        const minute = time.substr(2, 2);
                        orderTime = `${year}-${month}-${day} ${hour}:${minute}`;
                    }
                    return {
                        ...item,
                        id: item.id,
                        orderNo: item.id,
                        price: item.price,
                        priceStr: formatCurrency(item.price),
                        orderTime,
                        storeName: '门店名', // TODO 接口中没有门店名
                        status,
                    };
                });
                this.setData({dataSource: ds});
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