const cart = require('../../utils/cart');
const {formatCurrency, formatTime} = require('../../utils/util');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        orderTime: '',
        deskNum: '',
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
        const dishes = cart.getDataSource();
        dishes.forEach(dish => {
            dish.priceStr = formatCurrency(dish.price, {prefix: ''});
        });

        this.setData({
            deskNum: wx.getStorageSync('deskNum'),
            dishes: cart.getDataSource(),
            dishTotalCount: cart.getTotalCount(),
            dishTotalPrice,
            dishTotalPriceStr: formatCurrency(dishTotalPrice),
            // TODO 从后端获取下单时间？
            orderTime: formatTime(new Date()),
        });
    },

    handleReOrder: function () {
        wx.navigateTo({
            url: '/pages/index/index',
        })
    },
})