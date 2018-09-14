const cart = require('../../utils/cart');
const {formatCurrency, formatTime} = require('../../utils/util');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        orderTime: '',
        deskNo: '',
        dishes: [],
        dishTotalCount: 0,
        dishTotalPrice: 0,
        dishTotalPriceStr: '￥0.00',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        const dishTotalPrice = cart.getTotalPrice();
        const dishTotalCount = cart.getTotalCount();
        const dishes = cart.getDataSource();
        const deskNo = wx.getStorageSync('deskNo');
        const dishTotalPriceStr = formatCurrency(dishTotalPrice);
        const orderTime = formatTime(new Date());

        dishes.forEach(dish => {
            dish.priceStr = formatCurrency(dish.price, {prefix: ''});
        });

        this.setData({
            deskNo,
            dishes,
            dishTotalCount,
            dishTotalPrice,
            dishTotalPriceStr,
            orderTime,
        }, () => {
            // 清除本次流程存储的相关数据, 其他数据应该不用清除
            cart.clear(); // cart clear 用到 storeId 了
            wx.removeStorageSync('storeId');
            wx.removeStorageSync('deskNo');
        });
    },

    handleReOrder: function () {
        wx.navigateTo({
            url: '/pages/index/index',
        })
    },
})