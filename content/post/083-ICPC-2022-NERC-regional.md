+++
title = '2022 NERC Regional'
date = 2022-12-04T23:48:35-06:00
draft = false
categories = ['解题报告']
tags = ['', '']
+++

### A. [Access Levels](https://codeforces.com/contest/1765/problem/A)

{{% question 题意 %}}

有 $n$ 个程序员，$m$ 个文档。

给定一个 $n \times m$ 的矩阵 $a$，其中 $a_{ij} = 1$ 表示程序员 $i$ 可以访问文档 $j$，否则不行。

现在我们需要选择一个数字 $k$，使得总共有 $k$ 个access group。

然后将每个文档放入这 $k$ 个access group中的一个，并且给这个文档设定一个权限值 $c_i$。

然后给每个程序员设定 $k$ 个数字 $v_i$，代表这个程序员在使用第 $i$ 个group时拥有 $v_i$ 的权限值。

当一个程序员在访问一个文档 $i$ 时，如果这个文档所在的group为 $j$，那么需要保证这个程序员的 $v_j \geq c_i$ 才能访问，否则不能。

求一个最小的 $k$，使得访问矩阵可以被满足，并且给出具体方案。

其中，$n,m \leq 500$。


{{% /question %}}


{{% fold "题解" %}}

注意到 group 与 group 之间是独立的，因为每个文档仅能属于一个group，所以我们分 group 来考虑。

注意到，如果一个group内有 $d$ 个文档 $i_1, i_2, ..., i_d$，那么这些文档对于程序员们来说一定遵循：访问关系为单调为超集。

举个例子，在第二个样例中

```
2 3
101
100
```

那么假设这三个文档都在同一个group内，那么按照列来看，就可以得到 `11, 00, 10` 这三个数字，可以发现 `11 > 10 > 00`（这里的 `11 > 10` 是指 `11` 为 `10` 的超集）。

这说明这三个文档可以在同一个group内。

这让我们想到了什么？如果我们将每一列看作一个 bitmask，那么如果 $b_1 > b_2$ 则可以由 $b_1$ 向 $b_2$ 连一条边，这就是一个DAG中的最小路径覆盖问题，每个路径就是一个 group。

剩下的就是很麻烦的实现了，注意去重之类的问题。

{{% /fold %}}


{{% fold "代码" %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn = 5e2+5;
int n, m;
char a[maxn][maxn];
map<string, int> mask_to_idx;
string masks[maxn];

// return 1 if b < a (b is subset of a)
bool is_sub(string& a, string& b) {
    for (int i = 1; i <= n; i++) {
        if (a[i-1] < b[i-1]) return 0;
    }
    return 1;
}

int par[maxn];
int finds(int u) {
    if (par[u] == u) return u;
    return par[u] = finds(par[u]);
}
void unions(int u, int v) {
    u = finds(u), v = finds(v);
    if (u == v) return;
    par[v] = u;
}
vector<int> adj[maxn<<1];
int vis[maxn<<1], visid = 0, match[maxn<<1], from[maxn<<1];
bool dfs(int u) {
    for (int v : adj[u]) {
        if (vis[v] == visid) continue;
        vis[v] = visid;
        if (!match[v] || dfs(match[v])) {
            match[v] = u;
            return 1;
        }
    }
    return 0;
}
int groupid = 0;
vector<int> groups[maxn];
int belongs[maxn];
int pri[maxn][maxn];  // privilege for the users
int privilege[maxn];  // privilege for each software

int main() {
    cin >> n >> m;
    for (int i = 1; i <= n; i++) {
        string s; cin >> s;
        for (int j = 1; j <= m; j++) {
            a[i][j] = s[j-1];
        }
    }
    int id = 0;
    for (int j = 1; j <= m; j++) {
        string mask = "";
        for (int i = 1; i <= n; i++) {
            mask += a[i][j];
        }
        mask_to_idx[mask] = ++id;
        masks[id] = mask;
    }
    for (int i = 1; i <= m; i++) par[i] = i;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= m; j++) {
            if (i == j) continue;
            if (masks[i] == masks[j]) {
                unions(i, j);
            }
        }
    }
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= m; j++) {
            if (i == j) continue;
            if (par[i] == i && par[j] == j && is_sub(masks[i], masks[j])) {
                adj[i].push_back(j+m);
            }
        }
    }
    // 最小路径覆盖
    int ans = 0;  // 记录有多少个独立的parent
    for (int i = 1; i <= m; i++) {
        if (par[i] == i) ans++;
    }
    for (int i = 1; i <= m; i++) {
        if (par[i] == i) {
            visid++;
            ans -= dfs(i);
        }
    }

    for (int i = m+1; i <= 2*m; i++) {
        if (par[i-m] == i-m) {
            if (match[i]) {
                from[match[i]] = i-m;
            }
        }
    }

    for (int i = m+1; i <= 2*m; i++) {
        if (par[i-m] == i-m) {
            if (!match[i]) {
                int j = i-m;
                groupid++;
                while (j) {
                    groups[groupid].push_back(j);
                    belongs[j] = groupid;
                    j = from[j];
                }
            }
        }
    }

    cout << groupid << "\n";
    for (int i = 1; i <= m; i++) {
        belongs[i] = belongs[finds(i)];
        cout << belongs[i] << " ";
    }
    cout << "\n";
    // 已经找到了每个column所在的group

    for (int g = 1; g <= groupid; g++) {
        // 现在处理第 g 个group

        vector<pair<string, int>> vec;  // vector of masks for each user (with selected column in this group)
        for (int i = 1; i <= n; i++) {
            string mask = "";
            for (int j : groups[g]) {
                mask += a[i][j];
            }
            vec.push_back({mask, i});
        }
        sort(vec.begin(), vec.end());
        reverse(vec.begin(), vec.end());

        int pre_pri = 505;
        // 先处理 vec[0]
        
        string s = vec[0].first;  // 长度为 groups[g] 的长度
        pri[vec[0].second][g] = pre_pri - 1;
        for (int k = 0; k < groups[g].size(); k++)  {
            int j = groups[g][k];
            
            if (s[k] == '0') {
                privilege[j] = pre_pri;
            } 
        }

        for (int i = 1; i < n; i++) {
            s = vec[i].first;
            if (s == vec[i-1].first) {  // 如果和前面一个一样，直接复制
                pri[vec[i].second][g] = pri[vec[i-1].second][g];
            } else {
                pre_pri--;
                for (int k = 0; k < groups[g].size(); k++)  {
                    int j = groups[g][k];
                    if (!privilege[j] && s[k] == '0') {
                        privilege[j] = pre_pri;
                    }
                }
                pri[vec[i].second][g] = pre_pri - 1;
            }
        }

        for (int j : groups[g]) {
            if (!privilege[j]) privilege[j] = 1;
        }
    }


    // output answer
    for (int i = 1; i <= m; i++) {
        if (privilege[i] == 0) {
            privilege[i] = privilege[finds(i)];
        }
        cout << (privilege[i]) << " ";
    }
    cout << "\n";

    for (int i = 1; i <= n; i++) {
        for (int g = 1; g <= groupid; g++) {
            cout << pri[i][g] << " ";
        }
        cout << "\n";
    }
}
```

{{% /fold %}}


