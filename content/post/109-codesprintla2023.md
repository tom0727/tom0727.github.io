+++
title = 'CodeSprint UCLA 2023'
date = 2023-05-22T10:56:21-05:00
draft = false
categories = ['解题报告']
tags = ['', '']
+++


### L. [Blooper Game](https://codesprintla23.kattis.com/contests/codesprintla23open/problems/codesprintla23.bloopergame)

{{% question 题意 %}}

给定 $n$ 个概率 $S_1, S_2, ..., S_n$，同时给定一个实数 $P \in (0,1)$。

现在有 $L$ 次操作机会，每次操作可以选择一个 $S_i$，让 $S_i = (S_i)^P$。

求操作结束后，所有概率乘起来得到的最大值？

其中，$n \leq 10^5, L \leq 10^9, S_i \in (0,1]$。

{{% /question %}}


{{% fold "题解" %}}

很巧妙的思路。

如果我们一次次分配，显然是用一个 pq 每次优先操作当前最小的那个概率。但 L 太大了怎么办？

考虑 pigeon-hole principle。无论我们怎么分配这些操作次数，至少有一个 $S_i$ 会被分配到 $\lceil \frac{L}{n} \rceil$ 次。显然，我们仍然选择当前最小的那个概率执行这些操作。

而我们知道一个概率 $x$ 被操作 $k$ 次，得到的值就是 $x^{P^k}$，这个用快速幂就可以实现。

取 $L=10^9, n=10^5$ 可以发现，这样我们只会至多操作 $10^6$ 次。

所以按照这个 pq 思路就行，利用 pigeon-hole principle 大幅度减少了操作次数。

{{% /fold %}}


{{% fold "代码" %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn = 1e5+5;

int n, L;
long double P, S[maxn];
long double pp[31];  // pp[i]: P^(2^i)

// 返回 P^k
long double qpow(int k) {
    if (!k) return 1;
    long double res = 1;
    for (int j = 30; j >= 0; j--) {
        if (k & (1<<j)) {
            res *= pp[j];
        }
    }
    return res;
}

// 将一个概率 x, 执行 k 次 pow 操作，返回的值应该是 x ^ (P^k)
long double po(long double x, int k) {
    // long double p = qpow(P, k);
    long double p = qpow(k);
    return pow(x, p);
}
// 返回 x 的执行k次pow操作的值
long double get(long double x, int k) {
    if (k == 0) return x;
    return po(x, k);
}

int main() {
    fastio;
    cin >> n >> L >> P;
    for (int j = 1; j <= 30; j++) pp[j] = qpow(P, (1<<j));
    pp[0] = P;

    priority_queue<long double, vector<long double>, greater<long double>> pq;
    for (int i = 1; i <= n; i++) cin >> S[i], S[i] = 1/S[i], pq.push(S[i]);
    while (L) {
        int use = (L + n - 1) / n;  // ceil(L/n)
        auto d = pq.top(); pq.pop();
        d = get(d, use);
        pq.push(d);
        L -= use;
    }
    long double res = 1;
    while (pq.size()) res *= pq.top(), pq.pop();
    cout << setprecision(10) << res << "\n";
}
```

{{% /fold %}}


### M. [Toads](https://codesprintla23.kattis.com/contests/codesprintla23open/problems/codesprintla23.toads)

{{% question 题意 %}}

给定一个 $n$ 个点的图，有 $n$ 条边，每条边有边权 $w_i$。

现在加上 $L$ 条额外的带权边。

然后给定 $Q$ 个询问，每次询问 $a,b$ 两个点之间的最短距离。

其中，$n,Q \leq 10^5, L \leq 7, 1 \leq w_i \leq 10^9$，无自环，可能有重边，图可能不联通。

{{% /question %}}


{{% fold "题解" %}}

注意到 $n$ 个点和 $n$ 条边！基环树吗？错误的，这只是个误导。

又注意到 $L \leq 7$。

对于每一个联通分量，我们可以求出一个生成树，然后两个点在生成树上的最短距离很好算。不过任意一个联通分量中，由一个生成树加上至多 $L+1$ 条边组成。

所以两点 $(u,v)$ 间的最短路如果因为一个额外的边 $(a,b)$ 更优了，那么这个最短路肯定经过了 $(a,b)$ 这条边，也就是经过了 $a$ 这个点。

那么我们从 $a$ 开始跑一个 dijkstra，然后 $u,v$ 之间的最短路要么是树上的距离，要么是 $d(u,a) + d(v,a)$，取最小值即可。

<hr>

实现的时候有一些需要注意的点：

1. 处理重边的时候我们只保留最小的权值即可，一开始先读入所有的边，把所有的边sort一下，再加入图中。
2. 我们不必区分这 $L$ 条新边，把它们全都当成普通边来看即可，用 dfs 树跑一个生成树出来，剩下的非树边就是额外的边。
3. 对于每一个非树边 $(a,b)$，我们只需要从 $a$ 跑 dijkstra 即可，$b$ 不用跑（否则会T）。
4. 注意到每个联通分量都至少有 $1$ 条非树边。总的非树边数量是 $M + L$，$M$ 为联通分量的数量。然而对于 dijkstra 来说我们需要储存 $a$ 到每个点的距离，所以储存 $M+L$ 个 dijkstra 的数组显然会 MLE。所以我们需要根据联通分量，一个个处理（我的方式是离线询问）。

{{% /fold %}}


{{% fold "代码" %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn = 1e5+55;
const int maxm = 4e4+55;

struct Edge {
    int u, v, w;
};
int n;
vector<Edge> adj[maxn];
vector<Edge> edges;
bool vis[maxn];

int par[maxn][18], de[maxn], from[maxn];  
ll dep[maxn];
vector<Edge> nontree;

int jump(int x, int d) {
    for (int j = 17; j >= 0; j--) {
        if (d&(1<<j)) x = par[x][j];
    }
    return x;
}

int LCA(int u, int v) {
    if (from[u] != from[v]) return -1;
    if (de[u] < de[v]) swap(u, v);
    int d = de[u] - de[v];
    u = jump(u, d);
    if (u == v) return u;
    for (int j = 17; j >= 0; j--) {
        if (par[u][j] != par[v][j]) u = par[u][j], v = par[v][j];
    }
    return par[u][0];
}

int cid = 0;

ll treedis(int u, int v) {
    int x = LCA(u,v);
    if (x == -1) return -1;
    return dep[u] + dep[v] - 2 * dep[x];
}

void dfs(int u, int p) {
    from[u] = cid;
    vis[u] = 1;
    de[u] = de[p] + 1;
    par[u][0] = p;
    for (int j = 1; j < 18; j++) par[u][j] = par[par[u][j-1]][j-1];

    for (auto& [_, v, w] : adj[u]) {
        if (v == p) continue;
        if (vis[v]) {
            if (de[u] < de[v]) nontree.push_back({u,v,w});
        } else {
            dep[v] = dep[u] + w;
            dfs(v, u);
        }
    }
}

struct Node {
    int v;
    ll d;
    bool operator<(const Node& other) const {
        return d > other.d;
    }
};

struct Dijkstra {
    int x;
    ll dis[maxn];
    priority_queue<Node> pq;
    void run() {
        memset(dis, -1, sizeof(dis));
        memset(vis, 0, sizeof(vis));
        pq.push({x, 0});
        dis[x] = 0;
        while (pq.size()) {
            auto [u, d] = pq.top(); pq.pop();
            if (vis[u]) continue;
            vis[u] = 1;
            for (auto [_, v, w] : adj[u]) {
                if (dis[v] == -1 || dis[v] > dis[u] + w) {
                    dis[v] = dis[u] + w;
                    pq.push({v, dis[v]});
                }
            }
        }
    }
};
vector<Dijkstra> vec;
struct Query {
    int u, v, cid, id;
};
ll ans[maxn];

int main() {
    fastio;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        int u = i, v, w; cin >> v >> w;
        if (u > v) swap(u, v);
        edges.push_back({u,v,w});
    }
    int L; cin >> L;
    for (int _ = 0; _ < L; _++) {
        int u, v, w; cin >> u >> v >> w;
        if (u > v) swap(u, v);
        edges.push_back({u,v,w});
    }

    sort(edges.begin(), edges.end(), [](auto a, auto b) {
        if (a.u == b.u) {
            if (a.v == b.v) return a.w < b.w;
            return a.v < b.v;
        }
        return a.u < b.u;
    });

    for (int i = 0; i < edges.size(); i++) {
        if (i > 0 && edges[i].u == edges[i-1].u && edges[i].v == edges[i-1].v) continue;
        auto [u, v, w] = edges[i];
        adj[u].push_back({u,v,w});
        adj[v].push_back({v,u,w});
    }
    for (int i = 1; i <= n; i++) {
        if (!vis[i]) cid++, dfs(i, 0);
    }

    // nontree 里面已经按照 cid 排好了
    int Q; cin >> Q;
    vector<Query> que;

    for (int i = 1; i <= Q; i++) {
        int u, v; cin >> u >> v;
        int cid = -1;
        if (from[u] == from[v]) cid = from[u];
        que.push_back({u, v, cid, i});
    }

    sort(que.begin(), que.end(), [](auto a, auto b) {
        return a.cid < b.cid;
    });

    int idx = -1;
    for (auto [u, v, curid, id] : que) {
        if (curid == -1) ans[id] = -1;
        else {
            // 判断一下这个 cid 的dijkstra是否都被处理完了
            if (vec.size() && from[vec[0].x] == curid) {  // 处理完了，无需处理
                
            } else {
                vec.clear();
                while (idx + 1 < nontree.size() && from[nontree[idx+1].u] < curid) idx++;
                while (idx + 1 < nontree.size() && from[nontree[idx+1].u] == curid) {
                    Dijkstra di;
                    di.x = nontree[idx+1].u;
                    di.run();
                    vec.push_back(di);
                    idx++;
                }
            }

            ans[id] = treedis(u, v);
            assert(vec.size() <= L+1);
            for (auto& di : vec) {
                assert(from[u] == from[di.x]);
                ans[id] = min(ans[id], di.dis[u] + di.dis[v]);
            }
        }
    }

    for (int i = 1; i <= Q; i++) cout << ans[i] << "\n";
}
```

{{% /fold %}}
