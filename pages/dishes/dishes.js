// pages/dishes.js
const cart = require('../../utils/cart');
const request = require('../../utils/request');
const {formatCurrency} = require('../../utils/util');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        showCart: false,
        category: [],
        dishes: [],
        recommendDishes: [], // 推荐菜品列表
        activeCategoryId: '', // 菜品分类中，当前选中的分类
        scrollCategoryId: '', // 菜品列表中，当前滚动到的分类
        blockHeight: 500, // 菜品列表的高度，计算左侧选中分类时用到
        blockTop: 100, // 菜品列表距离头部距离，计算左侧选中分类时用到
        listScrollTop: 0, // 菜品列表滚动距离

        cartDataSource: [],
        cartTotalCount: 0,
        cartTotalPrice: 0,
        cartTotalPriceStr: '￥0',

        disableOkButton: true,

        // 动画相关
        dishListLeft: 0,
        dishListTop: 0,
        cartAnimation: {},
        pointAnimations: [],
        pointContainerAnimations: [],
        pointCount: 5, // 动画所需红点个数
        pointDuration: 500, // 红点动画持续时间
        cartBadgePosition: {},
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

    getDishes: function () {
        let activeCategoryId;
        let scrollCategoryId;
        const category = [];
        const dishes = [];
        const recommendDishes = [];
        let recommendName = '';
        let hasDishSuit = false;
        const dishSuitCategoryId = 'dishSuit';

        // TODO 图片路径
        const imageUrl = 'http://172.16.136.57:8082/api';

        request.getDishes()
            .then(res => {
                if (res && res.data && res.data.data && res.data.data.length) {
                    const data = res.data.data;
                    data.forEach(item => {
                        // 普通菜品
                        if (item.type === '01') {
                            const categoryId = item.id;
                            (item.data || []).forEach(dish => {
                                dishes.push({
                                    ...dish,
                                    type: item.type,
                                    id: dish.id,
                                    isSuit: false,
                                    name: dish.name,
                                    picture: imageUrl + dish.dishPictureUrl,
                                    categoryId,
                                    price: dish.dishPrice,
                                    priceStr: formatCurrency(dish.dishPrice),
                                    unit: dish.unit || '份',
                                });
                            });

                            category.push({
                                ...item,
                                id: item.id,
                                name: item.name,
                            });
                        }

                        // 套餐
                        if (item.type === '02') {
                            hasDishSuit = true;
                            dishes.push({
                                ...item.data,
                                ...item,
                                type: item.type,
                                isSuit: true,
                                id: item.id,
                                name: item.name,
                                picture: imageUrl + item.data.dishsuitPictureUril, // Uril ?
                                categoryId: dishSuitCategoryId,
                                price: item.data.dishsuitPrice,
                                priceStr: formatCurrency(item.data.dishsuitPrice),
                                unit: item.data.unit || '份',
                            });
                        }

                        // 推荐
                        if (item.type === '03' && item.data && item.data.length) {
                            recommendName = item.data[0].name;
                            item.data[0].dishList.forEach(dish => {
                                recommendDishes.push({
                                    ...dish,
                                    type: item.type,
                                    id: dish.id,
                                    isSuit: false,
                                    name: dish.name,
                                    picture: imageUrl + dish.dishPictureUrl,
                                });
                            })
                        }
                    });

                    if (hasDishSuit) {
                        // 套餐放入第一个
                        category.unshift({
                            id: dishSuitCategoryId,
                            name: '套餐',
                        });
                    }


                    if (category && category.length) {
                        activeCategoryId = category[0].id;
                        scrollCategoryId = category[0].id;
                    }
                    this.setData({
                        activeCategoryId,
                        scrollCategoryId,
                        category,
                        dishes,
                        recommendName,
                        recommendDishes,
                    });
                    this.syncCart();
                }
                console.log(res);
            })
            .catch(err => {
                console.log(err);
            });
    },

    onLoad: function (options) {
        this.getDishes();
    },

    onShow: function () {
        this.syncCart();
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
        });

        // 获取 dish-list 的 let top 计算加号精确位置时用到
        const queryDishList = wx.createSelectorQuery();
        queryDishList.select('.dish-list').boundingClientRect();
        queryDishList.exec((res) => {
            this.setData({
                dishListLeft: res[0].left,
                dishListTop: res[0].top,
            });
        });

        // 获取 购物车 badge 位置
        const queryBadge = wx.createSelectorQuery();
        queryBadge.select('.badge').boundingClientRect();
        queryBadge.exec((res) => {
            this.setData({
                cartBadgePosition: {
                    left: res[0].left,
                    top: res[0].top,
                },
            });
        })
    },

    // 点击菜品分类
    handleCategoryClick: function (e) {
        const {id} = e.currentTarget.dataset;
        this.setData({activeCategoryId: id, scrollCategoryId: id});
    },


    // 点击菜品图片，跳转菜品详情
    toDishDetail: function (e) {
        const {id, suit = false} = e.currentTarget.dataset;
        const {
            dishes,
            recommendDishes,
        } = this.data;
        let dish = dishes.find(item => item.id === id);
        if (!dish) {
            dish = recommendDishes.find(item => item.id === id);
        }
        wx.setStorageSync('dish-for-detail', dish);

        wx.navigateTo({
            url: `/pages/dish-detail/dish-detail?id=${id}&isSuit=${suit}`
        })
    },

    // 菜品列表滚动事件，通过截流，提高性能
    scrollST: 0,
    handleDishScroll: function (e) {
        if (this.scrollST) {
            clearTimeout(this.scrollST);
        }

        this.scrollST = setTimeout(() => {
            const {scrollTop} = e.detail;
            this.setData({listScrollTop: scrollTop});

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
        const {id: dishId} = e.currentTarget.dataset;
        const {dishes, pointDuration} = this.data;
        const dish = dishes.find(item => item.id === dishId);

        cart.add(dish);

        this.syncCart();

        // 购物车动画 红点落入时启动
        setTimeout(() => {
            this.playCartAnimation();
        }, pointDuration);

        // 红点进入购物车动画
        this.playAddPointAnimation(e);
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

        wx.navigateTo({
            url: '/pages/pre-order/pre-order',
        })
    },

    playCartAnimation: function () {
        const duration = 200;
        const animation = wx.createAnimation({
            duration,
            timingFunction: 'ease',
        });

        animation.scale(1.1, 1.1).step();

        this.setData({
            cartAnimation: animation.export()
        });

        // 官方：iOS/Android 6.3.30 通过 step() 分隔动画，只有第一步动画能生效
        setTimeout(() => {
            animation.scale(1, 1).step();

            this.setData({
                cartAnimation: animation.export()
            });
        }, duration);
    },

    playAddPointAnimation: function (e) {
        const {type} = e.currentTarget.dataset;
        const {offsetLeft, offsetTop} = e.currentTarget;
        const {
            listScrollTop,
            dishListLeft,
            dishListTop,
            pointAnimations,
            pointContainerAnimations,
            pointCount,
            pointDuration,
            cartBadgePosition,
        } = this.data;

        let initLeft = offsetLeft + dishListLeft;
        let initTop = offsetTop + dishListTop - listScrollTop;

        if (type === 'inCart') {
            return;
        }

        // 查找一个没有进行动画的红点节点
        let id = 0;
        for (let i = 0; i < pointCount; i++) {
            if (!pointAnimations[i] || !pointAnimations[i].isAnimating) {
                id = i;
                break;
            }
        }

        // 内部函数，执行动画
        const doAnimations = (left, top, duration) => {
            if (!pointAnimations[id]) pointAnimations[id] = {};
            if (!pointContainerAnimations[id]) pointContainerAnimations[id] = {};

            // 红点自由落体运动，相对于 point-container
            const pointAnimation = wx.createAnimation({
                duration,
                timingFunction: 'ease-in',
            });

            pointAnimation.top(top - initTop).step();

            pointAnimations[id].animation = pointAnimation.export();

            // 红点容器水平匀速运动
            const containerAnimation = wx.createAnimation({
                duration,
                timingFunction: 'ease-out', // 使用 linear 类抛物线， ease-out弧度大，效果好一些
            });


            // 加入 opacity 视觉上弱化动画开始时，卡顿现象
            if (duration === 0) {
                containerAnimation.opacity(0).top(top).left(left).step();
            } else {
                containerAnimation.opacity(1).left(left).step();
            }

            pointContainerAnimations[id].animation = containerAnimation.export();

            this.setData({
                pointAnimations,
                pointContainerAnimations,
            });
        };

        // 红点初始化为点击加号位置
        doAnimations(initLeft, initTop, 0);

        // 开始动画
        const waitTime = 20; // 等待初始化位置设置成功时间
        pointAnimations[id].isAnimating = true;
        setTimeout(() => {
            doAnimations(cartBadgePosition.left, cartBadgePosition.top, pointDuration);
        }, waitTime);

        // 动画结束
        setTimeout(() => {
            pointAnimations[id].isAnimating = false;
            doAnimations(-50, -50, 0);
        }, waitTime + pointDuration);
    },
});