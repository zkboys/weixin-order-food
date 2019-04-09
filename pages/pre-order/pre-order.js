const cart = require('../../utils/cart');
const request = require('../../utils/request');
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

        const dataSource = cart.getDataSource();
        const params = dataSource.map(item => {
            const {specification} = item;
            const remark = [];
            if (specification && specification.length) {
                specification.forEach(it => {
                    if (it.selected) {
                        remark.push(it.label);
                    }
                })
            }
            let type = item.type;
            if (!type || type === '03') type = '01';
            return {
                type,
                dishId: item.id,
                count: item.count,
                remark: remark.join(',')
            };

        });

        request.submitOrder(params)
            .then(res => {
                console.log('submitOrder', res);
                /*
                appid: "wx7c89ca859d0345fd"
                nonceStr: "d039684ee129447dbfb37e620ae1fbdc"
                package: "prepay_id=test2018091501111"
                paySign: "0316B4C25449ADEBEACA612EE4CDCD9C"
                timeStamp: "1554186699"

                timeStamp	string		是	时间戳，从 1970 年 1 月 1 日 00:00:00 至今的秒数，即当前的时间
                nonceStr	string		是	随机字符串，长度为32个字符以下
                package	string		是	统一下单接口返回的 prepay_id 参数值，提交格式如：prepay_id=***
                signType	string	MD5	否	签名算法
                paySign	string		是	签名，具体签名方案参见 小程序支付接口文档
                success	function		否	接口调用成功的回调函数
                fail	function		否	接口调用失败的回调函数
                complete	function		否	接口调用结束的回调函数（调用成功、失败都会执行）
                */
                const {appid, nonceStr, paySign, timeStamp} = res.data.data;
                wx.requestPayment({
                    timeStamp,
                    nonceStr,
                    package: res.data.data.package, // package是关键字
                    paySign,
                    signType: 'MD5',
                    success: () => {
                        console.log('success');
                    },
                    fail: () => {
                        console.log('fail');
                    },
                    complete: () => {
                        console.log('complete');
                    },
                });
                wx.navigateTo({
                    url: '/pages/order-success/order-success',
                })
            });
    },
})
