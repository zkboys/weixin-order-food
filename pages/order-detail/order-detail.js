const request = require('../../utils/request');
const {formatCurrency} = require('../../utils/util');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        order: {},
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const {id} = options;
        const statusList = {
            '00': '已完成',
            '01': '支付失败',
            '02': '订单初始化',
            '03': '待支付',
        };
        request.getHistoryOrderDetail({id})
            .then(res => {
                let order = {};
                if (res.data.code === '0000') {
                    const d = res.data.data;
                    const {date, time} = d;
                    let orderTime = '';
                    if (date && time) {
                        const year = date.substr(0, 4);
                        const month = date.substr(4, 2);
                        const day = date.substr(6, 2);
                        const hour = time.substr(0, 2);
                        const minute = time.substr(2, 2);
                        const second = time.substr(4, 2);
                        orderTime = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
                    }
                    order = {
                        ...d,
                        storeName: d.store.name,
                        storeMobile: d.store.phone,
                        storePosition: {
                            latitude: d.store.latitude,
                            longitude: d.store.longitude,
                        },
                        storeAddress: d.store.address,
                        totalPrice: d.price,
                        totalPriceStr: formatCurrency(d.price, {prefix: ''}),
                        dishes: d.list.map(item => ({id: item.id, name: item.dishName, unit: item.unit, count: item.count, price: item.price, priceStr: formatCurrency(item.price, {prefix: ''})})),
                        status: statusList[d.status] || '未知',
                        orderNo: d.id,
                        deskNo: d.deskNo,
                        orderTime,
                    };
                }
                this.setData({order});
            });
    },

    handleContactClick: function () {
        const {storeMobile} = this.data.order;
        wx.makePhoneCall({
            phoneNumber: storeMobile,
            success: () => {

            },
            fail: () => {
            },

        });
    },

    handleMapClick: function () {
        const {latitude, longitude} = this.data.order.storePosition;
        const {storeName, storeAddress} = this.data.order;
        // 好像不用户授权
        wx.openLocation({
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            name: storeName,
            address: storeAddress,
            success: () => {

            },
            fail: () => {
            },
        });
    },
});