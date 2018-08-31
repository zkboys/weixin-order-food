// 购物车
let dataSource = wx.getStorageSync('cart') || [];

// 同步本地存储
function syncStorage() {
    wx.setStorage({
        key: 'cart',
        data: dataSource,
    })
}

module.exports = {
    getDataSource: function () {
        return dataSource;
    },

    add: function (data) {
        const existData = dataSource.find(item => item.id === data.id);

        if (existData) {
            existData.count = existData.count + 1;
        } else {
            data.count = 1;
            dataSource.push(data);
        }

        syncStorage();
    },

    remove: function (data) {
        const existData = dataSource.find(item => item.id === data.id);

        if (existData && existData.count > 1) {
            existData.count = existData.count - 1;
        } else {
            dataSource = dataSource.filter(item => item.id !== data.id);
        }

        syncStorage();
    },

    clear: function () {
        dataSource = [];

        syncStorage();
    },

    getTotalCount: function () {
        let count = 0;

        dataSource.forEach(item => {
            count = count + item.count;
        });

        return count;
    },

    getTotalPrice: function () {
        let price = 0;

        dataSource.forEach(item => {
            price = price + (item.price * 100 * item.count) / 100;
        });

        return price;
    },
};
