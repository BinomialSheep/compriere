
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

// 小数点2桁でパーセント表記
function deci2perc(num) {
    return (num * 100).toFixed(1) + "%";
}


const SSR_KIND = 1;
const SR_KIND = 1;
const A_KIND = 2;
const B_KIND = 3;
const C_KIND = 5;
const D_KIND = 8;
const E_KIND = 10;
const SSR_PROB = 0.002;
const SR_PROB = 0.006;
const A_PROB = 0.012;
const B_PROB = 0.08;
const C_PROB = 0.15;
const D_PROB = 0.2;
const E_PROB = 0.55;

window.onload = function() {
    const button = document.getElementById("exec");
    document.querySelector("#ssr td:nth-child(2)").textContent = SSR_KIND;
    document.querySelector("#ssr td:nth-child(3)").textContent = deci2perc(SSR_PROB);
    document.querySelector("#sr td:nth-child(2)").textContent = SR_KIND;
    document.querySelector("#sr td:nth-child(3)").textContent = deci2perc(SR_PROB);
    document.querySelector("#a td:nth-child(2)").textContent = A_KIND;
    document.querySelector("#a td:nth-child(3)").textContent = deci2perc(A_PROB);
    document.querySelector("#b td:nth-child(2)").textContent = B_KIND;
    document.querySelector("#b td:nth-child(3)").textContent = deci2perc(B_PROB);
    document.querySelector("#c td:nth-child(2)").textContent = C_KIND;
    document.querySelector("#c td:nth-child(3)").textContent = deci2perc(C_PROB);
    document.querySelector("#d td:nth-child(2)").textContent = D_KIND;
    document.querySelector("#d td:nth-child(3)").textContent = deci2perc(D_PROB);
    document.querySelector("#e td:nth-child(2)").textContent = E_KIND;
    document.querySelector("#e td:nth-child(3)").textContent = deci2perc(E_PROB);

    button.addEventListener('click', () => {
        let num = document.getElementById("num").value;
        console.log(`${num}回引いてA賞コンプ：${getCompProb(num, 2, 0.012)}`);

        document.querySelector("#ssr td:nth-child(4)").textContent = deci2perc(getCompProb(num, SSR_KIND, SSR_PROB));
        document.querySelector("#sr td:nth-child(4)").textContent = deci2perc(getCompProb(num, SR_KIND, SR_PROB));
        document.querySelector("#a td:nth-child(4)").textContent = deci2perc(getCompProb(num, A_KIND, A_PROB));
        document.querySelector("#b td:nth-child(4)").textContent = deci2perc(getCompProb(num, B_KIND, B_PROB));
        document.querySelector("#c td:nth-child(4)").textContent = deci2perc(getCompProb(num, C_KIND, C_PROB));
        document.querySelector("#d td:nth-child(4)").textContent = deci2perc(getCompProb(num, D_KIND, D_PROB));
        document.querySelector("#e td:nth-child(4)").textContent = deci2perc(getCompProb(num, E_KIND, E_PROB));

        document.querySelector("#ssr td:nth-child(5)").textContent = deci2perc(getOneProb(num,  SSR_PROB));
        document.querySelector("#sr td:nth-child(5)").textContent = deci2perc(getOneProb(num, SR_PROB));
        document.querySelector("#a td:nth-child(5)").textContent = deci2perc(getOneProb(num, A_PROB));
        document.querySelector("#b td:nth-child(5)").textContent = deci2perc(getOneProb(num, B_PROB));
        document.querySelector("#c td:nth-child(5)").textContent = deci2perc(getOneProb(num, C_PROB));
        document.querySelector("#d td:nth-child(5)").textContent = deci2perc(getOneProb(num, D_PROB));
        document.querySelector("#e td:nth-child(5)").textContent = deci2perc(getOneProb(num, E_PROB));
    });
}
