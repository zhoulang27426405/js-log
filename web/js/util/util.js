/**
 * Created by jinguangguo on 2014/11/19.
 */

app.factory('util', function ($http) {
    var util = {
        parseToDate: function(time) {
            var date = new Date(time * 1000);
            var year = date.getYear() + 1900;
            var month = date.getMonth() + 1;
            var day = date.getDate();
            return year
                + "-" + (String(month).length < 2 ? "0" + month : month)
                + "-" + (String(day).length < 2 ? "0" + day : day);
        },
        parseToTime: function(year, month, day) {
            var dateTime = new Date(year, month - 1, day);
            return Math.floor(dateTime / 1000);
        },
        parseDayToTime: function(days) {
            return days * 24 * 60 * 60 * 1000;
        },
        getRightRangeDay: function(startDay, endDay) {
            if (!startDay) {
                alert('请选择开始时间！');
            } else {
                if (endDay) {
                    if (startDay > endDay) {
                        alert('开始时间要小于结束时间哦！');
                        return;
                    }
                } else {
                    var yestoday = new Date().getTime() - this.parseDayToTime(1);
                    yestoday = this.parseToDate(Math.floor(yestoday / 1000));
                    if (startDay > yestoday) {
                        alert('开始时间要小于昨天时间哦！');
                        return;
                    }
                    endDay = yestoday;
                }
            }
            return {
                startDay: startDay,
                endDay: endDay
            };
        }
    };
    window.parseToTime = util.parseToTime;
    window.parseToDate = util.parseToDate;
    return util;
});
