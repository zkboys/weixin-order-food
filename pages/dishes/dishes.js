// pages/dishes.js
const cart = require('../../utils/cart');
const {formatCurrency} = require('../../utils/util');


Page({

    /**
     * 页面的初始数据
     */
    data: {
        showCart: false,
        category: [],
        dishes: [],
        activeCategoryId: '', // 菜品分类中，当前选中的分类
        scrollCategoryId: '', // 菜品列表中，当前滚动到的分类
        blockHeight: 500, // 菜品列表的高度，计算左侧选中分类时用到
        blockTop: 100, // 菜品列表滚动条距头部距离，计算左侧选中分类时用到

        cartDataSource: [],
        cartTotalCount: 0,
        cartTotalPrice: 0,
        cartTotalPriceStr: '￥0',

        disableOkButton: true,
    },

    // 同步购物车数据到当前的data中
    syncCart: function () {
        const cartDataSource = cart.getDataSource();
        const cartTotalCount = cart.getTotalCount();

        const dishes = this.data.dishes.map(item => {
            const cartDish = cartDataSource.find(it => it.id === item.id);
            if (cartDish) {
                return {
                    ...item,
                    count: cartDish.count,
                }
            }
            return {
                ...item,
                count: 0,
            };
        });

        // 计算单个菜品的总价
        cartDataSource.forEach(item => {
            item.totalPrice = item.price * item.count;
            item.totalPriceStr = formatCurrency(item.totalPrice);
        });

        const disableOkButton = !cartDataSource || !cartDataSource.length;

        //
        if (cartTotalCount === 0 && this.data.showCart) {
            this.setData({showCart: false});
        }

        this.setData({
            dishes,
            disableOkButton,
            cartDataSource: cartDataSource,
            cartTotalCount: cartTotalCount,
            cartTotalPrice: cart.getTotalPrice(),
            cartTotalPriceStr: formatCurrency(cart.getTotalPrice()),
        });
    },

    // 获取所有分类数据
    getCategory: function () {
        this.setData({
            activeCategoryId: '10',
            scrollCategoryId: '10',
            category: [
                {id: '00', name: '优惠套餐'},
                {id: '01', name: '热菜'},
                {id: '02', name: '凉菜'},
                {id: '03', name: '午市套餐'},
                {id: '04', name: '镇店之宝'},
                {id: '05', name: '本店十大名菜是好东西'},
                {id: '06', name: '人气香味'},
                {id: '07', name: '开胃凉菜'},
                {id: '08', name: '酒水'},
                {id: '09', name: '好吃米饭'},
                {id: '10', name: '大盘点心'},
                {id: '11', name: '烤串'},
            ],
        });
    },

    getDishes: function () {
        const {category, cartDataSource} = this.data;

        const dishes = [];
        category.forEach((item, index) => {
            for (let i = 0; i < 5; i++) {
                const id = item.id + '-' + i;

                const cartDish = cartDataSource.find(it => it.id === id);
                let count = cartDish ? cartDish.count : 0;
                const price = (i + 1) * (index + 1);

                dishes.push({
                    id,
                    categoryId: item.id,
                    name: '菜品名称-' + id,
                    price,
                    priceStr: formatCurrency(price),
                    unit: '份',
                    count,
                });
            }
        });

        this.setData({dishes});
        this.syncCart();
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getCategory();
        this.getDishes();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        // scroll-view 需要设置高度
        const query = wx.createSelectorQuery();

        query.select('.dish-block').boundingClientRect();
        query.exec((res) => {
            this.setData({
                blockHeight: res[0].height,
                blockTop: res[0].top,
            });
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    // 点击菜品分类
    handleCategoryClick: function (e) {
        const {id} = e.currentTarget.dataset;
        this.setData({activeCategoryId: id, scrollCategoryId: id});
    },


    // 点击菜品图片，跳转菜品详情
    toDishDetail: function (e) {
        wx.navigateTo({
            url: '/pages/dish-detail/dish-detail'
        })
    },

    // 菜品列表滚动事件，通过截流，提高性能
    scrollST: 0,
    handleDishScroll: function (e) {
        if (this.scrollST) {
            clearTimeout(this.scrollST);
        }

        this.scrollST = setTimeout(() => {
            const {blockHeight, blockTop} = this.data;

            const query = wx.createSelectorQuery();
            query.selectAll('.dish-category-title').boundingClientRect()
            query.exec((res) => {
                let hasTitleInShow = false;
                let activeCategoryId;

                // 分类title在可见范围之内
                for (let i = 0; i < res[0].length; i++) {
                    const title = res[0][i];
                    const id = title.id.replace('dc', '');
                    const titleToBlockTop = title.top - blockTop;
                    // title在60%上部分
                    if (titleToBlockTop >= 0 && titleToBlockTop < (blockHeight * 0.6)) {
                        activeCategoryId = id;
                        hasTitleInShow = true;
                        break;
                    }
                }

                // // 分类title不在可见范围之内，判断当前内容是那个分类的
                if (!hasTitleInShow) {
                    let nearestTitleTop;

                    for (let i = 0; i < res[0].length; i++) {
                        const title = res[0][i];
                        const id = title.id.replace('dc', '');
                        const titleToBlockTop = title.top - blockTop;

                        if (nearestTitleTop === undefined) {
                            nearestTitleTop = titleToBlockTop;
                            activeCategoryId = id;
                        }

                        if (titleToBlockTop < 0 && titleToBlockTop > nearestTitleTop) {
                            nearestTitleTop = titleToBlockTop;
                            activeCategoryId = id;
                        }
                    }
                }

                this.setData({activeCategoryId});
            })
        }, 100);
    },

    // 切换购物车显示隐藏
    toggleCart: function () {
        if (this.data.showCart) {
            this.hideCart();
        } else {
            this.showCart();
        }
    },

    // 购物车图标点击 弹出购物车
    showCart: function () {
        if (this.data.cartDataSource && this.data.cartDataSource.length) {
            this.setData({showCart: true});
        }
    },

    // 隐藏购物车
    hideCart: function () {
        this.setData({showCart: false});
    },

    addCart: function (e) {
        const dishId = e.currentTarget.dataset.id;
        const {dishes} = this.data;
        const dish = dishes.find(item => item.id === dishId);

        cart.add(dish);

        this.syncCart();
    },

    minusCart: function (e) {
        const dishId = e.currentTarget.dataset.id;
        const {dishes} = this.data;
        const dish = dishes.find(item => item.id === dishId);

        cart.remove(dish);
        this.syncCart();
    },

    clearCart: function () {
        cart.clear();
        this.syncCart();
        this.hideCart();
    },

    // 点好了按钮点击事件
    handleOk: function (e) {
        if (e.currentTarget.dataset.disabled) return;

        // TODO
        console.log(e);
    },
});