+++
title = 'HDU Contest 1 解题报告'
date = 2021-04-07T21:24:21+08:00
draft = true
categories = ['解题报告']
tags = ['']
+++

友情出场本次HDU新生赛，题目质量一如既往的优秀。写一下解题报告吧。

## 题目 & 题解

[题目PDF](/files/038/HDU-contest1.pdf)

[题解PDF](/files/038/HDU-contest1-solution.pdf)

## Q1 选课

{{% question 题意 %}}

有一些学生档案，每个档案上记录了某一名学生选修的 互不相同的 $3$ 门课 $a,b,c$。学校总共有 $m$ 种选修课。

给出 $n$ 个询问，格式如下：

$1 ~ a ~ b ~ c$：代表加入一个学生档案，他选修了 $a,b,c$ 这三门课。

$2 ~ a ~ b$：询问当前已经加入档案中的学生，选修了 $a,b$ 之中恰好一门 的人数。

对于每一个询问 $2$，输出一行答案即可。

其中，$3 \leq n,m \leq 5 \times 10^5, 1 \leq a,b,c \leq m$

{{% /question %}}

{{% fold "题解" %}}

简单容斥。

选修 $a,b$ 之中恰好一门 $=$ 选修 $a$ $+$ 选修 $b$ $-$ 同时选修 $a,b$ 

所以记录一下同时选修 $2$ 门的数量就好。

• 注意，记录的时候使用 $m$ 个 `unordered_map()` ，不要把所有的 `pair` 放在一起，否则容易 $TLE$。

{{% /fold %}}


{{% fold 代码 %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn = 5e5+5;

int n, m, cnt[maxn];
unordered_map<int, int> mp[maxn];
int a[3];

int main() {
    scanf("%d%d",&n,&m);
    while (n--) {
        int op;
        scanf("%d",&op);
        if (op == 1) {
            scanf("%d%d%d",&a[0],&a[1],&a[2]);
            sort(a, a+3);
            for (int i = 0; i < 3; i++) {
                cnt[a[i]]++;
                for (int j = i+1; j < 3; j++) {
                    mp[a[i]][a[j]]++;
                }
            }
        } else {
            scanf("%d%d",&a[0],&a[1]);
            sort(a, a+2);
            int ans = cnt[a[0]] + cnt[a[1]] - 2 * mp[a[0]][a[1]];
            printf("%d\n", ans);
        }
    }
}
```

{{% /fold %}}

## Q2 善良的出题人

{{% question 题意 %}}

给定 $n$ 个正整数 $a_1,a_2,...,a_n$，求 $\text{lcm}(a_1,a_2,...,a_n)$。答案对 $10^9+7$ 取模。

其中，$n \leq 1.5 \times 10^6, 1 \leq a_i \leq 10^7$

{{% /question %}}

{{% fold "题解" %}}

很明显的质因数分解。但是复杂度看起来不太对：$n \sqrt{(a_i)} = 4 \times 10^9$

这里，我们要用到 $\log a_i$ 复杂度的质因数分解！

主要原理是：在 **欧拉筛** 过程中，我们可以得到每个数字的 **最小质因子**，所以我们预处理出 $1$ 到 $10^7$ 的所有数字的最小质因子。在分解 $a_i$ 的时候，**不断除掉最小质因子即可**。

复杂度：$n \log a_i$

{{% /fold %}}


{{% fold 代码 %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn = 1e7+5;

bool p[maxn];
int n, primes[maxn], tail = 0, cnt[maxn], small[maxn];
// small[i] 代表数字 i 的最小质因子

void init() {
    fill(p, p+maxn, 1);
    small[1] = 1;
    for (int i = 2; i < maxn; i++) {
        if (p[i]) primes[++tail] = i, small[i] = i;
        for (int j = 1; j <= tail; j++) {
            int cur = i * primes[j];
            if (cur >= maxn) break;
            p[cur] = 0;
            small[cur] = primes[j];  // 最小质因子
            if (i % primes[j] == 0) break;
        }
    }
}

ll qpow(ll a, ll b) {
    ll res = 1;
    while (b) {
        if (b&1) (res *= a) %= mod;
        b >>= 1;
        (a *= a) %= mod;
    }
    return res;
}

int main() {
    init();
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        int a; scanf("%d", &a);
        while (a > 1) {
            int sp = small[a];
            int c = 0;
            while (a % sp == 0) a /= sp, c++;
            cnt[sp] = max(cnt[sp], c);
        }
    }
    ll ans = 1;
    for (int i = 2; i < maxn; i++) {
        ans = (ans * qpow(i, cnt[i])) % mod;
    }
    cout << ans << endl;
}
```

{{% /fold %}}

## Q3 买路钱

{{% question 题意 %}}

给定 $N$ 个节点，$M$ 个边的 **无向图**。图中不存在重复边，也不存在自环。并且，保证图连通。

初始状态下，所有的edge权值均为 $1$。

现在给出 $Q$ 次修改，每次修改将 第 $R_j$ 条edge的权值 改为 $2$，保证每次修改的edge互不相同。 

令 $d_x$ 为：在**所有修改操作之前**，节点 $x$ 距离 节点 $1$ 的最短路径长度。

进行一次修改后，令 $d_x'$ 为：**此时** 节点 $x$ 距离 节点 $1$ 的最短路径长度。

对于每一次修改，我们需要输出本次修改后，$d_x' > d_x$ 的节点数量。

其中，$2 \leq N \leq 10^5, 1 \leq Q \leq M \leq 2 \times 10^5, 1 \leq R_j \leq M$

{{% /question %}}

{{% fold "题解" %}}

首先发现权值均为 $1$，我们就可以用 `bfs()` 求出初始的最短路径了。

对于每次修改，我们需要看一下：本次修改都影响了哪些节点？

但是，我们很难直接看出每次修改影响的节点，如果在整个图上跑最短路复杂度又太高。

<hr>

注意到，因为原图的最短路来自 `BFS`，而我们又只关心，$u$ 距离 $1$ 的最短路径 **是否比初始状态的大**。

所以我们只要看，对于修改的一条边 $(u,v)$，$u$ 和 $v$ 的最短路径是否必须经过 $(u,v)$ 即可。

那么，对于修改 $(u,v)$ 的权值为 $2$，我们可以直接等效替换为：**将 $(u,v)$ 从图中删除**。

在删除过后，看哪些节点 距离 $1$ 的最短路长度变长了即可（如果不再连通到 $1$，直接令长度为 $inf$）。


> 证明：删除边 $(u,v)$ $=$ 修改权值？
 
 分两种情况讨论：
 
 1. $u$ 的最短路径长度 **没有改变**：这说明 $u$ 当前的最短路径并不需要经过 $(u,v)$，所以无论是删除，还是增加权值，都一样。
 而对于其他的节点，因为 $u$ 都没受到影响，所以它们也不会受到影响，即答案不变。
 <br>
 
 2. $u$ 的最短路径长度 **增加了**：说明 $u$ 原先的最短路径必须经过 $(u,v)$，那么删掉 $(u,v)$ 就保证了最短路径一定无法经过 $(u,v)$。而给 $(u,v)$ 增加权值，$u$ 的新最短路径要么不经过 $(u,v)$（和删除一样），要么仍然经过 $(u,v)$（这样的话，在删除操作中，就说明 $u$ 与 $1$ 断开了）。所以删除和增加权值仍然等效。对于其他的节点，同理。

<hr>

等效为删除以后，我们发现本题仍然不好做！

**正难则反**，我们不如考虑反过来处理，我们把对应的边删掉，然后从后往前，**开始加边**。

我们每次加上一条边 $(u,v)$，都会有如下性质：

1. 如果在加上这条边之前， $u$ 已经有 $d_u' = d_u$ 了，则 $u$ 对其他节点不会产生任何影响。
2. 如果 $d_u'$ 变小了，那说明 $d_u' = d_v' + 1$
3. 如果 $d_u'$ 变小了，那么在变小后，只有 $d_u' = d_u$ 时，$u$ 才会对其他节点产生 **有效影响**。

> 证明上述性质：
 
 证明性质 $1$：$u$ 对其他节点产生影响的话，说明 $u$ 的最短路径缩短了（说明 $d_u'$ 变小了），如果在加上这条边之前已经有 $d_u' = d_u$，则 $d_u'$ 无法变得更小，所以无法产生影响。
 
 证明性质 $2$：$d_u'$ 如果变小，说明新的最短路径通过了 $(u,v)$，所以 $d_u' = d_v' + 1$
 
 证明性质 $3$：**有效影响** 指的是：在增加 $(u,v)$ 以后，其他的某个节点 $x$ 的 $d_x'$ 变小，且 $d_x' = d_x$。如果 $d_u'$ 变小，但是仍然有 $d_u' > d_u$，则其他节点 $x$ 不可能通过 $u$ 来获取原先的最短路径 $d_x$，所以 $u$ 无法对其他节点产生有效影响。

<hr>

由上，我们的算法就有了：

1. 先建好完整的图，跑一次 `BFS` 得到所有节点距离 $1$ 的最短距离。
2. 清空图，将所有 **未修改** 的边加到图中。
3. 从后向前的顺序，进行 **加边** 操作，当加上 $(u,v)$ 时，看一下是否存在 $u$ 使得 $d_u'$ 减小，且 $d_u' = d_u$，如果有，更新 $u$ 所有 neighbor 的 $d_x'$ 值，再继续判断上述条件（这是一个递归的操作）。

复杂度：因为每个节点 $u$ 最多只需要更新一次 $d_u'$，每次更新会判断它的所有neighbor，所以复杂度为 $O(n+m)$

{{% /fold %}}


{{% fold 代码 %}}

```cpp
#include <bits/stdc++.h>
using namespace std;

const int maxn = 1e5+5;
const int maxm = 2e5+5;

int n,m,Q, head[maxn], ecnt = 1, ans[maxn], d[maxn];
bool vis_plan[maxm];
struct Edge {
    int to, nxt;
} edges[maxm<<1];

struct Query {
    int u,v;
} query[maxm];
int plan[maxm];  // plan[i] 代表第i年要提升的query编号

void addEdge(int u, int v) {
    Edge e = {v, head[u]};
    edges[ecnt] = e;
    head[u] = ecnt++;
}

void clear() {
    fill(head, head+maxn, 0);
    ecnt = 1;
}

int curans;  //一开始有n-1个村庄不满

// 村庄u满意了，更新它的所有neighbor
void update(int u) {
    d[u] = ans[u];
    curans--;
    for (int e = head[u]; e; e = edges[e].nxt) {
        int to = edges[e].to;
        if (d[to] != ans[to] && d[u] + 1 == ans[to]) {
            update(to);  // 递归更新
        }
    }
}

// 加上第c条边，并且更新d[]
void add(int c) {
    int u = query[c].u, v = query[c].v;
    addEdge(u, v); addEdge(v, u);
    if (d[u] != ans[u] && d[v] + 1 == ans[u]) { // 更新后，u得到了最短路
        update(u);
    }
    if (d[v] != ans[v] && d[u] + 1 == ans[v]) {
        update(v);
    }
}

int q[maxn], hd = 0, tail = -1;
void init() {
    cin >> n >> m >> Q;
    fill(ans, ans+maxn, 1e9);
    fill(d, d+maxn, 1e9);
    ans[1] = 0;
    d[1] = 0;
    curans = n-1;

    for (int i = 1; i <= m; i++) {
        int u,v; cin >> u >> v;
        addEdge(u, v); addEdge(v, u);
        query[i] = {u,v};
    }
    q[++tail] = 1;
    while (hd <= tail) { //bfs
        int cur = q[hd++];
        for (int e = head[cur]; e; e = edges[e].nxt) {
            int to = edges[e].to;
            if (ans[to] == 1e9) {
                ans[to] = ans[cur] + 1;
                q[++tail] = to;
            }
        }
    }

    clear();  // 去掉所有的边
    for (int i = 1; i <= Q; i++) {
        int a; cin >> a;
        plan[i] = a;
        vis_plan[a] = 1;  // 这条边暂时被删去，之后才加上
    }
    for (int i = 1; i <= m; i++) {
        if (!vis_plan[i]) {
            add(i);
        }
    }
}

int ask_ans[maxm];  // 第i个询问的答案
int main() {
    init();
    for (int i = Q; i >= 1; i--) {
        ask_ans[i] = curans;
        add(plan[i]);
    }
    for (int i = 1; i <= Q; i++) {
        cout << ask_ans[i] << "\n";
    }
}
```

{{% /fold %}}


## Q4 cake

{{% question 题意 %}}

给定一个 $n \times m$ 的矩形，左上角为 $(0,0)$，右下角为 $(n,m)$。

现有 $k$ 个修改操作，有两种类型：

$line ~ x$：在 $[0,m]$ 的轴上切一条直线 $x$。

$row ~ y$：在 $[0,n]$ 的轴上切一条直线 $y$。

每次修改操作后，求最大的子矩形？

数据保证所有修改互不相同。

其中，$0 \leq n,m \leq 10^6, 0 \leq k \leq n+m-2, 1 \leq x < m, 1 \leq y < n$

{{% /question %}}

{{% fold "题解" %}}

问题转化一下，我们可以维护两个**有序数组** $a, b$，初始状态下 $a = [0,m], b = [0,n]$

$line ~ x$ 代表给数组 $a$ 添加一个元素 $x$，而 $row ~ x$ 代表给 $b$ 添加元素 $x$。

每次添加元素后，我们要找到 $a$ 中相邻元素的最大差值 $d_a$，还有 $b$ 中相邻元素的最大差值 $d_b$。

则，本次修改操作后的答案为 $d_a \times d_b$。

<hr>

所以一个非常简单的思路是 维护 $2$ 个 `map<int,int>` 来代表有序数组 $a,b$。然后再用 $2$ 个 `map<int, int>` 来维护 $a,b$ 中的差值。每次添加元素，都更新一下 **差值 `map`**。

复杂度：$O(n\log n)$，会 $TLE$。

<hr>

**正难则反** 的思想第二次出现了。我们可以把询问反过来做。

相当于我们先把所有的数字放进 $a,b$ 之中，然后从后往前处理询问，相当于每次从数组中拿走一个元素。

$a,b$ 可以用 **链表思想** 进行维护，这样删除一个元素和计算新差值的时间就是 $O(1)$ 了。

但是 $a,b$ 内是有序的，排序仍然需要 $O(n \log n)$ 的时间。

注意到 $a,b$ 内所有的元素都 $\leq 10^6$，所以直接使用 **桶排序（bucket sort)** 即可在 $O(n)$ 完成排序。

复杂度：$O(n+m+k)$

{{% /fold %}}


{{% fold 代码 %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn = 1e6+2;

// 桶排序：将所有元素放进一个 cnt[] 数组内，然后从小到大遍历 cnt[] 数组即可
void bucket_sort(int* arr, int len) {
    static int cnt[maxn];
    for (int i = 1; i <= len; i++) cnt[arr[i]]++;
    int ptr = 0;
    for (int i = 0; i <= 1e6; i++) {
        while (cnt[i] > 0) {
            cnt[i]--;
            arr[++ptr] = i;
        }
    }
}

int n,m,k;
char op[5];
int arr[2][maxn], pos[2][maxn], pre[2][maxn], nxt[2][maxn], tail[2];
ll ans[maxn<<1], maxd[2];  // max diff

// pos[id][val]: val 所在 arr[id] 中的位置
// pre[id][j]: index j的前一个数字的index
// nxt[id][j]: index j的后一个数字的index

struct Query {
    int id, val;
} q[maxn<<1];

int main() {
    scanf("%d%d%d",&n,&m,&k);
    arr[0][1] = arr[1][1] = 0;
    arr[0][2] = m, arr[1][2] = n;
    tail[0] = tail[1] = 2;
    for (int i = 1; i <= k; i++) {
        scanf("%s", op);
        int a, id; scanf("%d", &a);
        if (op[0] == 'l') id = 0;
        else id = 1;

        q[i] = {id, a};
        arr[id][++tail[id]] = a;
    }
    for (int id = 0; id <= 1; id++) {
        bucket_sort(arr[id], tail[id]);
        for (int i = 1; i <= tail[id]; i++) {
            pos[id][arr[id][i]] = i;
            pre[id][i] = i-1, nxt[id][i] = i+1;
            maxd[id] = max(maxd[id], arr[id][i+1] - arr[id][i]);
        }
    }

    for (int i = k; i >= 1; i--) {
        ans[i] = maxd[0] * maxd[1];
        int id = q[i].id, val = q[i].val;
        int p = pos[id][val];
        int pr = pre[id][p], ne = nxt[id][p];
        maxd[id] = max(maxd[id], arr[id][ne] - arr[id][pr]);
        nxt[id][pr] = ne, pre[id][ne] = pr;  // 链表删除元素的更新
    }
    for (int i = 1; i <= k; i++) printf("%lld\n", ans[i]);
}
```

{{% /fold %}}


## Q5 半精灵数

{{% question 题意 %}}

给定 $L,R,p$，求 $[L,R]$ 之间，**恰好满足以下条件之一** 的数字数量：

1. 能被 $p$ 整除
2. 数字中含有 $p$

其中，$1 \leq L \leq R \leq 10^{18}, 1 \leq p \leq 9$，有 $T \leq 10^5$ 个 testcase。

{{% /question %}}

{{% fold "题解" %}}

数位dp比较模版的题目。

令 $dp[i][j][k]$ 为：我们当前到了第 $i$ 位，数字 $mod ~ p = j$，数字内含有 $p$ 与否（含有：$k=1$）。

然后，我们离线化处理一下所有的询问，按照 $p$ 的值进行分类，这样可以只 `memset()` $9$ 次。

> 注：也可以在 `dp[]` 数组里面，额外加一个维度，表示 `p` 的值，这样就不用离线处理询问了。

{{% /fold %}}


{{% fold 代码 %}}

```cpp
#include <bits/stdc++.h>
using namespace std;

ll dp[20][9][2];  // dp[i][j][k]: 到第i位，mod p = j, 含有p与否 (k = 1/0) 的数量
int arr[20], n, p;

ll dfs(int i, int j, int k, bool limit) {
    if (i <= 0) {
        if (j == 0 && !k) return 1;
        if (j != 0 && k) return 1;
        return 0;
    }
    if (!limit && dp[i][j][k] != -1) return dp[i][j][k];
    int ed = 9;
    if (limit) ed = arr[i];
    ll res = 0;
    for (int c = 0; c <= ed; c++) {
        res += dfs(i-1, (j*10+c)%p, k||(c == p), limit && (c == ed));
    }
    if (!limit) dp[i][j][k] = res;
    return res;
}

ll solve(ll x) {
    n = 0;
    while (x) {
        arr[++n] = x % 10;
        x /= 10;
    }
    return dfs(n, 0, 0, 1);
}

struct Query {
    int id;
    ll L,R;
};
vector<Query> q[10];
ll ans[maxn];

int main() {
    int T; cin >> T;
    for (int i = 1; i <= T; i++) {
        ll L, R; cin >> L >> R >> p;
        q[p].push_back({i, L, R});
    }
    for (p = 1; p <= 9; p++) {
        memset(dp, -1, sizeof(dp));
        for (auto que : q[p]) {
            ll L = que.L, R = que.R;
            ans[que.id] = solve(R) - solve(L-1);
        }
    }
    for (int i = 1; i <= T; i++) cout << ans[i] << "\n";
}
```

{{% /fold %}}


## Q6 Mess

{{% question 题意 %}}

给定 $n$ 个正整数 $a_1,a_2,...,a_n$，每次可以选择一个元素 $a_i$，进行以下操作之一：

1. $a_i = a_i \times 2$
2. $a_i = \lfloor \frac{a_i}{2} \rfloor$

求最少操作次数，使得所有元素相同？

其中，$1 \leq n, a_i \leq 10^6$

{{% /question %}}

{{% fold "题解" %}}

我们发现，这两种操作，分别是二进制 **左移 和 右移**。

并且我们发现，无论是左移还是右移，一个数字二进制中， $1$ 的数量都**只能减少，而不能增加**。

我们设最终的答案为 $x$（最后所有元素等于 $x$），那么 $x$ 的二进制中 $1$ 的数量，必须 $\leq \min\limits_i \\{ count(a_i) \\}$

我们随便选一个 **二进制中 $1$ 的数量最少的数**，令其为 $a_k$。

因为 $x$ 必然由 $a_k$ 移动而来，所以我们只要移动 $a_k$，就可以枚举答案 $x$。

<hr>

问题转化为：已知最终答案为 $x$，如何求出操作次数？

我们再次利用了 $1$ 的数量只减不增的特点，对于每一个 $a_i$，我们都观察一下 $a_i$ 中 $1$ 的数量，分两种情况：

1. $count(a_i) > count(x)$：那么我们右移 $a_i$，直到 $count(a_i) = count(x)$。
2. $count(a_i) = count(x)$：看一下是否可以通过移动 $a_i$ 得到 $x$。（即，它们其中一个是否为另外一个的 $2^j$ 次方）。如果不能通过移动得到，就说明这个 $x$ 是非法的。

对于情况 $2$，我们可以预处理出所有 $2^j$ 对应的 $j$。

• 注意，无论什么情况下，都必然有解。因为 $x = 1$ 一定有解！

复杂度：$O(nlog^2n)$

{{% /fold %}}


{{% fold 代码 %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn = 1e6+5;

int n;
struct node {
    int cnt, val;
} arr[maxn];

int count_bit(int x) {
    int res = 0;
    while (x) {
        if (x&1) res++;
        x >>= 1;
    }
    return res;
}

int ans = 2e9;
map<int, int> mp;
void solve(int x, int t) {
    int res = 0;
    for (int i = 1; i <= n; i++) {
        int v = arr[i].val;
        int c = arr[i].cnt;
        while (c > t) {  // Case1
            if (v & 1) c--;
            v >>= 1;
            res++;
        }

        // Case2
        if (v < x) {
            if (x % v) return;
            if (!mp.count(x/v)) return;
            res += mp[x/v];
        } else {
            if (v % x) return;
            if (!mp.count(v/x)) return;
            res += mp[v/x];
        }
    }
    ans = min(ans, res);
}

int main() {
    scanf("%d", &n);
    int mincnt = 1e9, mini;
    for (int i = 1; i <= n; i++) {
        scanf("%d", &arr[i].val);
        arr[i].cnt = count_bit(arr[i].val);
        if (arr[i].cnt < mincnt) {
            mincnt = arr[i].cnt;
            mini = i;
        }
    }
    for (int j = 0; (1<<j) <= 2e6; j++) {
        mp[(1<<j)] = j;
    }

    for (int v = arr[mini].val; v <= 2e6; v <<= 1) {
        solve(v, count_bit(v));
    }
    for (int v = arr[mini].val >> 1; v >= 1; v >>= 1) {
        solve(v, count_bit(v));
    }
    cout << ans << endl;
}
```

{{% /fold %}}


## 总结

$Q2$ 善良的出题人

利用欧拉筛，预处理出所有数字的最小质因子，达到 $O(n \log n)$ 的质因数分解。

$Q3$ 买路钱

1. 将增加边的权值，转化为删边。
2. 删边不好处理，将 **询问反过来**，变成加边。

$Q4$ Cake

1. 将 **询问反过来**，添加元素变成删除元素。
2. 删除元素利用 **链表思想**，$O(1)$ 时间维护新差值。
3. 排序使用 bucket sort 可以达到 $O(n)$。

$Q5$ 半精灵数

在数位DP中，离线根据 $p$ 的值处理询问，能大幅减少 `memset()` 的次数。

$Q6$ Mess

对于 **枚举最终答案** 的题目，一般常见的套路有：

1. 二分/三分 搜索
2. 根据题目性质，缩小答案可能的范围。（本题就是这个思想）