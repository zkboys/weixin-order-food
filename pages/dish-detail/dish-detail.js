const {formatCurrency} = require('../../utils/util');
const cart = require('../../utils/cart');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isSuit: false, // 是否是套餐
        dish: {},
    },

    syncFromCart: function (dish) {
        const cartDish = cart.getById(dish.id);

        let d = dish;
        if (cartDish) {
            d = {
                ...dish,
                count: cartDish.count,
                specification: cartDish.specification || dish.specification,
            };
        }
        this.setData({dish: d});
        return d;
    },

    syncToCart: function (data) {
        cart.update(data);
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // let {id, isSuit} = options;

        const dish = wx.getStorageSync('dish-for-detail');
        if (dish) {
            let specification = dish.dishSpecification ? dish.dishSpecification.split(',') : [];
            specification = specification.map(item => ({selected: false, label: item}));
            let d = {
                id: dish.id,
                picture: dish.picture,
                name: dish.name,
                type: dish.type,
                isSuit: dish.isSuit,
                dishes: dish.list,
                specification,
                presentation: dish.isSuit ? dish.dishsuitPresentation : dish.dishPresentation,
                price: dish.price,
                priceStr: formatCurrency(dish.price, {prefix: ''}),
                count: dish.count,
            };

            d = this.syncFromCart(d);

            this.setData({
                dish: d,
            });
        }
    },

    handleSpecificationClick: function (e) {
        let {dish} = this.data;
        const {specification} = dish;
        const {label, selected} = e.currentTarget.dataset;
        const s = specification.find(item => item.label === label);
        s.selected = !selected;

        this.setData({dish});

        this.syncToCart({id: dish.id, specification});
    },

    addCart: function () {
        const {dish} = this.data;
        cart.add(dish);
        this.syncFromCart(dish);
    },

    minusCart: function (e) {
        const {dish} = this.data;
        cart.remove(dish);
        this.syncFromCart(dish);
    },

});