/**
 * Created by jinguangguo on 2014/12/25.
 */
app.factory('clickColorService', function ($http) {
    var COLOR_RED = '#FF0000',      // 红
        COLOR_YELLOW = '#00FF00',    // 黄
        COLOR_GREEN = '#FFFF00',    // 绿
        COLOR_PURPLE = '#8000FF';    // 紫

    var _pub = {
        minVal: 0,
        rangeOne: 0,
        rangeTwo: 0,
        rangeThree: 0,
        maxVal: 0,
        setRange: function(min, max) {
            var part;
            this.minVal = min;
            this.maxVal = max;
            var c = this.c = max - min;
            part = parseFloat((c / 4).toFixed(2));
            this.rangeThree = this.maxVal - part;
            this.rangeTwo = this.rangeThree - part;
            this.rangeOne = this.rangeTwo - part;
            if (c === 1) {
                this.rangeOne = this.rangeTwo = this.rangeThree = min;
                return;
            }
            if (c === 2) {
                this.rangeOne = min;
                return;
            }
        },
        getColorByVal: function(val) {
            if (this.c === 0) {
                return COLOR_RED;
            }
            if (val > this.rangeThree && val <= this.maxVal) {
                return COLOR_RED;
            } else if (val >= this.rangeTwo && val <= this.rangeThree) {
                return COLOR_YELLOW;
            } else if (val >= this.rangeOne && val <= this.rangeTwo) {
                return COLOR_GREEN;
            } else if (val >= this.minVal && val <= this.rangeOne) {
                return COLOR_PURPLE;
            }
        }
    };

    return _pub;
});