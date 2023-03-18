export const getSignificantDigits = (num) => {
    num = Number(num);
    if (num >= 0.01) {
        num = num.toFixed(2);
    } else if (num >= 0.0001) {
        num = num.toFixed(4);
    } else if (num >= 0.00001) {
        num = num.toFixed(5);
    } else {
        num = num.toFixed(6);
    }
    return num;
};
