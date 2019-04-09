const base_url = 'https://ordering.httpshop.com/wxapi';

// const base_url = 'http://172.16.42.96:8090';

function request(options) {
    const app = getApp();
    const {
        url,
        header = {},
        data,
        loading = {title: '加载中', mask: true},
        ...others
    } = options;
    if (!header['SXF-TOKEN']) header['SXF-TOKEN'] = app.globalData.token || '';

    let params = {};
    if (data && !Array.isArray(data)) {
        Object.keys(data).forEach(key => {
            const value = data[key];
            if (value !== void 0) {
                params[key] = value;
            }
        });
    } else {
        params = data;
    }

    const opts = {
        url: base_url + url,
        header,
        data: params,
        ...others
    };

    return new Promise((resolve, reject) => {
        wx.showLoading(loading);

        wx.request({
            ...opts,
            success: (res) => {
                if (res.statusCode !== 200) {
                    reject(res);
                } else {
                    resolve(res);
                }
            },
            fail: (error) => {
                reject(error);
            },
            complete: () => {
                wx.hideLoading();
            },
        });
    });

}

module.exports = {
    login: (options) => {
        const url = '/weChat/login';
        const {code, deskNo, storeId} = options;
        const data = {code, deskNo, storeId};

        return request({
            url,
            method: 'POST',
            data,
        });
    },
    getDishes: () => {
        const url = '/weChat/homePage/query';
        return request({
            url,
        }).catch(() => {
            wx.showToast({
                title: '获取菜品失败',
                icon: 'none',
            });
        });
    },
    getHistoryOrders: (params) => {
        const url = '/weChat/queryOrderByCustomer';
        const data = {
            beginDate: params.beginDate,
            endDate: params.endDate,
            status: params.status,
        };

        return request({
            method: 'POST',
            data,
            url,
        }).catch(() => {
            wx.showToast({
                title: '获取订单失败',
                icon: 'none',
            });
        });
    },
    getHistoryOrderDetail: (params) => {
        const url = '/weChat/queryOrderDetails';
        const data = {orderId: params.id};

        return request({
            data,
            url,
        }).catch(() => {
            wx.showToast({
                title: '获取订单详情失败',
                icon: 'none',
            });
        });
    },
    submitOrder: (params) => {
        const url = '/weChat/pay';
        const data = params;
        return request({
            method: 'POST',
            data,
            url,
        }).catch(() => {
            wx.showToast({
                title: '下单失败',
                icon: 'none',
            });
        });
    },
    getOrderStatus: (options) => request(options),
};
