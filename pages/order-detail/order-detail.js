const request = require('../../utils/request');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        store: {
            name: '世纪金源店',
            mobile: '18611434366',
            position: {
                // 获取经纬度：http://lbs.qq.com/tool/getpoint/index.html
                latitude: 39.942384, // 纬度
                longitude: 116.187973, // 经度
                address: '详细地址',
            },
        },
        order: {
            totalPrice: 123,
            totalPriceStr: '123.00',
            dishes: [
                {id: 1, name: '红烧牛肉', unit: '分', count: 2, price: 100, priceStr: '100.00'},
                {id: 2, name: '拍黄瓜', unit: '盘', count: 1, price: 10, priceStr: '10.00'},
                {id: 3, name: '丹东大螃蟹', unit: '个', count: 10, price: 30, priceStr: '30.00'},
                {id: 4, name: '丹东大螃蟹', unit: '个', count: 10, price: 30, priceStr: '30.00'},
                {id: 5, name: '丹东大螃蟹', unit: '个', count: 10, price: 30, priceStr: '30.00'},
                {id: 6, name: '丹东大螃蟹', unit: '个', count: 10, price: 30, priceStr: '30.00'},
                {id: 7, name: '丹东大螃蟹', unit: '个', count: 10, price: 30, priceStr: '30.00'},
                {id: 8, name: '丹东大螃蟹', unit: '个', count: 10, price: 30, priceStr: '30.00'},
            ],
        },
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const {id} = options;
        // TODO 基于订单id 查询订单数据
        request.getHistoryOrderDetail({id})
            .then(res => {
                let order = {};
                if (res.data.code === '0000') {
                    const d = res.data.data;
                    order = {
                        ...d,
                        storeName: '',
                        storeMobile: '',
                        storePosition: '',
                        totalPrice: '',
                        totalPriceStr: '',
                        dishes: [],
                        status: '',
                        orderNo: d.id,
                        deskNo: d.deskNo,
                        orderTime: '',
                    };
                }
                this.setData({order});
                console.log(111, order);
            });
    },

    handleContactClick: function () {
        const {mobile} = this.data.store;
        wx.makePhoneCall({
            phoneNumber: mobile,
            success: () => {

            },
            fail: () => {
            },

        });
    },

    handleMapClick: function () {
        const {name} = this.data.store;
        const {latitude, longitude, address} = this.data.store.position;
        // 好像不用户授权
        wx.openLocation({
            latitude,
            longitude,
            name,
            address,
            success: () => {

            },
            fail: () => {
            },
        });
    },
});