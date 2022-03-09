#include <bits/stdc++.h>
using namespace std;

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
  vector<pair<string, int>> itemUserPL;
  int userNum;

  /* input */
  // ファイル末尾まで受取り、「あるアイテムと引いたユーザーの組のリスト」として保持
  while (!cin.eof()) {
    int u;
    string s;
    cin >> u >> s;
    itemUserPL.emplace_back(s, u);
  }
  // あとでユーザーの数を使う
  userNum = itemUserPL[itemUserPL.size() - 1].second;

  /* アイテムの数だけ「そのアイテムを引いたユーザーの集合」を作成 */
  map<string, set<int>> itemUserMap;
  set<int> users;
  // 文字列の昇順でソート
  sort(itemUserPL.begin(), itemUserPL.end());
  // 番兵
  itemUserPL.emplace_back("", -1);
  // i = 0
  users.insert(itemUserPL[0].second);
  for (int i = 1; i < itemUserPL.size(); i++) {
    if (itemUserPL[i - 1].first == itemUserPL[i].first) {
      // 今の集合に追加
      users.insert(itemUserPL[i].second);
    } else {
      // 1つ前までをマップに追加して集合をリセット
      itemUserMap[itemUserPL[i - 1].first] = users;
      users.clear();
      users.insert(itemUserPL[i].second);
    }
  }

  /* // for debug
  for (auto dict : itemUserMap) {
    cout << "商品：" << dict.first << endl;
    for (auto users : dict.second) {
      cout << users << ", ";
    }
    cout << endl;
  }
  */

  /* 同じガチャのUFTを作る */
  // 初期化
  DisjointSet unionFindTree(itemUserMap.size());

  // 「同じユーザーが引いたガチャは同じガチャ」という条件で木を合成
  for (int i = 1; i <= userNum; i++) {
    int lastInclude = -1;
    int j = 0;
    for (auto itemUsers : itemUserMap) {
      if (itemUsers.second.find(i) != itemUsers.second.end()) {
        if (lastInclude != -1) {
          // 2つのアイテムを同じユーザーが引いていれば、その2つのアイテムは同じガチャ
          unionFindTree.unite(lastInclude, j);
        }
        lastInclude = j;
      }
      j++;
    }
  }

  /* 出力 */
  //ガチャごとのアイテムのリストに整理
  map<int, vector<string>> gachaItemMap;
  int i = 0;
  for (auto itemUsers : itemUserMap) {
    gachaItemMap[unionFindTree.p[i]].push_back(itemUsers.first);
    i++;
  }

  // ガチャIDを連番に振り直しながら標準出力する
  int gachaID = 1;
  for (auto gacha : gachaItemMap) {
    for (auto item : gacha.second) {
      // cout << "ガチャID：" << gachaID << " アイテムID：" << item << endl;
      cout << gachaID << " " << item << endl;
    }
    gachaID++;
  }

  /* 出力 */
  /*
  int i = 0;
  for (auto itemUsers : itemUserMap) {
    cout << "ガチャID：" << unionFindTree.p[i] << " アイテムID："
         << itemUsers.first << endl;
    i++;
  }
  */

  return 0;
}