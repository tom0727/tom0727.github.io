+++
title = 'ICPC2020 Mid Central USA'
date = 2022-09-13T14:05:04-05:00
draft = false
categories = ['题解']
tags = ['', '']
+++

### [I. Trip Tik](https://vjudge.net/contest/514913#problem/I)

{{% question 题意 %}}

给定一个坐标轴，坐标轴上有 $n$ 个点，每个点坐标 $x_i$ 互不相同。每个点 $i$ 都有一个重要性 $w_i$，其中第 $i$ 个点的重要性 $w_i = i$。

现在有一个视野范围和视野中心，初始情况下视野中心为 $0$，视野范围是 $[-1,1]$。

在视野中，只能看见前 $k$ 个最重要的点。

每一步可以进行如下操作之一：

1. Zoom Out: 将视野范围扩大 $2$ 倍。
2. Zoom In: 将视野范围缩小 $2$ 倍。
3. Change Center: 改变视野中心到一个点 $i$，这个操作要求点 $i$ 必须在之前的视野中可见。

现在对于每一个点，求出从初始情况 $\rightarrow$ 视野中心在这个点，并且能看见这个点所需要的最少操作次数，如果不可能输出 $-1$。

其中，$n \leq 10^5, |x_i| \leq 10^8, k \in [1,4]$。

{{% /question %}}

{{% fold "题解" %}}

BFS，定义一个状态为：$(x,d)$，其中 $x$ 代表当前的视野中心，$d$ 代表视野范围。

注意这种状态最多只有 $n * log(10^8) \leq 30n$ 种。

并且每个状态之间的转移也可以求出来，只要解决 **判断一个点是否在当前状态的视野中** 问题即可。

1. 预处理时，所有的点 sort 一下
2. 二分找到当前状态能看见的点的 index 范围 $[L,R]$。
3. 求 $a[L,R]$ 之间前 $k$ 重要的点。

注意 $k \leq 4$，这个问题可以直接用线段树来维护（每个 node 维护前 $4$ 重要的点，合并时也很简单）。

但这样太麻烦了，而且复杂度过高。

• 注意到 **ST表** 也可以解决这个问题，合并时同理（注意去重即可）。

• 最后注意一下视野范围可以最小来到 $[x_i-0.5, x_i+0.5]$。

最后答案就是从初始状态出发到每个状态的最短路（由于权值均为 $1$ 所以 BFS 找最短路即可）。

{{% /fold %}}


{{% fold "代码" %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn = 1e5+5;

int n;
struct Point {
    int x, w;
} arr[maxn];
const int M = 27;
int st_id[maxn][M+1];  // state to id
struct State {
    int x, d;  // center, dimension
};
State st[maxn*(M+1)];

const int MM = 21000000+23300;
const int N = 21000000+23300;
struct Edge {
    int to, nxt;
} edges[MM];
int head[N], ecnt = 1;
void addEdge(int u, int v) {
    Edge e = {v, head[u]};
    head[u] = ecnt;
    edges[ecnt++] = e;
}
queue<int> q;
bool vis[N];
int dis[N];
void bfs(int start) {
    memset(dis, -1, sizeof(dis));
    q.push(start);
    vis[start] = 1;
    dis[start] = 0;
    while (q.size()) {
        int u = q.front(); q.pop();
        for (int e = head[u]; e; e = edges[e].nxt) {
            int v = edges[e].to;
            if (!vis[v]) {
                vis[v] = 1;
                dis[v] = dis[u] + 1;
                q.push(v);
            }
        }
    }
}
bool good[maxn][M+1];  // 如果状态能看见自己，说明是ok的
int ans[maxn];


int bin[maxn];
vector<int> st_table[maxn][18];
vector<int> merge(const vector<int>& vec1, const vector<int>& vec2) {
    vector<int> res;
    for (int j : vec1) res.push_back(j);
    for (int j : vec2) res.push_back(j);
    sort(res.begin(), res.end(), [&](auto a, auto b) {
        return arr[a].w > arr[b].w;
    });
    vector<int> tmp;
    tmp.clear();
    if (res.size())
        tmp.push_back(res[0]);

    for (int i = 1; i < res.size(); i++) {
        if (res[i] != res[i-1] && tmp.size() <= 3) {
            tmp.push_back(res[i]);
        }
    }
    return tmp;
}

vector<int> ask_st(int l, int r) {
    if (l > r) return {};
    int len = r-l+1;
    int k = bin[len];
    vector<int> vec1 = st_table[l][k];
    vector<int> vec2 = st_table[r-(1<<k)+1][k];
    return merge(vec1, vec2);
}
 
void build_st() {
    bin[1] = 0; bin[2] = 1;
    for (int i = 3; i < maxn; i++) bin[i] = bin[i>>1] + 1;
    for (int i = 1; i <= n; i++) st_table[i][0] = {i};
    for (int k = 1; k < 18; k++) {
        for (int i = 1; i + (1<<k) - 1 <= n; i++) {
            st_table[i][k] = merge(st_table[i][k-1], st_table[i+(1<<(k-1))][k-1]);
        }
    }
}

int k;

int main() {
    fastio;
    cin >> n >> k;
    for (int i = 1; i <= n; i++) {
        cin >> arr[i].x;
        arr[i].w = i;
    }
    sort(arr+1, arr+n+1, [](auto a, auto b) {
        return a.x < b.x;
    });
    int cnt = 0;
    arr[n+1].x = 0;
    for (int i = 1; i <= n+1; i++) {
        for (int j = 0; j <= M; j++) {
            st_id[i][j] = ++cnt;
            st[cnt] = {arr[i].x, 1<<j};
        }
    }
    build_st();

    // build(1, 1, n);

    for (int i = 1; i <= n+1; i++) {
        for (int j = 0; j <= M; j++) {
            int id = st_id[i][j];
            int x = st[id].x, d = st[id].d;

            int low = 1, high = i, L = i, R = i;
            while (low <= high) {
                int mid = (low + high) >> 1;
                if (x - arr[mid].x <= d) {  // visible
                    high = mid-1;
                    L = mid;
                } else {
                    low = mid+1;
                }
            }

            low = i, high = n;
            while (low <= high) {
                int mid = (low + high) >> 1;
                if (arr[mid].x - x <= d) {
                    low = mid + 1;
                    R = mid;
                } else high = mid - 1;
            }


            if (i == n+1) {
                L = n, R = 1;                
                for (int t = 1; t <= n; t++) {
                    if (abs(arr[t].x) <= d) {
                        L = min(L, t);
                        R = max(R, t);
                    }
                }
            }

            // 现在找到了 [L,R]，只要找 [L,R] 中前k大的数字即可

            vector<int> res = ask_st(L, R);
            for (int t = 0; t < min((int)res.size(), k); t++) {
                int idx = res[t];
                if (idx > 0) {  // must have an important point!
                    int s_id = st_id[idx][j];

                    if (id != s_id) {
                        addEdge(id, s_id);  // 不同的点，同缩放情况 加边
                    }

                    if (idx == i) {
                        good[i][j] = 1;  // 这个状态下可以看见自己
                    }

                }
            }


            // 缩放之间加边
            if (j > 0) addEdge(id, st_id[i][j-1]);
            if (j < M) addEdge(id, st_id[i][j+1]);
        }
    }


    bfs(st_id[n+1][0]);
    for (int i = 1; i <= n; i++) {
        int d = 1e9;
        for (int j = 0; j <= M; j++) {
            if (good[i][j]) {
                int id = st_id[i][j];
                if (dis[id] >= 0) {
                    d = min(d, dis[id]);
                }
            } 
        }
        for (int j = 0; j <= M; j++) {
            int id = st_id[i][j];
            if (dis[id] >= 0) {
                d = min(d, dis[id] + j+1);
            }
        }
        if (d == 1e9) {
            ans[arr[i].w] = -1;
        } else ans[arr[i].w] = d;
    }
    for (int i = 1; i <= n; i++) cout << ans[i] << "\n";
}
```

{{% /fold %}}


### [G. Exciting Tournament](https://vjudge.net/contest/514913/problemPrint/G)

{{% question 题意 %}}

有 $n$ 个参赛者，每个参赛者 $i$ 有一个skill level $s_i$ 和一个参赛次数限制 $g_i$。

当两个选手 $i,j$ 比赛时，拥有较大 skill level 的选手会获胜，另外一位会被淘汰，并且总得分会增加 $s_i \text{ XOR } s_j$。

每个选手最多只能参赛 $g_i$ 次，并且它最后一次参赛要么被淘汰，要么成为冠军（唯一的留下的选手）。

求可能的最小总得分和最大总得分。

其中，$3 \leq n \leq 100, s_i \in [0, 2^{30}), g_i \in [2, n)$。

每个选手的 $s_i$ 各不相同。

{{% /question %}}


{{% fold "题解" %}}

看见 $n \leq 100$ 并且拥有各种奇怪的限制，就想到网络流/费用流。

> 如何表示一个选手被击败？

每个选手视作一个点，并且复制一份，$i+n$ 代表选手 $i$ 被击败的情况。

> 如何表示参赛次数限制？

在网络流中，边的最大流量用来表达限制。

• 最后注意，比赛结束时的冠军一定是拥有最大 $s_i$ 的选手，所以其他选手只能击败 $g_i - 1$ 位选手。

于是费用流的建图方法如下：

1. 对于每个选手 $i$，连边 $(s, i, g_i-1, 0)$，只有最大 $s_i$ 的选手连边 $(s, i, g_i, 0)$。

2. 对于每一个pair $(i,j)$，连边 $(i, j+n, 1, s_i \text{ XOR } s_j)$。

3. 对于每个选手 $i$，连边 $(i+n, t, 1, 0)$。

跑最大费用流和最小费用流即可。

{{% /fold %}}


{{% fold "代码" %}}

```cpp
#include <bits/stdc++.h>
using namespace std;

const int maxn = 255;
const int maxm = 2e5+5;
struct Edge {
    int to, nxt;
    ll w, c;
};

struct MCMF {
    int n,m,s,t;
    Edge edges[maxm<<1];
    int head[maxn], ecnt = 2, cur[maxn];  // ecnt 从 2 开始，方便取反向边
    ll cost = 0;
    void addEdge(int u, int v, ll w, ll c) {
        Edge e = {v, head[u], w, c};
        edges[ecnt] = e;
        head[u] = ecnt++;
    }

    ll dis[maxn];
    bool inq[maxn], vis[maxn];
    bool spfa(bool mincost) {
        queue<int> q;
        memset(vis, 0, sizeof(vis));  // 这里一定要记得清空 vis (dfs要用)
        memset(inq, 0, sizeof(inq));
        fill(dis, dis+maxn, mincost ? 1e18 : -1e18);
        memcpy(cur, head, sizeof(head));  // 当前弧优化用到的数组 cur
        dis[s] = 0;
        inq[s] = 1;
        q.push(s);
        while (!q.empty()) {
            int u = q.front(); q.pop();
            inq[u] = 0;
            for (int e = head[u]; e; e = edges[e].nxt) {
                int to = edges[e].to;
                ll w = edges[e].w, c = edges[e].c;
                if (w == 0) continue;
                if ((mincost && dis[u] + c < dis[to]) || (!mincost && dis[u] + c > dis[to])) {
                    dis[to] = dis[u] + c;
                    if (!inq[to]) {
                        inq[to] = 1;
                        q.push(to);
                    }
                }
            }
        }
        return dis[t] != (mincost ? 1e18 : -1e18);
    }

    ll dfs(int u, ll in) {
        if (u == t) return in;  // 如果已经运到了终点，直接返回入量
        vis[u] = 1;
        ll out = 0;
        for (int e = cur[u]; e; e = edges[e].nxt) {
            cur[u] = e;
            int to = edges[e].to;
            ll w = edges[e].w, c = edges[e].c;
            if (vis[to] || w == 0 || dis[to] != dis[u] + c) continue;
            // 检测: 1. 是否vis过  2. 这条边是否存在  3. 是否是最短路径

            ll res = dfs(to, min(in, w));

            in -= res;
            out += res;
            edges[e].w -= res;
            edges[e^1].w += res;

            if (in == 0) break;
        }
        if (out == 0) dis[u] = -1e18;
        return out;
    }

    ll mcmf(bool mincost = true) {
        ll maxflow = 0;
        while (spfa(mincost)) {
            ll res = dfs(s, 1e18);
            maxflow += res;
            cost += res * dis[t];  // cost += (流量 * 最短路长度)
        }
        return maxflow;
    }

    void add(int u, int v, ll w, ll c) {
        addEdge(u,v,w,c);
        addEdge(v,u,0,-c);
    }
} flow_min, flow_max;

int skill[maxn], g[maxn];
int n, s, t;
int main() {

    cin >> n;
    s = 201, t = 202;
    flow_min.s = s; flow_max.s = s; flow_min.t = t, flow_max.t = t;
    int maxs = 0;
    for (int i = 1; i <= n; i++) {
        cin >> skill[i] >> g[i];
        maxs = max(maxs, skill[i]);
    }

    for (int i = 1; i <= n; i++) {
        bool notmax = !(skill[i] == maxs);
        flow_min.add(s, i, g[i]-notmax, 0);
        flow_min.add(i+n, t, 1, 0);
        flow_max.add(s, i, g[i]-notmax, 0);
        flow_max.add(i+n, t, 1, 0);
    }
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            if (skill[i] > skill[j]) {
                flow_min.add(i, j+n, 1, skill[i] ^ skill[j]);
                flow_max.add(i, j+n, 1, skill[i] ^ skill[j]);
            }
        }
    }
    flow_min.mcmf(true);
    flow_max.mcmf(false);
    cout << flow_min.cost << " " << flow_max.cost << endl;
    
}

```

{{% /fold %}}
