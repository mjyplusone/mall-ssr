export function formatPrice (price) {
    if (isNaN(parseFloat(price))) return;
    var num = parseFloat(price).toFixed(2) + '';
    var integer = num.split('.')[0].split('').reverse();
    var decimal = num.split('.')[1];

    var result = '';

    for (let i = 0; i < integer.length; i++) {
        if ((i + 1) % 3 === 0 && (i + 1) !== integer.length) {
            result += integer[i] + ',';
        } else {
            result += integer[i];
        }
    }

    return result.split('').reverse().join('') + '.' + decimal;
}

export function formatDate (date, fmt) {
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    let o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
    };
    for (let k in o) {
        if (new RegExp(`(${k})`).test(fmt)) {
            let str = o[k] + '';
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str));
        }
    }
    return fmt;
}

function padLeftZero (str) {
    return ('00' + str).substr(str.length);
}