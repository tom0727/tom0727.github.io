+++
title = 'MAPS 2022'
date = 2022-10-10T13:30:58-05:00
draft = false
categories = ['解题报告']
tags = ['', '']
+++

### M. [Yet Another Divisor Problem](https://maps22.kattis.com/contests/maps22/problems/yetanotherdivisorproblem)

{{% question 题意 %}}

设 $f(n)$ 为正整数 $n$ 的 divisor 个数。

给定 $a, b$，求有多少个满足以下条件的数 $n$？

1. $n$ 是奇数。 
2. $n \in [a,b]$。
3. $f(f(n^n))$ 是 $n$ 的 divisor。

其中，$1 \leq a \leq b \leq 10^8$。

{{% /question %}}


{{% fold "题解" %}}

这题可以用打表解决，直觉上来说满足这个条件的 $n$ 比较少。

那么先考虑对于一个正整数 $n$，如何求 $f(n)$？

我们将 $n$ 进行质因数分解得到：

$$n = p_1^{m_1} p_2^{m_2} p_3^{m_3} ... p_k^{m_k}$$

那么

$$f(n) = (m_1+1)(m_2+1)...(m_k+1)$$

那么对于较小的 $n$（如 $n \leq 10^7$）我们可以利用线性筛预处理，然后 $O(\log n)$ 时间内进行质因数分解，具体怎么做参考 [这里](/post/038-hdu-contest1/#q2-%E5%96%84%E8%89%AF%E7%9A%84%E5%87%BA%E9%A2%98%E4%BA%BA)。

对于较大的 $n$ 我们可以利用 Pollard-Rho 在 $O(n^{\frac{1}{4}})$ 的复杂度内进行质因数分解。

所以我们的算法就有了：

1. 先分解 $n = p_1^{m_1} p_2^{m_2} p_3^{m_3} ... p_k^{m_k}$，然后得到 $f(n) = (m_1+1)(m_2+1)...(m_k+1)$
2. 接下来，设 $n' = n(m_1+1) * n(m_2+1) ... * n(m_k+1)$，我们需要知道 $f(n')$，所以对于每项 $n(m_i+1)$ 都质因数分解到同一个 map 里统计质因数。
3. 最后可求得 $f(n') = f(f(n))$。

• 本题，对于 $n \leq 5 \times 10^7$ 的情况下的线性筛优化非常重要，速度差距至少在10倍以上。

最后打表出来的结果只有 $10^4$ 个数左右。

{{% /fold %}}


{{% fold "代码" %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
struct PollardRho {
    bool isPrime[50000005];
    int small[50000005];
    vector<int> primes;
    void preprocess() {   // 线性筛优化
        memset(isPrime, 1, sizeof(isPrime));
        small[1] = 1;
        for (int i = 2; i <= 5e7; i++) {
            if (isPrime[i]) primes.push_back(i), small[i] = i;
            for (int j = 0; j < primes.size() && i * primes[j] <= 5e7; j++) {
                int cur = i * primes[j];
                isPrime[cur] = 0;
                small[cur] = primes[j];
                if (i % primes[j] == 0) break;
            }
        }
    }

    vector<ll> factor;
    ll gcd(ll a, ll b) {
        if (b == 0) return a;
        return gcd(b, a % b);
    }

    ll quick_pow(ll x, ll p, ll mod) {  // 快速幂
        ll ans = 1;
        while (p) {
            if (p & 1) ans = (__int128)ans * x % mod;
            x = (__int128)x * x % mod;
            p >>= 1;
        }
        return ans;
    }

    bool Miller_Rabin(ll p) {  // 判断素数
        if (p < 2) return 0;
        if (p == 2) return 1;
        if (p == 3) return 1;
        ll d = p - 1, r = 0;
        while (!(d & 1)) ++r, d >>= 1;  // 将d处理为奇数
        for (ll k = 0; k < 10; ++k) {
            ll a = rand() % (p - 2) + 2;
            ll x = quick_pow(a, d, p);
            if (x == 1 || x == p - 1) continue;
            for (int i = 0; i < r - 1; ++i) {
                x = (__int128)x * x % p;
                if (x == p - 1) break;
            }
            if (x != p - 1) return 0;
        }
        return 1;
    }

    ll Pollard_Rho(ll x) {
        ll s = 0, t = 0;
        ll c = (ll)rand() % (x - 1) + 1;
        int step = 0, goal = 1;
        ll val = 1;
        for (goal = 1;; goal *= 2, s = t, val = 1) {  // 倍增优化
            for (step = 1; step <= goal; ++step) {
                t = ((__int128)t * t + c) % x;
                val = (__int128)val * abs(t - s) % x;
                if ((step % 127) == 0) {
                    ll d = gcd(val, x);
                    if (d > 1) return d;
                }
            }
            ll d = gcd(val, x);
            if (d > 1) return d;
        }
    }

    void findFac(ll x) {
        if (x <= 1e7) {
            while (x > 1) {
                int sp = small[x];
                while (x % sp == 0) x /= sp, factor.push_back(sp);
            }
            return;
        }
        if (Miller_Rabin(x)) {              // 如果x为质数
            factor.push_back(x);
            return;
        }
        ll p = x;
        while (p >= x) p = Pollard_Rho(x);  // 使用该算法
        findFac(x/p), findFac(p);  // 继续向下分解x和p
    }
    void clear() { factor.clear(); }
} PR;

map<ll, ll> cnt;
map<ll, ll> cnt2;
bool check(ll n) {
    PR.clear();
    cnt.clear();
    cnt2.clear();

    PR.findFac(n);
    for (ll a : PR.factor) {
        cnt[a]++;
    }

    for (auto& itr : cnt) {
        PR.clear();
        ll c = itr.second * n + 1LL;
        PR.findFac(c);
        for (ll a : PR.factor) {
            cnt2[a]++;
        }
    }
    ll sum = 1;
    for (auto& itr : cnt2) {
        sum = sum * (itr.second + 1LL);
        if (n % sum) return 0;
    }
    return n % sum == 0;
}

int main() {
    PR.preprocess();
    for (ll i = 1; i <= 1e8; i+=2) {
        if (check(i)) cout << i << " ", fflush(stdout);
    }
    cout << endl;
}
```

{{% /fold %}}



