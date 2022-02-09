
// 組み合わせ数nCr
function cmb(n, r) {
    r = Math.min(n - r, r);
    if(r === 0) return 1;
    let fact = (now, end, ret) => (now === end) ? now * ret : fact(now - BigInt(1), end, now * ret);
    const over = fact(BigInt(n), BigInt(n - r + 1), BigInt(1));
    const under = fact(BigInt(r), BigInt(1), BigInt(1));
    return over / under;
}
/*
console.log(cmb(2, 2));
console.log(cmb(5, 3));
console.log(cmb(6, 2));
console.log(cmb(100, 30));
*/


// 同様に確からしいk種類が景品のガチャを、ni回引いた時、ki種類が揃ってる確率kindArr[ni][ki]
function getKindProbArray(n, k) {
    // 初期化
    let kindArr = new Array(n+1);
    for(let i = 0; i <= n; i++) kindArr[i] = new Array(k+1).fill(0);
    // i回引いて1種類揃う（つまり全部被る）確率は(1/k)^(i-1)
    for(let i = 1; i <= n; i++) kindArr[i][1] = (1/k) ** (i-1);
    // 1回引いて2種類以上揃う確率は0（既に0で初期化しているのでOK）

    // i回引いてj種類揃っている確率を漸化的に求める
    for (let i = 1; i <= n; i++) {
        for (let j = 2; j <= k; j++) {
           // 直前（i-1回目）でj-1種類揃っていて、 今回被らず引く
           const case1 = kindArr[i-1][j-1] * (k - j + 1) / k;
           // 直前（i-1回目）でj種類揃っていて、今回被る
           const case2 = kindArr[i-1][j] * j / k;
           // case1とcase2の和が、今回（i回目）でj種類揃っている確率
           kindArr[i][j] = case1 + case2;
        }
    }
    return kindArr;
}
// console.log(getKindProbArray(10, 5));


// 確率pで当たるガチャをn回引いた時に、当たりがm回出る確率winArr[m]
function getWinProbArray(n, p) {
    let winArr = new Array(n+1);
    for (let i = 0; i <= n; i++) {
        winArr[i] = Number(cmb(n, i)) * (p ** i) * ((1-p) ** (n-i));
    }
    return winArr;
}
/*
console.log(getWinProbArray(10, 0.1));
console.log(getWinProbArray(10, 0.5));
console.log(getWinProbArray(10, 0.9));
console.log(getWinProbArray(10, 1));
console.log(getWinProbArray(1000, 0.01));
*/

// 確率pで当たりが出る、k種類の当たりがあるガチャを、n回引いた時のコンプ率
function getCompProb(n, k, p) {
    // 当たりがi個出る確率の配列
    const winArr = getWinProbArray(n, p);
    // ni-1回引いた時にkj-1種類が揃う確率の二次元配列
    const kindArr = getKindProbArray(n, k);
    
    // n回中i回当たりを引いて、かつその回数でコンプリートする確率
    let ans = 0;
    for(let i = 0; i <= n; i++) ans += winArr[i] * kindArr[i][k];
    return ans;
}


// 例えばA賞が1.2%で2種類, B賞が8%で2種類、C賞が20%で9種類、D賞が15%で5種類、E賞が55%で10種類のガチャがあるとする
// それを60～300回引いた時のコンプ率を20回刻みで示す
/*
for(let i = 260; i <= 300; i+=20) {
    console.log(`${i}回引いてA賞コンプ：${getCompProb(i, 2, 0.012)}`);
    console.log(`${i}回引いてB賞コンプ：${getCompProb(i, 2, 0.08)}`);
    console.log(`${i}回引いてC賞コンプ：${getCompProb(i, 9, 0.2)}`);
    console.log(`${i}回引いてD賞コンプ：${getCompProb(i, 5, 0.15)}`);
    console.log(`${i}回引いてE賞コンプ：${getCompProb(i, 10, 0.55)}`);
}
*/


// 確率pで当たるガチャをn回引いて少なくとも1回引ける確率
function getOneProb(n, p) {
    // 単に余事象
    return 1 - ((1 - p) ** n);
}

// 小数点3桁でパーセント表記
function deci2perc(num) {
    return (num * 100).toFixed(2) + "%";
}
// こっちは3桁にしてる
// 未使用になった
function deci2percWithOutParcent(num) {
    return (num * 100).toFixed(2);
}


const SSR_KIND = 1;
const SR_KIND = 1;
const A_KIND = 2;
const B_KIND = 3;
const C_KIND = 5;
const D_KIND = 8;
const E_KIND = 10;

const SSR_NORM_PROB = 0.002;
const SR_NORM_PROB = 0.002;
const A_NORM_PROB = 0.011;
const B_NORM_PROB = 0.04;
const C_NORM_PROB = 0.195;
const D_NORM_PROB = 0.195;
const E_NORM_PROB = 0.555;

const SSR_POS_PROB = 0.0025;
const SR_POS_PROB = 0.0025;
const A_POS_PROB = 0.012;
const B_POS_PROB = 0.04;
const C_POS_PROB = 0.2;
const D_POS_PROB = 0.2;
const E_POS_PROB = 0.543;

const SSR_NEG_PROB = 0.0015;
const SR_NEG_PROB = 0.0015;
const A_NEG_PROB = 0.01;
const B_NEG_PROB = 0.037;
const C_NEG_PROB = 0.2;
const D_NEG_PROB = 0.2;
const E_NEG_PROB = 0.55;


let sampleSize = 1;
let ssrStatProb = 0;
let srStatProb = 0;
let aStatProb = 0;
let bStatProb = 0;
let cStatProb = 0;
let dStatProb = 0;
let eStatProb = 1.00;

// 統計値の計算
function calcStat() {
    // ここを手動で更新する
    const SSR_NUM = 0;
    const SR_NUM = 0;
    const A_NUM = 0;
    const B_NUM = 0;
    const C_NUM = 0;
    const D_NUM = 0;
    const E_NUM = 1;

    sampleSize = SSR_NUM + SR_NUM + A_NUM + B_NUM + C_NUM + D_NUM + E_NUM;
    ssrStatProb = SSR_NUM / sampleSize;
    srStatProb = SR_NUM / sampleSize;
    aStatProb = A_NUM / sampleSize;
    bStatProb = B_NUM / sampleSize;
    cStatProb = C_NUM / sampleSize;
    dStatProb = D_NUM / sampleSize;
    eStatProb = E_NUM / sampleSize;
}


// 提供率の表示
function showdistribution(ssrProb, srProb, aProb, bProb, cProb, dProb, eProb) {
    document.querySelector("#ssr td:nth-child(3) span").textContent = deci2perc(ssrProb);
    document.querySelector("#sr td:nth-child(3) span").textContent = deci2perc(srProb);
    document.querySelector("#a td:nth-child(3) span").textContent = deci2perc(aProb);
    document.querySelector("#b td:nth-child(3) span").textContent = deci2perc(bProb);
    document.querySelector("#c td:nth-child(3) span").textContent = deci2perc(cProb);
    document.querySelector("#d td:nth-child(3) span").textContent = deci2perc(dProb);
    document.querySelector("#e td:nth-child(3) span").textContent = deci2perc(eProb);
}
function changeDistribution(mode) {
    if (mode === "normal") showdistribution(SSR_NORM_PROB, SR_NORM_PROB, A_NORM_PROB, B_NORM_PROB, C_NORM_PROB, D_NORM_PROB, E_NORM_PROB);
    if (mode === "positive")  showdistribution(SSR_POS_PROB, SR_POS_PROB, A_POS_PROB, B_POS_PROB, C_POS_PROB, D_POS_PROB, E_POS_PROB);
    if (mode === "negative")  showdistribution(SSR_NEG_PROB, SR_NEG_PROB, A_NEG_PROB, B_NEG_PROB, C_NEG_PROB, D_NEG_PROB, E_NEG_PROB);
    if (mode === "static") showdistribution(ssrStatProb, srStatProb, aStatProb, bStatProb, cStatProb, dStatProb, eStatProb);
}

// コンプ率を計算し表示
function calcShowComp(num, ssrProb, srProb, aProb, bProb, cProb, dProb, eProb) {
    document.querySelector("#ssr td:nth-child(4)").textContent = deci2perc(getCompProb(num, SSR_KIND, ssrProb));
    document.querySelector("#sr td:nth-child(4)").textContent = deci2perc(getCompProb(num, SR_KIND, srProb));
    document.querySelector("#a td:nth-child(4)").textContent = deci2perc(getCompProb(num, A_KIND, aProb));
    document.querySelector("#b td:nth-child(4)").textContent = deci2perc(getCompProb(num, B_KIND, bProb));
    document.querySelector("#c td:nth-child(4)").textContent = deci2perc(getCompProb(num, C_KIND, cProb));
    document.querySelector("#d td:nth-child(4)").textContent = deci2perc(getCompProb(num, D_KIND, dProb));
    document.querySelector("#e td:nth-child(4)").textContent = deci2perc(getCompProb(num, E_KIND, eProb));
}
function changeComp(num, mode) {
    if (mode === "normal") calcShowComp(num, SSR_NORM_PROB, SR_NORM_PROB, A_NORM_PROB, B_NORM_PROB, C_NORM_PROB, D_NORM_PROB, E_NORM_PROB);
    if (mode === "positive")  calcShowComp(num, SSR_POS_PROB, SR_POS_PROB, A_POS_PROB, B_POS_PROB, C_POS_PROB, D_POS_PROB, E_POS_PROB);
    if (mode === "negative")  calcShowComp(num, SSR_NEG_PROB, SR_NEG_PROB, A_NEG_PROB, B_NEG_PROB, C_NEG_PROB, D_NEG_PROB, E_NEG_PROB);
    if (mode === "static") calcShowComp(num, ssrStatProb, srStatProb, aStatProb, bStatProb, cStatProb, dStatProb, eStatProb);
}


// 1個以上出る率を計算し表示
function calcShowOne(num, ssrProb, srProb, aProb, bProb, cProb, dProb, eProb) {
    document.querySelector("#ssr td:nth-child(5)").textContent = deci2perc(getOneProb(num, ssrProb));
    document.querySelector("#sr td:nth-child(5)").textContent = deci2perc(getOneProb(num, srProb));
    document.querySelector("#a td:nth-child(5)").textContent = deci2perc(getOneProb(num, aProb));
    document.querySelector("#b td:nth-child(5)").textContent = deci2perc(getOneProb(num, bProb));
    document.querySelector("#c td:nth-child(5)").textContent = deci2perc(getOneProb(num, cProb));
    document.querySelector("#d td:nth-child(5)").textContent = deci2perc(getOneProb(num, dProb));
    document.querySelector("#e td:nth-child(5)").textContent = deci2perc(getOneProb(num, eProb));
}
function changeOne(num, mode) {
    if (mode === "normal") calcShowOne(num, SSR_NORM_PROB, SR_NORM_PROB, A_NORM_PROB, B_NORM_PROB, C_NORM_PROB, D_NORM_PROB, E_NORM_PROB);
    if (mode === "positive")  calcShowOne(num, SSR_POS_PROB, SR_POS_PROB, A_POS_PROB, B_POS_PROB, C_POS_PROB, D_POS_PROB, E_POS_PROB);
    if (mode === "negative")  calcShowOne(num, SSR_NEG_PROB, SR_NEG_PROB, A_NEG_PROB, B_NEG_PROB, C_NEG_PROB, D_NEG_PROB, E_NEG_PROB);
    if (mode === "static") calcShowOne(num, ssrStatProb, srStatProb, aStatProb, bStatProb, cStatProb, dStatProb, eStatProb);
}

// マニュアルモード用
function makeInputForm() {
    let inputForm = document.createElement("input");
    inputForm.type = "text";
    inputForm.className="form-control form-control-sm";
    return inputForm;
}


// 計算ボタン押下時の挙動
function calcAndShow(num, mode) {
    document.getElementById("warning").textContent = "";

    if(mode !== "manual") {
        changeComp(num, mode);
        changeOne(num, mode);
    } else {
        const ssrRate = parseFloat(document.querySelector("#ssr td:nth-child(3) input").value) || 0;
        const srRate = parseFloat(document.querySelector("#sr td:nth-child(3) input").value) || 0;
        const aRate = parseFloat(document.querySelector("#a td:nth-child(3) input").value) || 0;
        const bRate = parseFloat(document.querySelector("#b td:nth-child(3) input").value) || 0;
        const cRate = parseFloat(document.querySelector("#c td:nth-child(3) input").value) || 0;
        const dRate = parseFloat(document.querySelector("#d td:nth-child(3) input").value) || 0;
        const eRate = parseFloat(document.querySelector("#e td:nth-child(3) input").value) || 0;

        const sum = ssrRate + srRate + aRate + bRate + cRate + dRate + eRate;
        if(sum < 99 || 101 < sum) {
            document.getElementById("warning").textContent = `確率の合計は100%になるようにしてください（現在：${sum}%）`;
        }

        calcShowComp(num, ssrRate / 100, srRate / 100, aRate / 100, bRate / 100, cRate / 100, dRate / 100, eRate / 100);
        calcShowOne(num, ssrRate / 100, srRate / 100, aRate / 100, bRate / 100, cRate / 100, dRate / 100, eRate / 100);
    }
}






window.onload = function() {
    const button = document.getElementById("exec");
    const probSelect = document.getElementById("prob_select");
    // 実測値を更新しておく
    calcStat();

    // 初期設定
    document.querySelector("#ssr td:nth-child(2)").textContent = SSR_KIND;
    document.querySelector("#sr td:nth-child(2)").textContent = SR_KIND;
    document.querySelector("#a td:nth-child(2)").textContent = A_KIND;
    document.querySelector("#b td:nth-child(2)").textContent = B_KIND;
    document.querySelector("#c td:nth-child(2)").textContent = C_KIND;
    document.querySelector("#d td:nth-child(2)").textContent = D_KIND;
    document.querySelector("#e td:nth-child(2)").textContent = E_KIND;
    changeDistribution("normal")

    // 計算ボタン押下時
    button.addEventListener('click', () => {
        const num = document.getElementById("num").value;
        const mode = probSelect.value;
        calcAndShow(num, mode);
    });

    // 提供割合のモード切り替え時
    probSelect.addEventListener('change', () => {
        const mode = probSelect.value;
        
        if (mode === "static") {
            document.getElementById("size").textContent = "（N = " + sampleSize  + "）";
        } else {
            document.getElementById("size").textContent = "";
        }

        if(mode === "manual") {
            document.querySelector("#ssr td:nth-child(3) span").textContent = "";
            document.querySelector("#sr td:nth-child(3) span").textContent = "";
            document.querySelector("#a td:nth-child(3) span").textContent = "";
            document.querySelector("#b td:nth-child(3) span").textContent = "";
            document.querySelector("#c td:nth-child(3) span").textContent = "";
            document.querySelector("#d td:nth-child(3) span").textContent = "";
            document.querySelector("#e td:nth-child(3) span").textContent = "";
            document.querySelector("#ssr td:nth-child(3) span").appendChild(makeInputForm());
            document.querySelector("#sr td:nth-child(3) span").appendChild(makeInputForm());
            document.querySelector("#a td:nth-child(3) span").appendChild(makeInputForm());
            document.querySelector("#b td:nth-child(3) span").appendChild(makeInputForm());
            document.querySelector("#c td:nth-child(3) span").appendChild(makeInputForm());
            document.querySelector("#d td:nth-child(3) span").appendChild(makeInputForm());
            document.querySelector("#e td:nth-child(3) span").appendChild(makeInputForm());
            document.querySelectorAll(".percent").forEach(node => node.textContent = "%");
        } else {
            document.querySelectorAll(".percent").forEach(node => node.textContent = "");
            changeDistribution(mode);
        }

        // 数値の更新
        const num = document.getElementById("num").value;
        if (num !== "" && mode !== "manual") {
            calcAndShow(num, mode);
        }
        if (mode === "manual") {
            document.querySelector("#ssr td:nth-child(4)").textContent = "";
            document.querySelector("#sr td:nth-child(4)").textContent = "";
            document.querySelector("#a td:nth-child(4)").textContent = "";
            document.querySelector("#b td:nth-child(4)").textContent = "";
            document.querySelector("#c td:nth-child(4)").textContent = "";
            document.querySelector("#d td:nth-child(4)").textContent = "";
            document.querySelector("#e td:nth-child(4)").textContent = "";
            document.querySelector("#ssr td:nth-child(5)").textContent = "";
            document.querySelector("#sr td:nth-child(5)").textContent = "";
            document.querySelector("#a td:nth-child(5)").textContent = "";
            document.querySelector("#b td:nth-child(5)").textContent = "";
            document.querySelector("#c td:nth-child(5)").textContent = "";
            document.querySelector("#d td:nth-child(5)").textContent = "";
            document.querySelector("#e td:nth-child(5)").textContent = "";
        }
    });




}
