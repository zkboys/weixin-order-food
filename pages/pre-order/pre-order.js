const cart = require('../../utils/cart');
const {formatCurrency} = require('../../utils/util');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        deskNo: '',
        dishes: [],
        dishTotalCount: 0,
        dishTotalPrice: 0,
        dishTotalPriceStr: '￥0.00',
        peopleNumber: 0,
        peopleNumbers: [],
        remark: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        const dishTotalPrice = cart.getTotalPrice();
        const dishes = cart.getDataSource();
        dishes.forEach(dish => {
            dish.priceStr = formatCurrency(dish.price, {prefix: ''});
        });

        const peopleNumbers = [];
        for (let i = 1; i <= 50; i++) {
            peopleNumbers.push(i + ' 人');
        }


        this.setData({
            deskNo: wx.getStorageSync('deskNo'),
            dishes: cart.getDataSource(),
            dishTotalCount: cart.getTotalCount(),
            dishTotalPrice,
            dishTotalPriceStr: formatCurrency(dishTotalPrice),
            peopleNumber: wx.getStorageSync('peopleNumber'),
            peopleNumbers,
        });
    },

    handleInputRemark: function (e) {
        const {value} = e.detail;
        this.setData({remark: value});
    },
    handlePeopleNumberChange: function (e) {
        const peopleNumber = parseInt(e.detail.value) + 1;
        this.setData({peopleNumber});
    },
    handleSubmit: function () {
        const {remark} = this.data;
        // TODO 直接调用支付，支付成功之后，跳转到下单成功界面

        // 点餐中状态设置为false，需要重新扫码，进入点餐流程
        wx.setStorageSync('ordering', false);

        // 清除本次存储的相关数据
        wx.removeStorageSync('scanQRCodeTime');
        wx.removeStorageSync('storeId');
        wx.removeStorageSync('orderType');
        wx.removeStorageSync('cart');

        wx.navigateTo({
            url: '/pages/order-success/order-success',
        })
    },
})