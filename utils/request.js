const app = getApp();

// 扩展Promise finally 方法
if (!Promise.prototype.finally) {
    Promise.prototype.finally = function (callback) {
        let P = this.constructor;
        return this.then(
            value => P.resolve(callback()).then(() => value),
            reason => P.resolve(callback()).then(() => {
                throw reason;
            })
        );
    };
}

// TODO 修改服务器地址
const base_url = 'http://172.16.136.57:8083/weChatApi';

/**
 * 对请求 options 进行统一处理
 * @param options
 * @returns {{url: string}}
 */
function getOptions(options) {
    const app = getApp();
    const {url, header = {}, data} = options;
    if (!header['SXF-TOKEN']) header['SXF-TOKEN'] = app.globalData.token;

    const params = {};
    if (data) {
        Object.keys(data).forEach(key => {
            const value = data[key];
            if (value !== void 0) {
                params[key] = value;
            }
        });
    }
    return {
        ...options,
        header,
        data: params,
        url: base_url + url,
    }
}

module.exports = {
    login: (options) => {
        const url = '/weChat/login';
        const {code, deskNo, storeId} = options;
        const data = {code, deskNo, storeId};

        return new Promise((resolve, reject) => {
            wx.showLoading({title: '加载中', mask: true});
            wx.request(getOptions({
                method: 'POST',
                data,
                url,
                success: (res) => {
                    resolve(res);
                },
                fail: (error) => {
                    reject(error);
                },
                complete: () => {
                    wx.hideLoading();
                },
            }))
        });

    },
    getDishes: () => {
        const url = '/weChat/homePage/query';

        return new Promise((resolve, reject) => {
            wx.showLoading({title: '加载中', mask: true});
            wx.request(getOptions({
                url,
                success: (res) => {
                    resolve(res);
                },
                fail: (error) => {
                    wx.showToast({
                        title: '获取菜品失败',
                        icon: 'none',
                    });
                    reject(error);
                },
                complete: () => {
                    wx.hideLoading();
                },
            }))
        });
    },
    getHistoryOrders: (params) => {
        const url = '/weChat/queryOrderByCustomer';
        const data = {
            beginDate: params.beginDate,
            endDate: params.endDate,
            status: params.status,
        };

        return new Promise((resolve, reject) => {
            wx.showLoading({title: '加载中', mask: true});
            wx.request(getOptions({
                method: 'POST',
                data,
                url,
                success: (res) => {
                    resolve(res);
                },
                fail: (error) => {
                    wx.showToast({
                        title: '获取订单失败',
                        icon: 'none',
                    });
                    reject(error);
                },
                complete: () => {
                    wx.hideLoading();
                },
            }))
        });
    },
    getOrderStatus: (options) => wx.request(getOptions(options)),
};
