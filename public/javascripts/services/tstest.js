var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var c = (function () {
    function c(f) {
        this.f = f;
        this.f1 = f;
        this.p1 = f * f;
    }
    return c;
})();
;
var c2 = (function (_super) {
    __extends(c2, _super);
    function c2(f, f2) {
        _super.call(this, f);
        this.f = f;
        this.f2 = f2;
        this.p3 = f2;
    }
    return c2;
})(c);
;
var x = new c2(4, 5);
console.log(x.p1);
console.log(x.p3);
//# sourceMappingURL=tstest.js.map