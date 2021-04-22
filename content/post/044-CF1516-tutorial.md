+++
title = 'Codeforces Round #717 (Div.2) 解题报告'
date = 2021-04-22T12:07:06+08:00
draft = false
categories = ['解题报告']
tags = ['', '']
+++

全是数学的一场Div2，$D$ 题是常规操作了，但是考场上没想起来，这里记录一下。

## CF1516B [AGAGA XOOORRR](https://codeforces.com/contest/1516/problem/B)

{{% question 题意 %}}

给定 $n$ 个元素 $a_1,a_2,...,a_n$，每次操作可以任选 $2$ 个相邻元素 $a_i, a_{i+1}$，将它们删去，并且用 $a_i \text{ xor } a_{i+1}$ 来替换（位置不变）。

问：是否存在一序列操作，使得数组最后只有相同的元素，并且长度 $\geq 2$？

其中，$2 \leq n \leq 2000$

{{% /question %}}


{{% fold "题解" %}}

可以发现最后数组长度要么为 $2$，要么为 $3$。

如果最后长度为 $2$，说明 $a_1 \text{ xor }a_2 \text{ xor }... \text{ xor }a_n = 0$，特判一下即可。

如果长度为 $3$，则令 $k = a_1 \text{ xor }a_2 \text{ xor }... \text{ xor }a_n$，则最后数组一定是 $[k,k,k]$。只要判断是否存在连续的 $3$ 段使得它们的$\text{ xor }$为 $k$ 即可。

{{% /fold %}}

{{% fold 代码 %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn = 2000+5;
 
int arr[maxn];
int main() {
    int T; cin >> T;
    while (T--) {
        int n; cin >> n;
        for (int i = 1; i <= n; i++) cin >> arr[i];
 
        int x = arr[1];
        for (int i = 2; i <= n; i++) x ^= arr[i];
 
        if (x == 0) {
            cout << "YES" << "\n";
            continue;
        }
 
        int cur = 0, cnt = 0;
        for (int i = 1; i <= n; i++) {
            cur ^= arr[i];
            if (cur == x) cnt++, cur = 0;
            if (cnt >= 2) break;
        }
        if (cnt >= 2) cout << "YES" << "\n";
        else cout << "NO" << "\n";
    }
}
```

{{% /fold %}}

## CF1516C [Baby Ehab Partitions Again](https://codeforces.com/contest/1516/problem/C)

{{% question 题意 %}}

给定一个长度为 $n$ 的数组 $a_1,a_2,...,a_n$。

问：我们最少要从数组中删去几个元素，使得：**不存在**任何一种方案，将数组分为 sum 相同的两半？

输出这个最少删除数量，并且输出删除的index。

其中，$2 \leq n \leq 100, 1 \leq a_i \leq 2000$

{{% /question %}}


{{% fold "题解" %}}

我们按照以下步骤进行check：

1. 如果 $sum$ 是奇数，答案为 $0$。

2. 如果这个数组本身就无法分为两半（直接用 `bitset` 模拟），答案为 $0$。

3. 如果这个数组内，存在一个奇数，答案为 $1$，把这个奇数删掉即可。
   
4. 如果数组内，不存在奇数。则我们会发现，把整个数组的所有数除以 $2$，答案不变（因为原先的分配方案不会改变）。所以我们就一直除，直到出现一个奇数。答案也为 $1$。

如上，答案要么为 $0$，要么为 $1$。

{{% /fold %}}


{{% fold 代码 %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn = 105;
const int maxm = 2e5+5;

int n, arr[maxn], sum = 0, idx = -1;
bitset<maxm> dp;
bool check() {
    dp[0] = 1;
    for (int i = 1; i <= n; i++) {
        dp |= (dp << (arr[i]));
    }
    if (dp[sum/2]) return 0;  // can partition into equal parts
    return 1;  // cannot partition into equal parts
}

void done() {
    if (idx == -1) {
        cout << 0 << endl;
    } else {
        cout << 1 << endl;
        cout << idx << endl;
    }
    exit(0);
}

int main() {
    cin >> n;
    for (int i = 1; i <= n; i++) cin >> arr[i], sum += arr[i];
    if (sum & 1) done();
    if (check()) done();

    bool ok = 0;
    while (!ok) {
        for (int i = 1; i <= n; i++) {
            if (arr[i] & 1) ok = 1, idx = i;
        }
        for (int i = 1; i <= n; i++) arr[i] /= 2;
    }
    done();
}
```

{{% /fold %}}


## CF1516D [Cut](https://codeforces.com/contest/1516/problem/D)

{{% question 题意 %}}

给定一个长度为 $n$ 的数组 $a_1,a_2,...,a_n$。

给定 $q$ 个询问，每次询问 $l,r$，回答：

对于 $[a_l, ..., a_r]$，最少需要将它分为几个连续的subarray，使得每一个subarray内，所有元素的 $LCM$ 等于它们的乘积？

其中，$1 \leq n,q,a_i \leq 10^5, 1 \leq l \leq r \leq n$。

{{% /question %}}

{{% fold "题解" %}}

如果一个subarray内，所有元素的 $LCM$ 等于它们的乘积，说明 **任选两个元素**，$gcd = 1$，也就是说**不存在两个元素使得它们共享一个质因子。**

所以一个 trivial 的算法如下：

每次询问 $L,R$，就从 $L$ 开始出发，一直向右走，直到遇到一个 $x \in [L+1,R]$ 使得 $[a_L,...,a_x]$ 不满足上述条件。然后将 $ans+1$，令 $L = x$，然后重复此过程。

<hr>

现在问题在于，对于每一个 $L$，如何快速得到这样的 $x$？

<hr>

法一：（很麻烦）

**根号分治 + 质因数分解**，类似于 [CF1422F Boring Queries](/post/036-主席树/#例3-cf1422f-boring-querieshttpswwwluogucomcnproblemcf1422f)。

我们先对每个数进行质因子分解，如果一个subarray $[L,R]$ 满足条件，那么：

对于**每一个**质因子 $p_i$，在 $[L,R]$ 内，它**最多只能出现一个位置上**。

我们就可以处理出一个数组 $pre[j][i] = x$，代表对于第 $j$ 个质数 $p_j$，满足：

1. $a_i$ 包含 $p_j$ 这个质因子。
2. $a_x$ 包含 $p_j$ 这个质因子。
3. $x < i$，且 $x$ 尽可能大。

然后得到一个数组 $pr[i]$，其中 $pr[i] = \max\limits_j \\{ pre[j][i]\\}$。

那么，查询一个区间 $[L,R]$ 是否满足条件，令 $a = \max\limits_{i=L}^R \\{pr[i]\\}$，则只要满足 $a < L$，说明这个区间 $[L,R]$ 是合法的。（这个 $a$ 可以用 $ST$ 表维护）

• 注意到我们需要用根号分治（$ST$ 表只维护 $\leq \sqrt {10^5}$ 的部分。

• 对于大质因子，由于每个位置，出现次数最多只有一次，直接用 `map<int,int>` 模拟一下前一个和它相等的数的index即可。

经过上述处理，我们可以在 $O(1)$ 的时间内，查询一个区间 $[L,R]$ 是否合法。

那么，对于每一个 $L$，**二分** 右边界 $R$ 就可以得到最大的合法 $R$ 的值为 $R'$，令 $x = R'+1$ 即可。

<hr>

法二：（正解）

**DP + 质因数分解**。

首先求出每一个数的所有质因子。

然后我们从 $n$ 遍历到 $1$，维护两个数组 `int pnxt[], dp[]`：

1. `pnxt[p]`：代表当前情况下，对于质因子 $p$，出现最靠前的位置。
2. `dp[i]`：对于位置 $i$，最多能往右走到 `dp[i]` 这个index（不包括）。

首先我们有 `dp[i] = min(dp[i], dp[i+1])`，然后对于当前index $i$，我们有：

$$dp[i] = \min\limits_p \\{pnxt[p]\\}$$

其中，$p$ 是 $a_i$ 的所有质因子。

处理出 `dp[]` 数组，就是我们所求的了。

<hr>

现在我们已知，对于每一个 $L$，它最远可以走到 $x$（不包括），那么每次询问 $[L,R]$，怎么快速得到答案？

模拟肯定不行，如果数组是 $2,2,2,2,2...,2$ 的话，每次询问复杂度为 $O(n)$。

使用 $LCA$ 中的**倍增思想**就可以了。

我们预处理出 $nxt[i][j]$：代表从 $i$ 出发，走 $2^j$ 次，最远能走到哪。（其中，$nxt[i][0]$ 就是上述的 $dp[i]$）。

{{% /fold %}}


{{% fold "法一代码（根号分治 + 质因数分解 + ST表）" %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn = 1e5+5;
const int maxm = 2e5+5;
 
int n, q, arr[maxn], small[maxn];  // small[i] 代表 i 的最小质因子
bool isprime[maxn];
vector<int> primes;
bool have[70][maxn];
int pre[70][maxn];
int ptr = 0;  // 记录小质因子(<=317) 的数量
int mp[70];  // 1 -> 2, 2 -> 3, 3->5（因为质因数小于70个，节省空间）
int rmap[maxn];  // mp 的 reverse map
 
int pr[maxn];
int st[maxn][18];
int bin[maxn];
int dp[maxn];
 
int ask_st(int l, int r) {
    int len = r-l+1;
    int k = bin[len];
    return max(st[l][k], st[r-(1<<k)+1][k]);
}
 
void build_st() {
    bin[1] = 0; bin[2] = 1;
    for (int i = 3; i < maxn; i++) bin[i] = bin[i>>1] + 1;
    for (int i = 1; i <= n; i++) st[i][0] = pr[i];
    for (int k = 1; k < 18; k++) {
        for (int i = 1; i + (1<<k) - 1 <= n; i++)
            st[i][k] = max(st[i][k-1], st[i+(1<<(k-1))][k-1]);
    }
}
 
 
void init() {
    fill(isprime, isprime+maxn, 1);
    isprime[1] = 0;
    small[1] = 1;
    for (int i = 2; i <= 1e5; i++) {
        if (isprime[i]) primes.push_back(i), small[i] = i;
        for (int j = 0; j < primes.size(); j++) {
            int p = primes[j];
            if (i*p > 1e5) break;
            isprime[i*p] = 0;
            small[i*p] = p;  // 注意这里，无论是否有 i%p，都要 small[i*p] = p
            if (i % p == 0) {
                break;
            }
        }
    }
 
    for (int i = 0; i < primes.size(); i++) {
        mp[++ptr] = primes[i];
        rmap[primes[i]] = ptr;
        if (primes[i] > 317) break;
    }
 
    for (int i = 1; i <= n; i++) {
        while (arr[i] > 1) {
            int p = small[arr[i]];
            if (p > 317) break;
            have[rmap[p]][i] = 1;
            while (arr[i] % p == 0) arr[i] /= p;
        }
    }
 
    for (int j = 1; j <= ptr; j++) {
        for (int i = 1; i <= n; i++) {
            if (have[j][i-1]) pre[j][i] = i-1;
            pre[j][i] = max(pre[j][i], pre[j][i-1]);
 
            if (have[j][i]) {
                pr[i] = max(pr[i], pre[j][i]);
            }
        }
    }
 
 
    unordered_map<int,int> m;
    for (int i = 1; i <= n; i++) {
        if (arr[i] <= 317) continue;
        if (m.count(arr[i])) pr[i] = max(pr[i], m[arr[i]]);
        m[arr[i]] = i;
    }
 
    build_st();
}
 
// 询问 [L,R] 这个区间是否合法
bool ok(int l, int r) {
    int a = ask_st(l,r);
    if (a < l) return 1;
    return 0;
}
 
int nxt[maxn][19];  // nxt[i][j]: 从i开始，跳j步能达到的index 
int main() {
    read(n); read(q);
    for (int i = 1; i <= n; i++) read(arr[i]);
    init();
    for (int L = 1; L <= n; L++) {
        int l = L, r = n;
        int res;
        while (l <= r) {
            int mid = (l+r) >> 1;
            if (ok(L,mid)) {
                res = mid;
                l = mid+1;
            } else r = mid-1;
        }
        nxt[L][0] = res + 1;
    }
 
    fill(nxt[n+1], nxt[n+1] + 19, n+1);
    for (int k = 1; k <= 18; k++) {
        for (int i = 1; i <= n; i++) {
            nxt[i][k] = nxt[nxt[i][k-1]][k-1];
        }
    }

    while (q--) {
        int L, R, ans = 0;
        read(L), read(R);
        for (int k = 18; k >= 0; k--) {
            if (nxt[L][k] <= R) L = nxt[L][k], ans += (1<<k);
        }
        ans++;
        write(ans);
    }
}
```

{{% /fold %}}


{{% fold "法二代码（DP + 质因数分解）" %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn = 1e5+5;

int n, q, arr[maxn];
vector<int> fac[maxn];  // fac[i]: i的质因子 (不重复)

void get_factors() {
    for (int i = 2; i <= 1e5; i++) {
        if (fac[i].size() == 0) {  // i为质数
            fac[i].push_back(i);
            for (int j = i+i; j <= 1e5; j += i) {
                fac[j].push_back(i);
            }
        }
    }
}

int nxt[maxn][18];  // nxt[i][0] = j: 从i开始向右走，最多能走到j（不包括j）
int pnxt[maxn];  // pnxt[p] = i: 当前状态下，包含了质因子p的最小index i
void init() {
    get_factors();
    fill(pnxt, pnxt+maxn, n+1);
    fill(nxt[n+1], nxt[n+1] + 18, n+1);
    for (int i = n; i >= 1; i--) {
        int cur = arr[i];
        nxt[i][0] = nxt[i+1][0];
        for (int p : fac[cur]) {
            nxt[i][0] = min(nxt[i][0], pnxt[p]);
            pnxt[p] = i;
        }
    }
    for (int k = 1; k < 18; k++) {
        for (int i = 1; i <= n; i++) {
            nxt[i][k] = nxt[nxt[i][k-1]][k-1];
        }
    }
}

int main() {
    cin >> n >> q;
    for (int i = 1; i <= n; i++) cin >> arr[i];
    init();
    while (q--) {
        int L,R; cin >> L >> R;
        int ans = 0;
        for (int j = 17; j >= 0; j--) {
            if (nxt[L][j] <= R) {
                L = nxt[L][j];
                ans += (1<<j);
            }
        }
        cout << ans + 1 << "\n";
    }
}
```

{{% /fold %}}
