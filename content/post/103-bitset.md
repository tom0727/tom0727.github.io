+++
title = 'Bitset优化'
date = 2023-03-30T22:13:18-05:00
draft = false
categories = ['算法']
tags = ['bitset', '']
+++

bitset作为C++自带的数据结构，利用bit储存信息，由于 1 byte = 8 bits，并且一个int就有 4 bytes，所以通常情况下用 bitset 可以达到 32 倍的常数优化。

## 优化01背包

### 例1 洛谷P1537 [弹珠](https://www.luogu.com.cn/problem/P1537)

{{% question 题意 %}}

给定价值为 $1,2,3,4,5,6$ 的弹珠，数量分别为 $N_1,N_2,...,N_6$，问是否能将这些弹珠分为两份使得两份的价值和相等。

其中，弹珠数量和 $\leq 2 \times 10^4$。

{{% /question %}}

{{% fold "题解" %}}

多重背包，正解应该是二进制优化成01背包。

但bitset可以直接暴力碾过去。

```cpp
dp[0] = 1;
for (int i = 1; i <= 6; i++) {
    while (a[i]--) {
        dp |= (dp << i);
    }
}
```

{{% /fold %}}


{{% fold "代码" %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
int a[maxn];
bitset<120005> dp;
int main() {
    int t = 0;
    while (cin >> a[1] >> a[2] >> a[3] >> a[4] >> a[5] >> a[6]) {
        if (a[1] == 0 && a[2] == 0 && a[3] == 0 && a[4] == 0 && a[5] == 0 && a[6] == 0) break;
        cout << "Collection #" << ++t << ":\n";
        dp.reset();

        bool ok = 1;
        int sum = 0;
        for (int i = 1; i <= 6; i++) {
            sum += i * a[i];
        }
        if (sum % 2) ok = 0;

        dp[0] = 1;
        for (int i = 1; i <= 6; i++) {
            while (a[i]--) {
                dp |= (dp << i);
            }
        }

        ok = (ok && dp[sum/2]);
        if (ok) cout << "Can be divided.\n\n";
        else cout << "Can't be divided.\n\n";
    }
}
```

{{% /fold %}}


## 优化floyd传递闭包

在 floyd 中我们有 `f[i][j] |= (f[i][k] && f[k][j])` 的方式来传递闭包。

如果用bitset实现呢？

```cpp
bitset<maxn> f[maxn];
for (int i = 1; i <= n; i++) {
    for (int j = 1; j <= n; j++) {
        if (f[j][i]) f[j] |= f[i];
    }
}
```

如果 $j$ 能够到达 $i$，那么 $i$ 所能到达的点，$j$ 也能够到达。

• 如果是一个闭包在一个图上传递，那么就有：

```cpp
struct Mat {
    bitset<maxn> f[maxn];
    Mat operator*(const Mat& other) {
        Mat res;  // 无需初始化！
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= n; j++) {
                if (f[j][i]) res.f[j] |= other.f[i];
            }
        }
        return res;
    }
};
```


### 例1 CF576D. [Flights for Regular Customers](https://codeforces.com/problemset/problem/576/D)

{{% question 题意 %}}

给定一个 $n$ 个点，$m$ 条边的有向无权图。一开始在节点 $1$，需要走到节点 $n$。

当且仅当走过了至少 $d_i$ 条边时，才能使用第 $i$ 条边。

问最少需要走多少条边到达 $n$，或判断无法到达。

其中，$n,m \leq 150, 0 \leq d_i \leq 10^9$。

{{% /question %}}


{{% fold "题解" %}}

首先我们根据 $d_i$ sort所有的边，然后对于每一个 $d_i$，我们要求出 **恰好走了 $d_i$ 步**时，能够**停在**哪些点，然后从这些点开始多源BFS（就是一开始全丢到queue里），求出 `dis[n]`，然后加上 $d_i$ 即可得到这个状态的答案。

那么如何求出 **恰好走了 $d_i$ 步**时，能够停在哪些点？

<hr>


假设我们求出了恰好走了 $d_{i-1}$ 步时，从 $1$ 出发能够停在哪些点。那么我们只要求出在只包含 $1,2,...,i-1$ 这些边的图中，从这些点出发，走 $d_{i} - d_{i-1}$ 步能够停留在哪些点。

那么这就是一个闭包传递的过程了！

但由于 $d_{i} - d_{i-1}$ 可能会很大，所以我们需要快速幂来优化，为什么可以用快速幂？

因为我们知道 floyd 传递闭包是利用了 **矩阵乘法** 的原理。

因为矩阵乘法是 $C_{i,j} = \sum\limits_{k=1}^n A_{i,k}B_{k,j}$，这其实和传递闭包的公式是一样的。

• 矩阵乘法快速幂的原理也可以用于解决 “走过 $k$ 条边的最短路” 的问题。

{{% /fold %}}


{{% fold "代码" %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn = 155;
const int maxm = 1e5+55;

struct Edge {
    int from, to, d;
};
int n, m;
map<int, vector<Edge>> mp;
int dis[maxn];
vector<int> adj[maxn];
ll ans = 2e9;

struct Mat {
    bitset<maxn> f[maxn];
    Mat operator*(const Mat& other) {
        Mat res;
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= n; j++) {
                if (f[j][i]) res.f[j] |= other.f[i];
            }
        }
        return res;
    }
    void setone() {
        for (int i = 1; i <= n; i++) f[i][i] = 1;
    }
};
Mat qpow(Mat a, int b) {
    Mat res;
    res.setone();
    while (b) {
        if (b&1) res = res * a;
        a = a*a;
        b >>= 1;
    }
    return res;
}

Mat cur, g;  // cur代表当前走x步能够恰好从 u 出发停在 v，g代表当前图中恰好走一步能够从u到达v
ll D = 0;
void bfs() {
    queue<int> q;
    fill(dis, dis+maxn, 2e9);
    for (int i = 1; i <= n; i++) {
        if (cur.f[1][i]) q.push(i), dis[i] = 0;  // 多源bfs
    }
    while (q.size()) {
        int u = q.front();
        q.pop();
        for (int v : adj[u]) {
            if (dis[v] > dis[u] + 1) {
                dis[v] = dis[u] + 1;
                q.push(v);
            }
        }
    }
    ans = min(ans, dis[n] + D);
}

int main() {
    cin >> n >> m;
    for (int i = 1; i <= m; i++) {
        int u,v,d; cin >> u >> v >> d;
        mp[d].push_back({u,v,d});
    }
    cur.f[1][1] = 1;  // 初始状态是走0步，所以可以从1出发恰好停在1，但其他的还没到
    // 注意 g 不要设定 g.f[u][u] = 1，因为这里的矩阵代表**恰好**走 $1$ 步。

    for (auto itr : mp) {
        int d = itr.first;
        int step = d - D;
        D = d; 
        cur = cur * qpow(g, step);  // 将 d_i-1 传递给 d_i

        bfs();

        for (Edge e : itr.second) {
            int u = e.from, v = e.to;
            g.f[u][v] = 1;
            adj[u].push_back(v);
        }
    }
    bfs();
    if (ans >= 2e9) cout << "Impossible\n";
    else cout << ans << "\n";
}
```

{{% /fold %}}


## 暴力字符串匹配

利用 bitset 可以 $O(\frac{n^2}{w})$ 求出一个模式串 $t$ 在一个母串 $s$ 中出现的所有位置，在 $n=10^5$ 的时候可以跑过去，尤其在多模式串+带修时很好用。

原理：我们对于每个字符（一般来说是 `a` 到 `z`）都开一个bitset，就有 `bitset<maxn> bs[26]`，其中 `bs[i][j]` 代表字母 $i$ 在母串 $s$ 的位置 $j$ 是否出现了。

比如字符串 `s = "abab"`，那么`a,b` 两个字母对应的两个bitset就是：

`a`：`1010`

`b`：`0101`

现在要求一个模式串 $t$ 在 $s$ 中出现的所有位置，比如 `t = "ab"`。

那么对于每一个模式串 $t$，我们先初始化一个 **全为 $1$** 的bitset叫 `ans`，`ans[i] = 1` 就代表模式串 $t$ 出现在了 $s$ 的位置 $i$ 处，也就是 $s[i...i+|t|-1]=t$。

然后，枚举 $t$ 的每一个字符，对于第 $i$ 个字符 $t_i$，将 $t_i$ 对应的bitset**右移** $(i-1)$ 格后，与 `ans` AND 起来。

```cpp
bitset<maxn> bs[26];  // bs[i][j]: 字母i在位置j是否出现过
bitset<maxn> ans;
int main() {
    cin >> s;
    n = s.size();
    for (int i = 1; i <= n; i++) {
        bs[s[i-1]-'a'][i] = 1;
    }

    string t; cin >> t;
    int m = t.size();
    ans.set();  // 全部设为1
    for (int i = 1; i <= m; i++) {
        ans &= ((bs[t[i-1]-'a'] >> (i-1)));
    }
}
```

然后 `ans` 就是我们所求的了。

为什么是正确的？这本质上是暴力匹配的过程，考虑所有的前缀：

对于 $t_1$ 这个前缀而言，显然只有 $s_i = t_1$ 的位置 $i$ 满足条件，所以 `ans &= bs[t[0] - 'a']`。

对于 $t_1t_2$ 这个前缀而言，只有 $s_i = t_1$ 且 $s_{i+1} = t_2$ 满足条件，所以需要将 $t_2$ 对应的bitset右移一格，然后再AND起来。

后面的同理，直到枚举完整个 $t$。

我们拿 `s = "abab", t = "ab"` 举例：由于有

`a`：`1010`

`b`：`0101`

那么 `b` 对应的bitset**右移一位**后可以得到 `1010`（注意bitset的写法是左右颠倒过来的，所以看起来像左移，但实际上是右移），那么就有：

`ans = ("1111" & "1010" & "1010") = "1010"`，代表 $t$ 在 $s$ 的 $1,3$ 位置都出现了。

<hr>

最后注意，**不要** 在 `ans` 上跑 for-loop，这会导致它的优化直接失效！

一些常见的函数：

```cpp
bitset<maxn> ans;
// 求 ans[l...r] 的和
int getsum(int l, int r) {
    if (l > r) return 0;
    return (ans >> l).count() - (ans >> (r+1)).count();  // (ans>>i).count() = ans[i...n]
}

// 枚举 ans 中所有的 1 (_Find_next(i) 会找 i 后面的下一个 1 的位置，如果没有的话返回 ans.size())
for (int i = ans._Find_first(); i < ans.size(); i = ans._Find_next(i)) {
    pos.push_back(i);
}
```

• 最后提一下：bitset的主要优势在于**带修**，如果只是多模式串匹配的话，可以利用长度和为 $M$ 的模式串的长度种类不超过 $\sqrt M$ 种的特点，直接用以下两种方法之一：

1. 后缀数组（复杂度为 $M \log |S|$），支持在线。

2. 字符串哈希（对于所有模式串哈希，然后从文本串的每个位置开始暴力匹配，只考虑拥有模式串的长度（不超过 $\sqrt M$ 种），即可求出所有模式串在文本串中出现的所有位置），复杂度为 $|S| \sqrt M$，仅支持离线。

### 例1 CF914F. [Substrings in a String](https://codeforces.com/problemset/problem/914/F)

{{% question 题意 %}}

给定一个字符串（仅包含小写字母） $s$，以及 $q$ 次操作，每次操作有两种：

`1 i c`：将 $s_i$ 改为字符 $c$

`2 l r t`：求字符串 $t$ 在 $s[l...r]$ 中，作为子串出现的次数。

其中，$|s| \leq 10^5, q \leq 10^5, \sum |t| \leq 10^5$。

{{% /question %}}


{{% fold "题解" %}}

按照上面说的构造 26 个bitset和一个 `ans` bitset。

对于第一种操作，直接 $O(1)$ 修改。

对于第二种操作，我们求出 $t$ 在 $s$ 中出现的所有位置，然后只要回答 `ans[l...r-|t|+1]` 的和即可。

使用 `(ans>>i).count()` 函数可以求出 `ans[i...n]` 的和。

{{% /fold %}}


{{% fold "代码" %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
bitset<maxn> bs[26];  // bs[i][j]: 字母i在位置j是否出现过
bitset<maxn> ans;
// 求 ans[l...r] 的和
int getsum(int l, int r) {
    if (l > r) return 0;
    return (ans >> l).count() - (ans >> (r+1)).count();  // (ans>>i).count() = ans[i...n]
}

string s;
int n;
int main() {
    fastio;
    cin >> s;
    n = s.size();
    for (int i = 1; i <= n; i++) {
        bs[s[i-1]-'a'][i] = 1;
    }

    int q; cin >> q;
    while (q--) {
        int op;
        cin >> op;
        if (op == 1) {
            int p; char c; cin >> p >> c;
            bs[s[p-1]-'a'][p] = 0;
            s[p-1] = c;
            bs[s[p-1]-'a'][p] = 1;
        } else {
            int l,r; string t; cin >> l >> r >> t;
            int m = t.size();
            ans.set();  // 全部设为1
            for (int i = 1; i <= m; i++) {
                ans &= ((bs[t[i-1]-'a'] >> (i-1)));
            }
            cout << getsum(l, r-m+1) << endl;
        }
    }

}
```

{{% /fold %}}

### 例2 CF963D. [Frequency of String](https://www.luogu.com.cn/problem/CF963D)

{{% question 题意 %}}

给定一个字符串 $s$，有 $q$ 个询问，每次询问给定一个整数 $k_i$ 和一个字符串 $t_i$，回答 $s$ 中最短的子串使得 $t_i$ 在这个子串中出现了至少 $k_i$ 次。

其中，$|s| \leq 10^5, q \leq 10^5, \sum|t_i| \leq 10^5$，$t_i$ 互不相同。

{{% /question %}}

{{% info "性质" %}}

对于互不相同的，长度之和为 $M$ 的一些模式串，在长度为 $n$ 的母串中出现的次数之和不超过 $n\sqrt M$。

证明：考虑长度均为 $L$ 的所有模式串，由于它们互不相同，所以这些模式串出现在 $s$ 内的总次数 $\leq n-L+1$。并且由于 $\sum L \leq M$，意味着互不相同的 $L$ 只有 $\sqrt M$ 种。所以总出现次数不超过 $n \sqrt M$。

{{% /info %}}


{{% fold "题解" %}}

有了以上证明，我们知道这些模式串 $t_i$ 的出现次数之和不超过 $n \sqrt{\sum|t_i|}$，也就是说处理出的 `ans` 数组里最多有 $n \sqrt{\sum|t_i|}$ 个 $1$。

于是对于每一个 $t_i$ 处理出 `ans`，然后利用 `_Find_first()` 函数和 `_Find_next()` 函数暴力枚举所有的 $1$ 的位置即可。

{{% /fold %}}


{{% fold "代码" %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn = 1e5+5;

bitset<maxn> bs[26];  // bs[i][j]: 字母i在位置j是否出现过
bitset<maxn> ans;
string s;
int n;
int main() {
    fastio;
    cin >> s;
    n = s.size();
    for (int i = 1; i <= n; i++) {
        bs[s[i-1]-'a'][i] = 1;
    }

    int q; cin >> q;
    while (q--) {
        int k; string t; cin >> k >> t;
        int m = t.size();
        int res = 1e9;
        ans.set();
        for (int i = 1; i <= m; i++) {
            ans &= ((bs[t[i-1]-'a'] >> (i-1)));
        }
        vector<int> pos;
        for (int i = ans._Find_first(); i < ans.size(); i = ans._Find_next(i)) {
            pos.push_back(i);
        }
        for (int i = k-1; i < pos.size(); i++) {
            res = min(res, pos[i] - pos[i-k+1] + m);
        }
        cout << (res == 1e9 ? -1 : res) << "\n";
    }
}
```

{{% /fold %}}


## 高维偏序

bitset可以用来解决高维偏序问题，高维问题一般如下：

{{% question 题意 %}}

给定 $n$ 个元素，第 $i$ 个元素有 $D$ 个属性 $p_{i,1}, p_{i,2} ... p_{i,D}$。

给定 $Q$ 个询问，每次询问给定一个元素，有 $D$ 个属性 $q_1,q_2,...,q_D$，回答有多少个元素使得每个属性都 $\leq q_i$。

询问强制在线。

{{% /question %}}

一般这种问题可以用 bitset 在 $O(\frac{n^2}{w})$ 的时间内解决。

首先我们把这些元素复制 $D$ 份，分别储存每种元素。然后分别根据这个元素进行 sort，得到 $D$ 个sort后的数组，数组内储存了这个属性的值，和它原来的index。

然后，对于sort后的数组的每个位置 $i$，我们都可以知道它前面有哪些 index，就代表对于这个属性，$\leq$ 这个属性的值的index的集合。

所以我们在询问的时候，对于每一个询问，可以将 $q_i$ 在第 $i$ 个属性的数组中进行二分，找到它的位置，然后求出它前面的集合 index，然后将它们 AND 起来，就可以得到有哪些 index 的所有属性都 $\leq$ 它了。

但由于 $n=10^5$，所以我们不能预处理出每个位置前面的 index 的集合，于是我们使用分块。

对于每一个块，预处理这个块中所有index的集合，然后维护一个数组 `bitset<maxn> f[3][320]`，其中 `f[i][j]` 代表第 $i$ 维度，前 $j$ 个block形成的index的集合bitset。

这样每次查询的时候，只需要 $O(1)$ 找到对应的块，然后再 $O(\sqrt n)$ 的时间把零散的部分加上即可。

总的复杂度就是 $O(Dq(\log n + \sqrt n + \frac{n}{w})) = O(D\frac{qn}{w})$


### 例1 洛谷P3810[【模板】三维偏序（陌上花开）](https://www.luogu.com.cn/problem/P3810)

{{% question 题意 %}}

给定 $n$ 个元素，每个元素有 $a_i,b_i,c_i$ 三个属性，设 $f(i)$ 表示 $a_j \leq a_i, b_j \leq b_i, c_j \leq c_i, i \neq j$ 的数量。

对于 $d \in [0, n-1]$，求 $f(i)=d$ 的数量。

其中，$n \leq 10^5, a_i,b_i,c_i \in [1, 2 \times 10^5]$。

{{% /question %}}


{{% fold "题解" %}}

同上。

{{% /fold %}}


{{% fold "代码" %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn = 1e5+5;

struct Node {
    int val, idx;
    bool operator<(const Node& other) const {
        if (val == other.val) return idx < other.idx;
        return val < other.val;
    }
} a[3][maxn];
bitset<maxn> f[3][320];  // f[i][j]: 第i维度，前j个block形成的bitset
struct Info {
    int val[3];
} ori[maxn];

int res[maxn];
int n, m, B, qval[3];
void solve() {
    cin >> n >> m;
    B = max(50, (int)sqrt(n));
    for (int i = 1; i <= n; i++) {
        for (int j = 0; j < 3; j++) {
            cin >> a[j][i].val;
            ori[i].val[j] = a[j][i].val;
            a[j][i].idx = i;
        }
    }
    for (int j = 0; j < 3; j++) {
        sort(a[j]+1, a[j]+n+1);
        
        int l = 1, r = min(n, l+B-1);
        // [1,B] -> 1, [B+1, 2B] -> 2 ...
        for (l = 1; l <= n; l = r+1) {
            r = min(n, l+B-1);
            int b = (l-1) / B + 1;
            f[j][b] = f[j][b-1];  // 记录前缀bitset
            for (int i = l; i <= r; i++) {
                int idx = a[j][i].idx;
                f[j][b][idx] = 1;
            }
        }
    }

    for (int k = 1; k <= n; k++) {
        for (int j = 0; j < 3; j++) qval[j] = ori[k].val[j];
        bitset<maxn> ans;
        ans.set();
        for (int j = 0; j < 3; j++) {
            int p = upper_bound(a[j]+1, a[j]+n+1, Node{qval[j], 10000000}) - a[j] - 1;
            int b = (p-1) / B + 1;  // 所属的block，所以加上 b-1对应的前缀

            bitset<maxn> S = f[j][b-1];
            // 第 b 个block对应的是 l = (b-1) * B + 1, r = p
            for (int i = (b-1) * B + 1; i <= p; i++) {
                S[a[j][i].idx] = 1;
            }
            ans &= S;
        }

        res[ans.count() - 1]++;
    }

    for (int i = 0; i < n; i++) cout << res[i] << "\n";
}

int main() {
    solve();
}
```

{{% /fold %}}


## bitset结合莫队

在一些题目中，我们需要在一个区间内回答询问，这种询问需要使用bitset，就可以用莫队结合bitset。

### 例1 洛谷P5355 [[Ynoi2017] 由乃的玉米田](https://www.luogu.com.cn/problem/P5355)

{{% question 题意 %}}

给定一个长度为 $n$ 的数组，和 $m$ 个询问。

每次询问为 $op,l,r,x$：

1. op = 1：回答区间 $[l,r]$ 之间是否存在两个数 $a,b$，使得 $a-b=x$。
2. op = 2：回答区间 $[l,r]$ 之间是否存在两个数 $a,b$，使得 $a+b=x$。
3. op = 3：回答区间 $[l,r]$ 之间是否存在两个数 $a,b$，使得 $a*b=x$。
4. op = 4：回答区间 $[l,r]$ 之间是否存在两个数 $a,b$，使得 $a/b=x$（整除，不能有余数）。

在 $[l,r]$ 里选的两个数可以重复。

其中，$n,m \leq 10^5, 1 \leq a_i \leq 10^5$。

{{% /question %}}


{{% fold "题解" %}}

因为数字可以重复选，所以一个区间内我们只关心某个数是否出现过，出现几次不用管。

首先利用莫队离线所有的询问，然后对于每一个区间 $[l,r]$ 我们都可以知道有哪些数字出现在了这个区间内。

对于第一种询问，如果 $a-b = x$，那么 $b=a-x$，这说明只要存在 $a$，使得 $a, a-x$ 同时出现在这个区间内即可。

所以只要维护 `bitset<maxn> f` 表示这个区间出现的数，然后求 `f & (f >> x)` 是否有 $1$ 即可。

对于第二种询问，如果 $a+b = x$，我们希望把 $b$ 的符号反过来，所以我们定义 $N=10^5$（值域的最大值），然后令 $b' = N-b$，有 $a+N-b' = x$，所以得到 $b' = a+N-x$。注意到，$b'$ 对应的 `bitset` 是 $f$ 反过来的版本 $g$，所以我们只要检查 `f & (g>>(N-x))` 是否有 $1$ 即可。

<hr>

第三和第四种询问不再需要 `bitset` 和莫队了。

对于第三种询问，可以直接暴力枚举 $x$ 的所有因数（只有 $\sqrt n$ 个）。

对于第四种询问，不能枚举 $x$ 的倍数了，复杂度太高。

我们可以值域分块来处理 $x$：

1. 当 $x > \sqrt {10^5}$ 时，可以暴力枚举倍数。
2. $x \leq \sqrt {10^5} \approx 315$ 时，可以对于每一个 $x$ 都预处理，如下：

我们可以对于每一个 $x$，都 $O(n)$ 预处理出每个 $i$，$a_i$ 对应的右侧距离它最近的 $a_j$ 使得 $a_j = xa_i$ 或者 $a_j = \frac{a_i}{x}$。我们预处理出来的这个数组叫 `nxt[i]`。

所以每次询问 $[l,r]$ 的时候，只要看 $[l,r]$ 内的最小值是否 $\leq r$ 即可。

于是，使用 ST 表？（然后愉快的T了）。

再仔细观察一下，我们并不需要查询 $[l,r]$ 内的最小值，只需要查询 $[l,n]$ 的最小值即可，因为 $[r+1, n]$ 这部分的 `nxt[]` 肯定不会 $\leq r$，所以不会有影响，这样维护一个后缀最小值即可，所以是 $O(n)$ 的。

• 每一个 $x$ 都要预处理，所以是 $O(315n)$ 的。

<hr>

最终的复杂度：

1. 分块 + 莫队: $O(n \sqrt n)$。
2. 预处理因数：$O(n \sqrt n)$。
3. 回答前两种询问：$O(\frac{nq}{w})$。
4. 预处理除法操作的 `nxt[]`：$O(315n)$。

总复杂度为 $O(n\sqrt n + \frac{nq}{w} + 315n)$。


{{% /fold %}}


{{% fold "代码" %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn = 1e5+5;

const int N = 1e5;

int n, m, ans[maxn], a[maxn], l = 1, r = 0, B;
int bin[maxn], nxt[maxn];  // nxt[x][i]: 对于位置 i，在它右侧，离它最近的 j 使得 a_j = x * a_i 或者 a_j = a_i / x

struct Query {
    int op, l, r, x, id;
    bool operator<(const Query& other) const {
        int b1 = (l - 1) / B, b2 = (other.l - 1) / B;
        if (b1 == b2) {
            return r < other.r;
        }
        return b1 < b2;
    }
} q[maxn];
vector<Query> q4[320];  // 储存第四种询问

bitset<maxn> f, g;  // f: 代表当前区间内所有出现的 x，g 代表 N-x
int cnt[maxn];
void add(int p) {
    int x = a[p];
    cnt[x]++;
    f[x] = 1, g[N-x] = 1;
}

void del(int p) {
    int x = a[p];
    cnt[x]--;
    if (cnt[x] == 0) {
        f[x] = 0, g[N-x] = 0;
    }
}

vector<int> fac[maxn];
int pos[maxn];  
int main() {
    fastio;
    cin >> n >> m;
    B = max(10, (int)sqrt(n));
    for (int i = 1; i <= N; i++) {
        for (int j = i; j <= N; j += i) {
            fac[j].push_back(i);
        }
    }
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
    }
    for (int i = 1; i <= m; i++) {
        cin >> q[i].op >> q[i].l >> q[i].r >> q[i].x;
        q[i].id = i;
    }

    sort(q+1, q+m+1);
    for (int i = 1; i <= m; i++) {
        if (q[i].op == 4 && q[i].x <= B) {
            q4[q[i].x].push_back(q[i]);
            continue;  // 不处理
        }
        int ql = q[i].l, qr = q[i].r;
        while (r < qr) add(++r);
        while (r > qr) del(r--);
        while (l < ql) del(l++);
        while (l > ql) add(--l);
        int op = q[i].op, x = q[i].x;
        bool ok = 0;
        if (op == 1) {  // a-b = x
            // 查询是否有 a, a-x 同时存在
            ok = (f & (f>>x)).any();
        } else if (op == 2) {  // a+b = x
            ok = (f & (g>>(N-x))).any();
        } else if (op == 3) {   // a*b = x
            for (int j : fac[x]) {
                if (f[j] && f[x/j]) {
                    ok = 1;
                    break;
                }
            }
        } else {   // a/b = x
            
            assert(x > B);
            for (int j = 1; j * x <= 1e5; j++) {
                if (f[j] && f[j*x]) {
                    ok = 1;
                    break;
                }
            }
        }
        ans[q[i].id] = ok;
    }

    for (int x = 1; x <= B; x++) {
        if (!q4[x].size()) continue;  // 没有询问，不用build了
        fill(pos, pos+maxn, n+1);
        fill(nxt, nxt+maxn, n+1);
        for (int i = n; i >= 1; i--) {
            int v = a[i];
            pos[v] = i;
            if (v * x <= 1e5) nxt[i] = min(nxt[i], pos[v * x]);
            if (v % x == 0) nxt[i] = min(nxt[i], pos[v / x]);
            nxt[i] = min(nxt[i], nxt[i+1]);
        }

        for (auto [op, l, r, x, id] : q4[x]) {
            bool ok = (nxt[l] <= r);
            ans[id] = ok;
        }
    }

    for (int i = 1; i <= m; i++) cout << (ans[i] ? "yuno" : "yumi") << "\n";
}
```

{{% /fold %}}


## bitset 优化二分图匹配

bitset 在加上一些诡异的优化后，可以在 $n=7000$ 的情况下 $O(n^3)$ 跑出二分图最大匹配。

### 例1 Universal Cup 12 M.[Colorful Graph](https://qoj.ac/contest/1207/problem/6329)

{{% question 题意 %}}

给定一个 $n$ 个点，$m$ 条边的有向图。

现在需要将所有的点染色 $c_i$，在染色后，保证对于任意两个节点 $i,j$，如果 $c_i=c_j$，那么有

$i$ 能够到达 $j$ 或者 $j$ 能够到达 $i$。

求一个染色方案，使得总颜色数量最小，并且输出这个方案。

其中，$n,m \leq 7000$，时间限制 $8$ 秒，空间限制 $64$ MB。

{{% /question %}}

{{% fold "题解" %}}

首先 SCC 缩点，缩点后得到一个DAG，我们知道在同一个 SCC 内的颜色肯定相同。

然后变成 DAG 中可以相交的最小路径覆盖，我们记得可相交的最小路径覆盖需要对于每一个 $i,j$，如果 $i$ 能够到达 $j$ 那么连 $i \rightarrow j$ 这条边。

但这样的话总共有 $O(n^2)$ 条边，这题卡空间，很明显过不了。

于是考虑用 bitset 优化空间，然后可达性就用闭包来 $O(\frac{n^3}{w})$ 传递即可。

这样可以得到一个 `bitset<maxn> f[maxn]` 来表达一个邻接矩阵。

<hr>

然后解决最小路径覆盖问题，用最大匹配，但最大匹配是 $O(n^3)$ 的明显会T。

我们有三个优化：

1. 注意到在最大匹配里，有 `vis[]` 数组来表示这个右侧点在这一轮是否被访问过，
   
    我们可以用一个 `bitset<maxn> can` 也来表达这个意思。`can[j] = 1` 代表这个右侧点可以在这一轮被使用。

2. 在最大匹配中，我们枚举了所有的边 $(i,j)$，并且check是否有 $j$ 被 visit 过。

    在 bitset 中，我们可以直接用 `can` 筛选掉所有用不上的边（`bitset<maxn> F = (f[i] & can);`），然后利用 `for (int j = F._Find_first(); j < F.size(); j = F._Find_next(j))` 枚举边。

3. 如果这一轮匹配未成功，代表没有边发生变化，也就意味着如果右侧点 $j$ 在上一轮匹配失败了，那么这一轮一定也会匹配失败。

    所以，若当前这一轮匹配并未成功，我们无需重置 `can`。

• 以上三个优化缺一不可，少了一个就会 T。

{{% /fold %}}


{{% fold "代码" %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn = 7002;

int n, m;
vector<int> adj[maxn];

struct Tarjan {
    int dfn[maxn], low[maxn], id, from[maxn], scc = 0, sz[maxn];
    bool in[maxn];  // instack or not
    int st[maxn], tail = -1;
    void dfs(int u) {
        in[u] = 1;
        st[++tail] = u;
        dfn[u] = low[u] = ++id;
        for (int to : adj[u]) {
            if (dfn[to] && in[to]) low[u] = min(low[u], dfn[to]);  // 要记得在栈内
            if (!dfn[to]) {
                dfs(to);
                low[u] = min(low[u], low[to]);
            }
        }
        if (dfn[u] == low[u]) {
            from[u] = ++scc;
            sz[scc] = 1;
            while (tail >= 0 && st[tail] != u) {
                int cur = st[tail];
                from[cur] = from[u];
                sz[scc]++;
                tail--;
                in[cur] = 0;  // 记得这里，将在栈中的标记去掉
            }
            tail--;
            in[u] = 0;  // 记得这里，将在栈中的标记去掉
        }
    }
    // 跑tarjan
    void solve() {
        for (int i = 1; i <= n; i++) {
            if (!dfn[i]) dfs(i);
        }
    }
} tj;

bitset<maxn> f[maxn], can;
pii ed[maxn];

int match[maxn], id = 0;
bool dfs(int i) {
    bitset<maxn> F = (f[i] & can);   // 优化1: 筛选出有用的边
    for (int j = F._Find_first(); j < F.size(); j = F._Find_next(j)) {   // 优化2: 不考虑不存在的边
        can[j] = 0;
        if (!match[j] || dfs(match[j])) {
            match[j] = i;
            return 1;
        }
    }
    return 0;
}

int color[maxn], pre[maxn], nxt[maxn], ans[maxn];
int main() {
    fastio;
    cin >> n >> m;
    for (int i = 1; i <= m; i++) {
        int u, v; cin >> u >> v;
        adj[u].push_back(v);
        ed[i] = {u, v};
    }
    tj.solve();
    for (int i = 1; i <= m; i++) {
        int u = ed[i].first, v = ed[i].second;
        int fu = tj.from[u], fv = tj.from[v];
        if (fu == fv) continue;
        f[fu][fv] = 1;
    }

    int N = tj.scc;
    for (int i = 1; i <= N; i++) {
        for (int j = 1; j <= N; j++) {
            if (f[j][i]) f[j] |= f[i];
        }
    }

    can.set();
    for (int i = 1; i <= N; i++) {
        if (dfs(i)) can.set();  // 优化3: 只有在匹配成功时，才重置 can 
    }

    int c = 0;
    for (int i = 1; i <= N; i++) {
        if (match[i]) {
            nxt[match[i]] = i;
            pre[i] = match[i];
        }
    }

    for (int i = 1; i <= N; i++) {
        if (!pre[i]) {
            int j = i;
            ++c;
            while (j) {
                color[j] = c;
                j = nxt[j];
            }
        }
    }

    for (int i = 1; i <= n; i++) {
        ans[i] = color[tj.from[i]];
        cout << ans[i] << " ";
    }
    cout << "\n";
}
```

{{% /fold %}}
