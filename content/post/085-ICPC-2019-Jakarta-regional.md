+++
title = '2019 Jakarta Regional'
date = 2022-12-23T18:57:28-06:00
draft = false
categories = ['解题报告']
tags = ['', '']
+++


### K. [Addition Robot](https://codeforces.com/contest/1252/problem/K)

{{% question 题意 %}}

给定 $n$ 个字母 $s_1, s_2 ..., s_n$，每个字母要么为 $A$ 要么为 $B$。

现在有 $Q$ 个询问，每个询问有两种类型：

$1 ~ L ~ R$：将 $i \in [L,R]$ 的所有 $A$ 改成 $B$，$B$ 改成 $A$。

$2 ~ L ~ R ~ a ~ b$：$a,b$ 是两个非负整数，从左往右遍历 $L$ 到 $R$，遇到一个 `A` 就让 $a=a+b$，遇到一个 `B` 就让 $b=a+b$，返回 $a,b$ 在经历这些操作后的值。

其中，$n \leq 10^5, Q \leq 10^5$，答案对 $10^9+7$ 取模。

{{% /question %}}

{{% fold "题解" %}}

线段树。

注意到这个 $a=a+b$，$b=a+b$，有没有想到 **矩阵操作**？

设 $v = \begin{bmatrix}
a \\\\
b \\\\
\end{bmatrix}$，那么设 $A = \begin{bmatrix}
1 & 1 \\\\
0 & 1 \\\\
\end{bmatrix}, B = \begin{bmatrix}
1 & 0 \\\\
1 & 1 \\\\
\end{bmatrix}$，就有

$$Av = \begin{bmatrix} a+b \\\\ b \\\\ \end{bmatrix}, Bv = \begin{bmatrix} a \\\\ a+b \\\\ \end{bmatrix}$$

所以线段树里面维护矩阵即可。

<hr>

现在考虑一下第一种询问怎么处理？

第一种询问其实相当于保持矩阵不变，先把 $v = \begin{bmatrix}
a \\\\
b \\\\
\end{bmatrix}$ 变成 $v‘ = \begin{bmatrix}
b \\\\
a \\\\
\end{bmatrix}$，然后乘完矩阵以后，再上下对调变回来。

这个操作本质上也是矩阵乘法，即令 $C = \begin{bmatrix}
0 & 1 \\\\
1 & 0 \\\\
\end{bmatrix}$，假设原矩阵操作序列是 $M = (AABA)$，原操作序列得到的结果是 $Mv$，现在的结果是 $C(M(cv)) = CMCv = (CMC)v$。

由此可知第一种询问就是将 $[L,R]$ 维护的矩阵 $M$ 变成了 $CMC$。

进行一些手动计算以后可以发现这等效于将 $M$ 的两个对角线元素互换。

<hr>

最后需要注意一点，矩阵乘法和序列的遍历顺序是反过来的，比如序列是 $AB$，那么矩阵乘法应该是 $(BA)v$，处理这种情况只要在维护线段树的时候先处理 right child即可。

{{% /fold %}}


{{% fold "代码" %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn = 1e5+5;
const int maxn = 1e5+5;
const int maxm = 2e5+5;

struct Mat {
    ll a[2][2];
    friend Mat operator*(const Mat& lhs, const Mat& rhs) {
        Mat res;
        for (int i = 0; i < 2; i++) {
            for (int j = 0; j < 2; j++) {
                // 第i行 乘 第j列
                res.a[i][j] = 0;
                for (int k = 0; k < 2; k++) {
                    res.a[i][j] += lhs.a[i][k] * rhs.a[k][j];
                    res.a[i][j] %= mod;
                }
            }
        }
        return res;
    }
    void rev() {
        swap(a[0][0], a[1][1]);
        swap(a[0][1], a[1][0]);
    }
};

int n, Q;
Mat A, B, arr[maxn];
struct Tree_Node {
    Mat a;
    int flag = 0;
} tr[maxn<<2];
void push_up(int cur) {
    tr[cur].a = tr[cur<<1|1].a * tr[cur<<1].a;
}
void push_down(int cur) {
    if (!tr[cur].flag) return;
    tr[cur].flag = 0;
    int lc = cur<<1, rc = lc|1;
    tr[lc].flag ^= 1;
    tr[rc].flag ^= 1;
    tr[lc].a.rev();
    tr[rc].a.rev();
}
void build(int cur, int l, int r) {
    if (l == r) {
        tr[cur].a = arr[l];
        return;
    }
    int mid = (l+r) >> 1;
    build(cur<<1|1, mid+1, r);
    build(cur<<1, l, mid);
    push_up(cur);
}
void update(int cur, int l, int r, int L, int R) {
    if (L <= l && R >= r) {
        tr[cur].flag ^= 1;
        tr[cur].a.rev();
        return;
    }
    push_down(cur);
    int mid = (l+r) >> 1;
    if (R > mid) update(cur<<1|1, mid+1, r, L, R);
    if (L <= mid) update(cur<<1, l, mid, L, R);
    push_up(cur);
}
Mat query(int cur, int l, int r, int L, int R) {
    if (L <= l && R >= r) {
        return tr[cur].a;
    }
    push_down(cur);
    int mid = (l+r) >> 1;
    Mat res {};
    res.a[0][0] = res.a[1][1] = 1;
    res.a[0][1] = res.a[1][0] = 0;
    if (R > mid) res = res * query(cur<<1|1, mid+1, r, L, R);
    if (L <= mid) res = res * query(cur<<1, l, mid, L, R);
    push_up(cur);
    return res;
}

int main() {
    fastio;
    cin >> n >> Q;

    A.a[0][0] = A.a[0][1] = A.a[1][1] = 1;
    B.a[0][0] = B.a[1][0] = B.a[1][1] = 1;

    for (int i = 1; i <= n; i++) {
        char c; cin >> c;
        if (c == 'A') arr[i] = A;
        else arr[i] = B;
    }
    build(1, 1, n);
    while (Q--) {
        int op;
        cin >> op;
        if (op == 1) {
            int L, R; cin >> L >> R;
            update(1, 1, n, L, R);
        } else {
            int L, R; ll a, b; cin >> L >> R >> a >> b;
            Mat res = query(1, 1, n, L, R);
            cout << (a * res.a[0][0] + b * res.a[0][1]) % mod << " " << (a * res.a[1][0] + b * res.a[1][1]) % mod << "\n";
        }
    }
}
```

{{% /fold %}}


### G. [Performance Review](https://codeforces.com/contest/1252/problem/G)

{{% question 题意 %}}

一家公司有 $N$ 个员工，总共有 $M$ 年，每个员工都有一个表现分 $A_i$。

第 $i$ 年，公司会淘汰 $R_i$ 个表现最差的员工，并且换上 $R_i$ 个新员工，他们的表现分为 $B_{i,1}, B_{i,2} ... B_{i,R_i}$（这些新员工表现不一定比老员工好）。

现在考虑第一个员工 $A_1$，他有 $Q$ 个询问，每次询问他会更改一个未来替换的员工的表现分，回答在替换之后，他在 $M$ 年之后是否还能留在公司。

• 每次询问的更改结果会保留到后续询问。

其中，$N,M,Q \leq 10^5, \sum\limits_{i=1}^M R_i \leq 10^6$，所有员工（包括未来的）表现分各不相同。

{{% /question %}}


{{% fold "题解" %}}

注意到员工 $A_1$ 能留到 $M$ 年后当且仅当对于所有的 $i$，在第 $i$ 年结束时，比他菜的人数 $\geq$ 要淘汰的人数。

形式化的：

$$cnt_{i-1} \geq \sum\limits_{j=1}^i R_i, \forall i \in [1, M]$$

其中，$cnt_{i-1}$ 代表第 $i-1$ 年结束后，（完成招聘以后）比他菜的人数。

<hr>

现在，只要考虑每次询问过后有什么影响即可。

注意到要淘汰的人数是个定值，影响的只有比他菜的人数。

所以用线段树，储存每一年 $cnt_{i-1} - \sum\limits_{j=1}^i R_i$ 的值。

每次更改第 $j$ 年中，一个人的表现分以后，跟 $A[1]$ 对比，如果原本比他菜，现在比他强，意味着从 $(j+1)$ 年起，一直到 $M$，比他菜的人少了一个，反之则是多了一个。

所以就是线段树的区间修改，区间查询最小值是否 $\geq 0$。

{{% /fold %}}


{{% fold "代码" %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn = 1e5+5;
int n, m, Q, a[maxn];
vector<int> per[maxn];
 
int cnt[maxn], sum_r[maxn];  // cnt[i]: 第i年之前比他小的 (0...i-1) 年，sum_r[i]: 第i年过后总共要裁的人数
int c[maxn];  // c[i] = cnt[i] - sum(R[1..i])
 
struct Tree_Node {
    int mn = 1e9, flag = 0;  // min_val, flag
} tr[maxn<<2];
void push_up(int cur) {
    tr[cur].mn = min(tr[cur<<1].mn, tr[cur<<1|1].mn);
}
void push_down(int cur) {
    if (!tr[cur].flag) return;
    int f = tr[cur].flag;
    tr[cur<<1].flag += f;
    tr[cur<<1|1].flag += f;
    tr[cur<<1].mn += f;
    tr[cur<<1|1].mn += f;
    tr[cur].flag = 0;
}
// += x
void update(int cur, int l, int r, int L, int R, int x) {
    if (L <= l && R >= r) {
        tr[cur].flag += x;
        tr[cur].mn += x;
        return;
    }
    push_down(cur);
    int mid = (l+r) >> 1;
    if (L <= mid) update(cur<<1, l, mid, L, R, x);
    if (R > mid) update(cur<<1|1, mid+1, r, L, R, x);
    push_up(cur);
}
 
// query 最小值
int query(int cur, int l, int r, int L, int R) {
    if (L <= l && R >= r) {
        return tr[cur].mn;
    }
    push_down(cur);
    int mid = (l+r) >> 1;
    int res = 1e9;
    if (L <= mid) res = min(res, query(cur<<1, l, mid, L, R));
    if (R > mid) res = min(res, query(cur<<1|1, mid+1, r, L, R));
    push_up(cur);
    return res;
}
 
void build(int cur, int l, int r) {
    if (l == r) {
        tr[cur].mn = c[l];
        return;
    }
    int mid = (l+r) >> 1;
    build(cur<<1, l, mid);
    build(cur<<1|1, mid+1, r);
    push_up(cur);
}
 
 
int main() {
    cin >> n >> m >> Q;
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
        if (i > 1 && a[i] < a[1]) cnt[1]++;
    }
    for (int i = 1; i <= m; i++) {
        int r; cin >> r;
        sum_r[i] = sum_r[i-1] + r;
        cnt[i+1] = cnt[i];
 
        while (r--) {
            int x; cin >> x;
            per[i].push_back(x);
            if (x < a[1]) cnt[i+1]++;
        }
    }
    for (int i = 1; i <= m; i++) c[i] = cnt[i] - sum_r[i];
    build(1, 1, m);
 
    while (Q--) {
        int x,y,z; cin >> x >> y >> z;
        if (x < m) {  // 注意这里特判
            if (per[x][y-1] < a[1] && z > a[1]) {  // 
                update(1, 1, m, x+1, m, -1);
            } else if (per[x][y-1] > a[1] && z < a[1]) {
                update(1, 1, m, x+1, m, 1);
            }
        }
 
        per[x][y-1] = z;
        if (query(1, 1, m, 1, m) < 0) {
            cout << 0 << "\n";
        } else cout << 1 << "\n";
    }
}
```

{{% /fold %}}
