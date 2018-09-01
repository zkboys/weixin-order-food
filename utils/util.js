const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
};

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
};


/**
 * 将数值四舍五入后格式化成金额形式
 *
 * @param num 数值(Number或者String)
 * @param options 可选参数
 * @param options.prefix 金钱前缀，默认为空，一般为 ￥ 或 $
 * @param options.decimalNum 保留小数点个数，默认为2 一般为 0 1 2
 * @param options.splitSymbol 格式化分割符，默认为英文逗号，分隔符必须是单字符
 * @return 金额格式的字符串,如'￥1,234,567.45'
 * @type String
 */
function formatCurrency(num, options = {}) {
    let {decimalNum, splitSymbol} = options;
    const {prefix = '￥'} = options;
    let centsPercent = 100;
    if (splitSymbol === undefined) splitSymbol = ',';
    if (decimalNum !== 0 && decimalNum !== 1 && decimalNum !== 2) decimalNum = 2;
    if (decimalNum === 0) centsPercent = 1;
    if (decimalNum === 1) centsPercent = 10;
    num = num.toString().replace(/\$|,/g, '');
    if (isNaN(num)) num = '0';
    const sign = (num === Math.abs(num).toString()) ? '' : '-';
    num = Math.abs(num);
    num = Math.floor((num * centsPercent) + 0.50000000001);
    let cents = num % centsPercent;
    num = Math.floor(num / centsPercent).toString();
    if (cents < 10 && decimalNum === 2) {
        cents = `0${cents}`;
    }
    for (let i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
        const endPosition = (4 * i) + 3;
        num = num.substring(0, num.length - endPosition)
            + splitSymbol + num.substring(num.length - endPosition);
    }
    if (decimalNum === 0) {
        return prefix + sign + num;
    }
    return `${prefix}${sign}${num}.${cents}`;
}

function parseQueryString(str) {
    const kvs = str.split('&');
    const obj = {};
    if (kvs && kvs.length) {
        kvs.forEach(kv => {
            const keyValue = kv.split('=');
            let key;
            let value;
            if (keyValue && keyValue.length === 1) {
                key = keyValue[0];
            }

            if (keyValue && keyValue.length === 2) {
                key = keyValue[0];
                value = keyValue[1];
            }

            if (key) {
                obj[key] = value;
            }
        });
    }
    return obj;
}

module.exports = {
    formatTime: formatTime,
    formatCurrency: formatCurrency,
    parseQueryString: parseQueryString,
};
