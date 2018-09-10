
// 同步本地存储
function syncStorage(dataSource, storeId) {
    wx.setStorage({
        key: storeId + '-cart',
        data: dataSource,
    })
}

module.exports = {
    getDataSource: function () {
        const storeId = wx.getStorageSync('storeId') || '';
        return wx.getStorageSync(storeId + '-cart') || [];
    },

    add: function (data) {
        const storeId = wx.getStorageSync('storeId') || '';
        const dataSource = wx.getStorageSync(storeId + '-cart') || [];
        const existData = dataSource.find(item => item.id === data.id);

        if (existData) {
            existData.count = existData.count + 1;
        } else {
            data.count = 1;
            dataSource.push(data);
        }

        syncStorage(dataSource, storeId);
    },

    remove: function (data) {
        const storeId = wx.getStorageSync('storeId') || '';
        let dataSource = wx.getStorageSync(storeId + '-cart') || [];
        const existData = dataSource.find(item => item.id === data.id);

        if (existData && existData.count > 1) {
            existData.count = existData.count - 1;
        } else {
            dataSource = dataSource.filter(item => item.id !== data.id);
        }

        syncStorage(dataSource, storeId);
    },

    clear: function () {
        const storeId = wx.getStorageSync('storeId') || '';
        let dataSource = [];

        syncStorage(dataSource, storeId);
    },

    getTotalCount: function () {
        const storeId = wx.getStorageSync('storeId') || '';
        const dataSource = wx.getStorageSync(storeId + '-cart') || [];
        let count = 0;

        dataSource.forEach(item => {
            count = count + item.count;
        });

        return count;
    },

    getTotalPrice: function () {
        const storeId = wx.getStorageSync('storeId') || '';
        const dataSource = wx.getStorageSync(storeId + '-cart') || [];
        let price = 0;

        dataSource.forEach(item => {
            price = price + (item.price * 100 * item.count) / 100;
        });

        return price;
    },
};
