+++
title = 'Universal Cup 8 (Slovenia)'
date = 2023-03-19T22:24:00-05:00
draft = false
categories = ['解题报告']
tags = ['', '']
+++


### C. [Constellations](https://qoj.ac/contest/1070/problem/5251?v=1)

{{% question 题意 %}}

二维平面中有 $n$ 个点，一开始每个点都属于自己的一组。

有 $n-1$ 轮合并过程，每次合并选择距离最近的两组点进行合并，两组点 $A,B$ 之间的距离定义为：

$$d(A,B) = \frac{1}{|A||B|} \sum\limits_{a \in A} \sum\limits_{b \in B} ||a-b||^2$$

其中距离为普通的欧式距离定义，$a,b$ 为 $A,B$ 中的点。

如果距离最近的有多组点，那么选择最老的组优先合并。

每次合并后，输出合并后得到的组的大小。

其中，$2 \leq n \leq 2000, x_i,y_i \in [-1000,1000]$。


{{% /question %}}


{{% fold "题解" %}}

一眼并查集，但怎么做呢？

每一步我们需要得到现在最近的两组点，我们首先可以发现，如果我们定义 

$$D(A,B) = \sum\limits_{a \in A} \sum\limits_{b \in B} ||a-b||^2$$

那么有 $D(A+B, C) = D(A,C) + D(B,C)$，所以我们在合并两个组 $A,B$ 后，可以暴力枚举剩下的所有组 $C$，然后计算 $D(A+B, C)$。

剩下的就是快速选择距离最小的组进行合并了，我们不妨用 pq 来维护所有组之间的距离 $D(A,B)$。

• 但直接用并查集并不能做，因为我们在合并了两个组 $A,B$ 后，所有和 $A,B$ 相关的pair都需要得到更新，但这是无法做到的。

所以我们考虑 **创造新点**。

每当我们合并 $A,B$ 两个组，就创建一个新点叫 $E$，然后我们将 $A,B$ 标记为不存在，每次从 pq 里 pop 出新的pair时，check一下这个pair中是否有不存在的点，如果有就直接忽略。

这样甚至都不需要并查集，因为每次合并后一定是parent存在，剩下的不存在，所以存在的点有且仅有可能是parent。

{{% /fold %}}


{{% fold "代码" %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn = 4e3+5;

int sz[maxn];
int id;
ll dis[maxn][maxn];
ll getdis(int a, int b) {
    return dis[min(a,b)][max(a,b)];
}

struct Node {
    ll d;
    int a, b;
    bool operator<(const Node& other) const {
        int na = other.a, nb = other.b;
        ll d1 = d * sz[na] * sz[nb], d2 = other.d * sz[a] * sz[b];
        if (d1 == d2) {
            return (pii){min(a,b), max(a,b)} > (pii){min(na,nb), max(na,nb)};
        }
        return d1 > d2;
    }
};
int n, x[maxn], y[maxn];
priority_queue<Node> pq;
inline ll sq(int x) {return x*x;}
ll cal(int i, int j) {
    return sq(x[i] - x[j]) + sq(y[i] - y[j]);
}
bool alive[maxn];
int main() {
    cin >> n;
    for (int i = 1; i <= n; i++) sz[i] = 1, cin >> x[i] >> y[i];
    for (int i = 1; i <= n; i++) {
        for (int j = i+1; j <= n; j++) {
            dis[i][j] = cal(i,j);
            pq.push({cal(i,j), i, j});
        }
    }
    fill(alive+1, alive+n+1, 1);

    int cnt = 0;
    int cur = n;
    while (cnt < n-1) {
        Node nd = pq.top(); pq.pop();
        if (getdis(nd.a,nd.b) != nd.d) continue;
        int a = nd.a, b = nd.b;
        if (!alive[a] || !alive[b]) continue;
        sz[++cur] = sz[a] + sz[b];
        alive[a] = alive[b] = 0;
        alive[cur] = 1;
        
        for (int c = 1; c < cur; c++) {
            if (!alive[c]) continue;
            dis[c][cur] = getdis(a, c) + getdis(b, c);
            pq.push({dis[c][cur], c, cur});
        }

        cout << sz[cur] << endl;
        cnt++;
    }
}
```

{{% /fold %}}

### F. [Differences](https://qoj.ac/contest/1070/problem/5254?v=1)

{{% question 题意 %}}

给定 $n$ 个长度为 $m$ 的string，每个string只由 $ABCD$ 组成。

给定一个正整数 $k$，它们之中有且仅有一个 string $s_i$，使得

$$\forall j \neq i, \text{diff}(s_i,s_j) = k$$

找出这个 string $s_i$。

其中，$n,m \leq 10^5, n*m \leq 2\times 10^7$。

{{% /question %}}


{{% fold "题解" %}}

哈希的神奇用法。

{{% small %}}
![img](/images/100/1.png)
{{% /small %}}

看这张图，我们可以预处理出每一列选了 $A,B,C,D$ 的index。

比如在图上，第 $0,2$ 个string分别为 $AB,AB$，所以 $j=0$ 的时候 $f(0,A) = \\{0,2\\}$，同理 $f(0,C) = \\{3,4,5\\}$

我们可以知道 $F = f(j,A) + f(j,B) + f(j,C) + f(j,D) = \\{0,1,2,...,n-1\\}$

所以我们枚举每一位 $j$ 选择的字母 $m$ 时，就可以得到一个mask $F - f(j,m)$，我们将每一位的mask加起来可以得到一个总的mask。

我们只要这个mask $= [k,k,k,...0,k,k,k]$ （第 $i$ 位为 $0$ 即可）。

<hr>

怎么表示一个mask呢？用哈希！

比如 $\\{0,2\\}$ 就表示为 $p^0 + p^2$

所以只要最后得到的mask等于 $k * (p^0+p^1+...+p^{n-1}) - k * p^i$ 即可。



{{% /fold %}}


{{% fold "代码" %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
int n,m,k;
string s[maxn];

Z f[maxn][4];  // f[i][j]: 第i列选字母j的mask
int p = 31;
Z p2[maxn];
int main() {
    fastio;
    cin >> n >> m >> k;
    for (int i = 1; i <= n; i++) {
        cin >> s[i];
    }
    p2[0] = 1;
    for (int i = 1; i <= 1e5; i++) p2[i] = p2[i-1] * p;


    Z all = 0;
    for (int i = 1; i <= n; i++) all += p2[i];
    for (int j = 0; j < m; j++) {
        for (int i = 1; i <= n; i++) {
            int o = s[i][j] - 'A';
            f[j][o] += p2[i];
        }
        for (int o = 0; o < 4; o++) f[j][o] = all - f[j][o];
    }

    for (int i = 1; i <= n; i++) {
        // tar: k * p^1 + k * p^2 + ... + k * p^n - k * p^i
        Z tar = (all - p2[i]) * k;
        for (int j = 0; j < m; j++) {
            int o = s[i][j] - 'A';
            tar -= f[j][o];
        }
         if (tar.val() == 0) {
            cout << i << "\n";
            return 0;
        }
    }
}
```

{{% /fold %}}
