+++
title = 'Universal Cup 15 (Hangzhou)'
date = 2023-05-18T23:54:00-05:00
draft = false
categories = ['解题报告']
tags = ['', '']
+++



### L. [Barkley](https://qoj.ac/problem/6405)

{{% question 题意 %}}

给定长度为 $n$ 的数组 $a_i$，有 $q$ 个询问，每次询问为 $l~r~k$

回答在 $[l,r]$ 这个区间内，可以去掉至多 $k$ 个数后，得到的最大 gcd 是多少？

其中，$n \leq 10^5, q \leq 66666, k \in [1,3], a_i \in [1,10^{18}]$，并且保证 $k = 2$ 的询问不超过 $600$ 个，$k=3$ 的询问不超过 $6$ 个。保证每次询问的区间长度 $> k$。

{{% /question %}}

{{% fold "题解" %}}

设 $g(l,r) = \gcd([a_l, ..., a_{r}])$

注意到，如果 $k=1$，那么问题变成了求

$$\max\limits_{x \in [l,r]} \gcd(g(l,x-1), g(x+1,r))$$

那么注意到，固定一个 $l$，那么 $g(l,r)$ 的取值最多只有 $\log(10^{18})$ 种，因为 $r$ 增大时 gcd 随之减小，而每次至少 / 2。

并且注意到，如果希望答案最佳，那么如果 $g(l,r_1) = g(l,r_2)$ 且 $r_1<r_2$，那么肯定选择 $r_2$。

所以可以二分，预处理出来每一个 $l$，对应的不同的 gcd 的最大右端点 $j$。对于一个 $l$，这样的 $j$ 只有 $\log(10^{18})$ 种。

对于 $k=1$ 就可以暴力枚举了。

对于 $k=2,3$ 的情况可以递归解决。

• 对于 $k=2,3$ 的情况，注意递归时，并不是让 $k-1$ 的情况得到的 gcd 值最大，而是应该将 $g(l,x-1)$ 的值也传进去，让 $k-1$ 对应的值与 $g(l,x-1)$ 的gcd最大。

在代码实现里，用参数 $g$ 来表示。

```cpp
ll solve(int l, int r, int k, ll g) {
    if (r-l+1 <= k || l > r) return g;
    if (k == 0) return gcd(g, st.ask_st(l,r));

    ll ans = 0;
    for (int j : nxt[l]) {
        ll G = gcd(g, st.ask_st(l, j));
        ans = max(ans, solve(j+2, r, k-1, G));
    }
    ans = max({ans, solve(l, r-1, k-1, g), solve(l+1, r, k-1, g)});
    return gcd(g,ans);
}
```



{{% /fold %}}


{{% fold "代码" %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn = 1e5+5;

int n,q;
ll gcd(ll a, ll b) {
    if (a < b) swap(a, b);
    if (!b) return a;
    return gcd(b, a%b);
}
ll a[maxn];

struct SparseTable {
    ll st[maxn][18], bin[maxn];
    ll ask_st(int l, int r) {
        int len = r-l+1;
        int k = bin[len];
        return gcd(st[l][k], st[r-(1<<k)+1][k]);
    }
 
    void build_st() {
        bin[1] = 0; bin[2] = 1;
        for (int i = 3; i < maxn; i++) bin[i] = bin[i>>1] + 1;
        for (int i = 1; i <= n; i++) st[i][0] = a[i];
        for (int k = 1; k < 18; k++) {
            for (int i = 1; i + (1<<k) - 1 <= n; i++)
                st[i][k] = gcd(st[i][k-1], st[i+(1<<(k-1))][k-1]);
        }
    }
} st;

vector<int> nxt[maxn];  // nxt[i]: 储存了从 i 开始，所有不同的 gcd 的右端点j的最大值

ll solve(int l, int r, int k, ll g) {
    if (r-l+1 <= k || l > r) return g;
    if (k == 0) return gcd(g, st.ask_st(l,r));

    ll ans = 0;
    for (int j : nxt[l]) {
        ll G = gcd(g, st.ask_st(l, j));
        ans = max(ans, solve(j+2, r, k-1, G));
    }
    ans = max({ans, solve(l, r-1, k-1, g), solve(l+1, r, k-1, g)});
    return gcd(g,ans);
}

int main() {
    fastio;
    cin >> n >> q;
    for (int i = 1; i <= n; i++) cin >> a[i];
    st.build_st();
    for (int i = 1; i <= n; i++) {
        int j = i;

        while (j <= n) {
            int low = j, high = n, res = j;
            ll g = st.ask_st(i, j);
            while (low <= high) {
                int mid = (low + high) >> 1;
                if (st.ask_st(i, mid) == g) res = mid, low = mid+1;
                else high = mid-1;
            }
            nxt[i].push_back(res);
            j = res + 1;
        }
    }

    while (q--) {
        int l,r,k; cin >> l >> r >> k;
        cout << solve(l,r,k,0) << "\n";
    }
}
```

{{% /fold %}}
