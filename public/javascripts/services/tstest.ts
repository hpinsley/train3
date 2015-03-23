class c {
    private f1: number
    public p1: number

    constructor(public f: number) {
        this.f1 = f
        this.p1 = f * f
    }
};

class c2 extends  c {
    constructor(public f:number, public f2:number) {
        super(f);
        this.p3 = f2;
    }

    public p3: number
};

var x = new c2(4,5);
console.log(x.p1);
console.log(x.p3);


