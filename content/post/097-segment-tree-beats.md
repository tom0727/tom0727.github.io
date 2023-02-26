+++
title = '吉司机线段树（Segment Tree Beats）'
date = 2023-02-22T15:48:08-06:00
draft = false
categories = ['算法']
tags = ['线段树', '']
+++


## 介绍

吉司机线段树可以做到：

1. 区间最大/最小操作（对一个区间内的所有数取 max 或者 min）
2. 维护区间历史最值

我们直接看一道例题：

{{% question 题意 %}}

给定一个数组 $a_1, a_2, ... a_n$，同时给定一个数组 $b_1, b_2..., b_n$（初始状态下 $a,b$ 相同）。

进行 $m$ 次操作，操作有 $5$ 种：

$1 ~ l ~ r ~ x$：$\forall i \in [l,r]$，将 $a_i$ 加上 $x$。

$2 ~ l ~ r ~ x$：$\forall i \in [l,r]$，将 $a_i$ 变成 $\min(a_i, x)$。

$3 ~ l ~ r$：求 $[l,r]$ 之间 $a_i$ 的区间和。

$4 ~ l ~ r$：求 $[l,r]$ 之间 $a_i$ 的区间最大值。

$5 ~ l ~ r$：求 $[l,r]$ 之间 $b_i$ 的区间最大值。

在每一次操作后，我们进行一次更新，使得 $\forall i \in [1,n], b_i \leftarrow \max(b_i, a_i)$。

{{% /question %}}

吉司机线段树可以在 $O((n+m) \log^2n)$ 的时间内解决这个问题。

具体的，我们先看一下线段树的节点需要维护什么。

### 区间历史最值

先考虑第 $5$ 个操作。首先 $b_i$ 其实是一个历史最大值数组（即 $a_i$ 在任意时刻，所存放过的最大的值）。我们要求的是 $b_i$ 的区间最大值。

在区间加的时候，我们会维护一个最大值的懒标记 `add1`。不过这个懒标记可能会被多次更新，所以我们只要维护在**任意时刻**，这个懒标记的最大值 `add3`（也就是懒标记本身的 **历史最大值**）即可。

• 简而言之 `add3` 就是 `add1` 在任意时刻所达到的最大值。

### 区间取最小操作

区间怎么取最小？考虑一下，如果我们要对一个区间取 $\min$，要取的值是 $x$。

那么假设这个区间只有 **一种值** 是 $>x$ 的，那么就可以取最小了。

所以我们需要维护区间的**最大值 `maxa`，和次大值 `se`**。一个区间可以取 `min` 当且仅当 $se < x < maxa$。

如果不满足这个条件，则要么直接退出（$x \geq maxa$），或者继续递归（$x < maxa$）。

由于我们需要维护次大值，而区间加也有可能会更新次大值，所以我们还需要 **非最大值**的懒标记 `add2`，同上理由还需要一个 **非最大值懒标记** 的历史最大值 `add4`。

• 简而言之 `add4` 就是 `add2` 在任意时刻所达到的最大值。

{{% fold "模版" %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn = 5e5+5;

struct SegTreeBeats {
    const int INF = 1e9;
    int a[maxn];  // 原数组
    struct Node {
        ll sum;
        int maxa, maxb, cnt, se;  
        // maxa: 区间最大值, maxb: 区间历史最大值, cnt: 区间最大值的数量, se: 区间严格次大值
        int add1, add2, add3, add4;
        // add1: 区间最大值懒标记, add2: 区间非最大值懒标记, add3: 区间历史最大值懒标记, add4: 区间历史非最大值懒标记
    } tr[maxn<<2];
    void push_up(int cur) {
        int lc = cur<<1, rc = cur<<1|1;
        tr[cur].sum = tr[lc].sum + tr[rc].sum;
        tr[cur].maxa = max(tr[lc].maxa, tr[rc].maxa);
        tr[cur].maxb = max(tr[lc].maxb, tr[rc].maxb);
        if (tr[lc].maxa == tr[rc].maxa) {
            tr[cur].se = max(tr[lc].se, tr[rc].se);
            tr[cur].cnt = tr[lc].cnt + tr[rc].cnt;
        } else if (tr[lc].maxa > tr[rc].maxa) {
            tr[cur].se = max(tr[lc].se, tr[rc].maxa);
            tr[cur].cnt = tr[lc].cnt;
        } else {  // rc.maxa > lc.maxa
            tr[cur].se = max(tr[lc].maxa, tr[rc].se);
            tr[cur].cnt = tr[rc].cnt;
        }
    }
    void helper(int cur, int l, int r, ll k1, ll k2, ll k3, ll k4) {
        tr[cur].sum += k1 * tr[cur].cnt + k2 * (r-l+1-tr[cur].cnt);
        tr[cur].maxb = max((ll)tr[cur].maxb, tr[cur].maxa + k3);
        tr[cur].maxa += k1;
        if (tr[cur].se != -INF) tr[cur].se += k2;
        tr[cur].add3 = max((ll)tr[cur].add3, tr[cur].add1 + k3);
        tr[cur].add4 = max((ll)tr[cur].add4, tr[cur].add2 + k4);
        tr[cur].add1 += k1, tr[cur].add2 += k2;
    }
    void push_down(int cur, int l, int r) {
        int lc = cur<<1, rc = cur<<1|1;
        int mx = max(tr[lc].maxa, tr[rc].maxa);
        int mid = (l+r) >> 1;
        if (tr[lc].maxa == mx) helper(lc, l, mid, tr[cur].add1, tr[cur].add2, tr[cur].add3, tr[cur].add4); // 注意这里是 1,2,3,4
        else helper(lc, l, mid, tr[cur].add2, tr[cur].add2, tr[cur].add4, tr[cur].add4);  // 注意这里是 2,2,4,4
        if (tr[rc].maxa == mx) helper(rc, mid+1, r, tr[cur].add1, tr[cur].add2, tr[cur].add3, tr[cur].add4);  // 注意这里是 1,2,3,4
        else helper(rc, mid+1, r, tr[cur].add2, tr[cur].add2, tr[cur].add4, tr[cur].add4);  // 注意这里是 2,2,4,4
        tr[cur].add1 = tr[cur].add2 = tr[cur].add3 = tr[cur].add4 = 0;
    }
    void build(int cur, int l, int r) {
        if (l == r) {
            tr[cur].sum = tr[cur].maxa = tr[cur].maxb = a[l];
            tr[cur].cnt = 1;
            tr[cur].se = -INF;
            return;
        }
        int mid = (l+r) >> 1;
        build(cur<<1, l, mid);
        build(cur<<1|1, mid+1, r);
        push_up(cur);
    }
    ll query_sum(int cur, int l, int r, int L, int R) {
        if (L <= l && R >= r) {
            return tr[cur].sum;
        }
        push_down(cur, l, r);
        int mid = (l+r) >> 1;
        ll res = 0;
        if (L <= mid) res += query_sum(cur<<1, l, mid, L, R);
        if (R > mid) res += query_sum(cur<<1|1, mid+1, r, L, R);
        return res;
    }
    int query_maxa(int cur, int l, int r, int L, int R) {
        if (L <= l && R >= r) {
            return tr[cur].maxa;
        }
        push_down(cur, l, r);
        int mid = (l+r) >> 1;
        int res = -INF;
        if (L <= mid) res = max(res, query_maxa(cur<<1, l, mid, L, R));
        if (R > mid) res = max(res, query_maxa(cur<<1|1, mid+1, r, L, R));
        return res;
    }
    int query_maxb(int cur, int l, int r, int L, int R) {
        if (L <= l && R >= r) {
            return tr[cur].maxb;
        }
        push_down(cur, l, r);
        int mid = (l+r) >> 1;
        int res = -INF;
        if (L <= mid) res = max(res, query_maxb(cur<<1, l, mid, L, R));
        if (R > mid) res = max(res, query_maxb(cur<<1|1, mid+1, r, L, R));
        return res;
    }
    void update_add(int cur, int l, int r, int L, int R, ll x) {
        if (L <= l && R >= r) {
            tr[cur].sum += x * (r-l+1);
            tr[cur].maxa += x;
            tr[cur].maxb = max(tr[cur].maxb, tr[cur].maxa);
            if (tr[cur].se != -INF) tr[cur].se += x;
            tr[cur].add1 += x, tr[cur].add2 += x;
            tr[cur].add3 = max(tr[cur].add3, tr[cur].add1);
            tr[cur].add4 = max(tr[cur].add4, tr[cur].add2);
            return;
        }
        push_down(cur, l, r);
        int mid = (l+r) >> 1;
        if (L <= mid) update_add(cur<<1, l, mid, L, R, x);
        if (R > mid) update_add(cur<<1|1, mid+1, r, L, R, x);
        push_up(cur);
    }
    void update_min(int cur, int l, int r, int L, int R, int x) {
        if (x >= tr[cur].maxa) return;
        if (L <= l && R >= r && x > tr[cur].se) {  // 保证 se > x
            ll k = tr[cur].maxa - x;  // 最大值减少的幅度
            tr[cur].sum -= tr[cur].cnt * k;
            tr[cur].maxa = x;
            tr[cur].add1 -= k;
            return;
        }
        push_down(cur, l, r);
        int mid = (l+r) >> 1;
        if (L <= mid) update_min(cur<<1, l, mid, L, R, x);
        if (R > mid) update_min(cur<<1|1, mid+1, r, L, R, x);
        push_up(cur);
    }
} seg;

int n, m;
int main() {
    cin >> n >> m;
    for (int i = 1; i <= n; i++) cin >> seg.a[i];
    seg.build(1, 1, n);
    while (m--) {
        int op, l, r; cin >> op >> l >> r;
        if (op == 1) {
            ll x; cin >> x;
            seg.update_add(1, 1, n, l, r, x);
        } else if (op == 2) {
            ll x; cin >> x;
            seg.update_min(1, 1, n, l, r, x);
        } else if (op == 3) {
            cout << seg.query_sum(1, 1, n, l, r) << "\n";
        } else if (op == 4) {
            cout << seg.query_maxa(1, 1, n, l, r) << "\n";
        } else {
            cout << seg.query_maxb(1, 1, n, l, r) << "\n";
        }
    }
}
```

{{% /fold %}}

## 例题

### 例1 洛谷P4314 [CPU 监控](https://www.luogu.com.cn/problem/P4314)

{{% question 题意 %}}

给定一个数组 $a_1,a_2...,a_n$，有 $m$ 个询问。

进行 $m$ 次操作，操作有 $4$ 种：

$Q ~ l ~ r$：求 $[l,r]$ 之间 $a_i$ 的区间最大值。

$A ~ l ~ r$：求 $[l,r]$ 之间 $a_i$ 的区间历史最大值。

$P ~ l ~ r ~ x$：将 $[l,r]$ 之间的 $a_i$ 增加 $x$。

$C ~ l ~ r ~ x$：将 $[l,r]$ 之间的 $a_i$ 变为 $x$。


{{% /question %}}


{{% fold "题解" %}}

题解链接：[https://www.luogu.com.cn/blog/He-Ren/solution-p4314](https://www.luogu.com.cn/blog/He-Ren/solution-p4314)

带有区间赋值，维护历史最大值。

我们对于一个区间，在 `push_down()` 之后，所有之前的操作都可以看作不存在。

那么我们按照每次 `push_down()` 作为分隔符来考虑这些操作序列，以下的讨论都仅限于 **一次 `push_down()` 以内的**。

一个区间的操作只有区间加和区间赋值，并且相邻的相同类型操作可以合并为一个。

所以最终操作序列肯定可以被简化为 区间加 + 区间赋值 + 区间加 + 区间赋值 + 区间加 ...

我们可以发现，区间赋值后，所有的区间加操作都可以被重新看作为赋值，所以我们维护一个 `set_tag` 表示在此次 `push_down()` 内是否有赋值操作即可。

{{% /fold %}}


{{% fold "代码" %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn = 5e5+5;
struct SegTreeBeats {
    const int INF = 2e9;
    int a[maxn];  // 原数组
    struct Node {
        ll sum;
        int maxa, maxb; 
        // maxa: 区间最大值, maxb: 区间历史最大值, cnt: 区间最大值的数量, se: 区间严格次大值
        int add1, add2;
        int set1, set2;
        bool set_tag;
        // add1: 区间最大值懒标记, add2: 区间非最大值懒标记, add2: 区间历史最大值懒标记, add4: 区间历史非最大值懒标记
    } tr[maxn<<2];
    void push_up(int cur) {
        int lc = cur<<1, rc = cur<<1|1;
        tr[cur].maxa = max(tr[lc].maxa, tr[rc].maxa);
        tr[cur].maxb = max(tr[lc].maxb, tr[rc].maxb);
    }
    void add_helper(int cur, ll x, ll max_add) {
        if (tr[cur].set_tag) {
            tr[cur].set2 = max((ll)tr[cur].set2, tr[cur].set1 + max_add);
            tr[cur].maxb = max((ll)tr[cur].maxb, tr[cur].maxa + max_add);
            tr[cur].maxa += x;
            tr[cur].set1 += x;
        } else {
            tr[cur].add2 = max((ll)tr[cur].add2, tr[cur].add1 + max_add);
            tr[cur].maxb = max((ll)tr[cur].maxb, tr[cur].maxa + max_add);
            tr[cur].maxa += x;
            tr[cur].add1 += x;
        }
    }
    void set_helper(int cur, ll x, ll max_set) {
        tr[cur].set2 = max((ll)(tr[cur].set2), max_set);
        tr[cur].maxb = max((ll)tr[cur].maxb, max_set);
        tr[cur].set_tag = 1;
        tr[cur].maxa = tr[cur].set1 = x;
    }
    void push_down(int cur, int l, int r) {
        int lc = cur<<1, rc = cur<<1|1;
        add_helper(lc, tr[cur].add1, tr[cur].add2);
        add_helper(rc, tr[cur].add1, tr[cur].add2);
        tr[cur].add1 = tr[cur].add2 = 0;

        if (tr[cur].set_tag) {
            set_helper(lc, tr[cur].set1, tr[cur].set2);
            set_helper(rc, tr[cur].set1, tr[cur].set2);
            tr[cur].set_tag = 0;
            tr[cur].set1 = tr[cur].set2 = 0;
            return;
        }
    }
    void build(int cur, int l, int r) {
        if (l == r) {
            tr[cur].sum = tr[cur].maxa = tr[cur].maxb = a[l];
            return;
        }
        int mid = (l+r) >> 1;
        build(cur<<1, l, mid);
        build(cur<<1|1, mid+1, r);
        push_up(cur);
    }
    ll query_sum(int cur, int l, int r, int L, int R) {
        if (L <= l && R >= r) {
            return tr[cur].sum;
        }
        push_down(cur, l, r);
        int mid = (l+r) >> 1;
        ll res = 0;
        if (L <= mid) res += query_sum(cur<<1, l, mid, L, R);
        if (R > mid) res += query_sum(cur<<1|1, mid+1, r, L, R);
        return res;
    }
    int query_maxa(int cur, int l, int r, int L, int R) {
        if (L <= l && R >= r) {
            return tr[cur].maxa;
        }
        push_down(cur, l, r);
        int mid = (l+r) >> 1;
        int res = -INF;
        if (L <= mid) res = max(res, query_maxa(cur<<1, l, mid, L, R));
        if (R > mid) res = max(res, query_maxa(cur<<1|1, mid+1, r, L, R));
        return res;
    }
    int query_maxb(int cur, int l, int r, int L, int R) {
        if (L <= l && R >= r) {
            return tr[cur].maxb;
        }
        push_down(cur, l, r);
        int mid = (l+r) >> 1;
        int res = -INF;
        if (L <= mid) res = max(res, query_maxb(cur<<1, l, mid, L, R));
        if (R > mid) res = max(res, query_maxb(cur<<1|1, mid+1, r, L, R));
        return res;
    }
    void update_set(int cur, int l, int r, int L, int R, ll x) {
        if (L <= l && R >= r) {
            set_helper(cur, x, x);
            return;
        }
        push_down(cur, l, r);
        int mid = (l+r) >> 1;
        if (L <= mid) update_set(cur<<1, l, mid, L, R, x);
        if (R > mid) update_set(cur<<1|1, mid+1, r, L, R, x);
        push_up(cur);
    }
    void update_add(int cur, int l, int r, int L, int R, ll x) {
        if (L <= l && R >= r) {
            add_helper(cur, x, x);
            return;
        }
        push_down(cur, l, r);
        int mid = (l+r) >> 1;
        if (L <= mid) update_add(cur<<1, l, mid, L, R, x);
        if (R > mid) update_add(cur<<1|1, mid+1, r, L, R, x);
        push_up(cur);
    }
} seg;

int n, m;
int main() {
    cin >> n;
    for (int i = 1; i <= n; i++) cin >> seg.a[i];
    seg.build(1, 1, n);
    cin >> m;
    while (m--) {
        char op; int l, r; 
        cin >> op >> l >> r;
        if (op == 'Q') {
            cout << seg.query_maxa(1, 1, n, l, r) << "\n";
        } else if (op == 'A') {
            cout << seg.query_maxb(1, 1, n, l, r) << "\n";
        } else if (op == 'P') {
            ll x; cin >> x;
            seg.update_add(1, 1, n, l, r, x);
        } else if (op == 'C') {
            ll x; cin >> x;
            seg.update_set(1, 1, n, l, r, x);
        }
    }
}
```

{{% /fold %}}



## 参考链接

1. https://www.luogu.com.cn/problem/P6242