const app = getApp();

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
    getOrderStatus: (options) => wx.request(getOptions(options)),
};
