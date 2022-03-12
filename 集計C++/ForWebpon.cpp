#include <bits/stdc++.h>
using namespace std;
#define rep(i, n) for (int i = 0; i < (int)(n); i++)

class DisjointSet {
 public:
  // rankは木の高さ（0-origen), pはrootの要素（rootのrootは自分自身）
  vector<int> rank, p;

  DisjointSet() {}
  DisjointSet(int size) {
    // 長さsizeで初期値0の動的配列を作る
    rank.resize(size, 0);
    p.resize(size, 0);
    // 0,..,n-1をそれぞれ唯一の要素とするn個の互いに素な集合を作る
    rep(i, size) makeSet(i);
  }

  void makeSet(int x) {
    p[x] = x;
    rank[x] = 0;
  }

  // 新しく要素数1の木を追加する
  int addSet() {
    int ret = p.size();
    p.push_back(ret);
    rank.push_back(0);
    return ret;
  }

  // 同じ木に所属しているか
  bool same(int x, int y) { return findSet(x) == findSet(y); }
  // xが所属する木とyが所属する木の合成
  void unite(int x, int y) { link(findSet(x), findSet(y)); }
  // 高い方に合成する（rankの更新を減らすため）
  void link(int x, int y) {
    if (x == y) return;
    if (rank[x] > rank[y]) {
      p[y] = x;
    } else {
      p[x] = y;
      if (rank[x] == rank[y]) {
        // 同じ高さ同士の木を合成した場合はインクリメント
        rank[y]++;
      }
    }
  }
  // 再帰的に親を辿ってrootを見つける。この実装では経路圧縮はしない。
  int findSet(int x) {
    if (x != p[x]) {
      p[x] = findSet(p[x]);
    }
    return p[x];
  }
};

int main() {
  auto start = clock();

  /* input */
  // ファイル末尾まで受取り、「ユーザーと引いたアイテムの組のリスト」として保持
  vector<pair<int, string>> inputPairList;
  while (!cin.eof()) {
    int userId;
    string itemId;
    cin >> userId >> itemId;
    inputPairList.emplace_back(userId, itemId);
  }

  // auto end = clock();
  // cout << "読み込み時間" << (double)(end - start) / CLOCKS_PER_SEC << endl;

  /* ガチャごとのアイテムのUTFを作る */
  // 既知のアイテムと、その親番号のmap
  unordered_map<string, int> itemMap;
  // 別タスクとして、あるガチャ（暫定）を最初と最後に引いたユーザーを覚えておく
  unordered_map<int, int> firstUser;
  unordered_map<int, int> finalUser;

  // 初期化
  DisjointSet unionFindTree(0);
  // 直前のアイテムを引いたユーザー
  int lastUser = -1;
  // 直前のアイテムのガチャ
  int lastGacha = -1;
  for (int i = 0; i < inputPairList.size(); i++) {
    int userId = inputPairList[i].first;
    string itemId = inputPairList[i].second;
    //
    int thisGacha;
    if (itemMap.count(itemId) == 0) {
      // 初出のガチャなら新しい木を生成する
      thisGacha = unionFindTree.addSet();
      itemMap[itemId] = thisGacha;
      // 別タスク：最初に引いたユーザとして覚えておく
      firstUser[thisGacha] = userId;
    } else {
      // 既出のガチャならmapから取り出す
      thisGacha = itemMap[itemId];
    }
    // 別タスク：最後に引いたユーザーの更新
    finalUser[thisGacha] = userId;

    // 同じユーザーなら合成
    if (lastUser == userId) {
      unionFindTree.unite(lastGacha, thisGacha);
    }
    // 更新
    lastUser = userId;
    lastGacha = unionFindTree.findSet(thisGacha);
  }

  // ガチャごとのアイテムのリストに整理
  map<int, vector<string>> gachaItemMap;
  for (auto im : itemMap) {
    int gachaId = unionFindTree.findSet(im.second);
    gachaItemMap[gachaId].push_back(im.first);
    // 別タスク：最初と最後に引いたユーザーを更新
    firstUser[gachaId] = min(firstUser[gachaId], firstUser[im.second]);
    finalUser[gachaId] = max(finalUser[gachaId], finalUser[im.second]);
  }

  /* 出力 */
  cout << "ガチャID アイテムID" << endl;
  int gachaId = 1;
  for (auto gacha : gachaItemMap) {
    for (auto item : gacha.second) {
      cout << gachaId << " " << item << endl;
    }
    gachaId++;
  }
  cout << "ガチャID 最初に引いたユーザー 最後に引いたユーザー" << endl;
  gachaId = 1;
  for (auto gacha : gachaItemMap) {
    cout << gachaId << " " << firstUser[gacha.first] << " "
         << finalUser[gacha.first] << endl;
    gachaId++;
  }

  return 0;
}