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

// TODO
const base_url = 'https://www.baidu.com';

/**
 * 对请求 options 进行统一处理
 * @param options
 * @returns {{url: string}}
 */
function getOptions(options) {
    const {url, header = {}} = options;
    if (!header.token) header.token = app.globalData.token;
    return {
        ...options,
        url: base_url + url,
    }
}

module.exports = {
    getDishes: () => {
        const url = ''; // TODO 接口地址

        return new Promise((resolve, reject) => {
            wx.request(getOptions({
                url,
                success: (res) => {
                    resolve(res);
                },
                fail: (error) => {
                    reject(error);
                }
            }))
        });
    },
    getOrderStatus: (options) => wx.request(getOptions(options)),
};
