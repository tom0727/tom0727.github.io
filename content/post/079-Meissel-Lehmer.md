+++
title = 'Meissel-Lehmer算法'
date = 2022-10-24T00:02:14-05:00
draft = false
categories = ['算法']
tags = ['质数', '']
+++

## 介绍

给定一个正整数 $n$，Meissel-Lehmer算法用于求 $\leq n$ 的质数数量。

时间复杂度：$O(\frac{n^{\frac{2}{3}}}{\log^2{n}})$

空间复杂度：$O(n^{\frac{1}{3}}\log^3{n})$


## 模版

```cpp
int isqrt(ll n) {return sqrtl(n);}
// 时间复杂度 O(n^{2/3})，空间复杂度 O(n^{1/3} * log^3(n))
// 调用 prime_pi(n) 返回 <= n 的质数数量（不包含1）
ll prime_pi(const ll N) {
  if (N <= 1) return 0;
  if (N == 2) return 1;
  const int v = isqrt(N);
  int s = (v + 1) / 2;
  vector<int> smalls(s); for (int i = 1; i < s; ++i) smalls[i] = i;
  vector<int> roughs(s); for (int i = 0; i < s; ++i) roughs[i] = 2 * i + 1;
  vector<ll> larges(s); for (int i = 0; i < s; ++i) larges[i] = (N / (2 * i + 1) - 1) / 2;
  vector<bool> skip(v + 1);
  const auto divide = [] (ll n, ll d) -> int { return double(n) / d; };
  const auto half = [] (int n) -> int { return (n - 1) >> 1; };
  int pc = 0;
  for (int p = 3; p <= v; p += 2) if (!skip[p]) {
    int q = p * p;
    if ((ll)(q) * q > N) break;
    skip[p] = true;
    for (int i = q; i <= v; i += 2 * p) skip[i] = true;
    int ns = 0;
    for (int k = 0; k < s; ++k) {
      int i = roughs[k];
      if (skip[i]) continue;
      ll d = (ll)(i) * p;
      larges[ns] = larges[k] - (d <= v ? larges[smalls[d >> 1] - pc] : smalls[half(divide(N, d))]) + pc;
      roughs[ns++] = i;
    }
    s = ns;
    for (int i = half(v), j = ((v / p) - 1) | 1; j >= p; j -= 2) {
      int c = smalls[j >> 1] - pc;
      for (int e = (j * p) >> 1; i >= e; --i) smalls[i] -= c;
    }
    ++pc;
  }
  larges[0] += (ll)(s + 2 * (pc - 1)) * (s - 1) / 2;
  for (int k = 1; k < s; ++k) larges[0] -= larges[k];
  for (int l = 1; l < s; ++l) {
    int q = roughs[l];
    ll M = N / q;
    int e = smalls[half(M / q)] - pc;
    if (e < l + 1) break;
    ll t = 0;
    for (int k = l + 1; k <= e; ++k) t += smalls[half(divide(M, roughs[k]))];
    larges[0] += t - (ll)(e - l) * (pc + l - 1);
  }
  return larges[0] + 1;
}
```

### 例1 CF665F [Four Divisors](https://codeforces.com/contest/665/problem/F)

{{% question 题意 %}}

给定一个正整数 $n$，求有多少个正整数 $a$ 满足以下条件：

1. $1 \leq a \leq n$。
2. $a$ 拥有恰好4个disivor。

其中，$1 \leq n \leq 10^{11}$。

{{% /question %}}


{{% fold "题解" %}}

$a$ 拥有恰好 $4$ 个divisor意味着 $a$ 只有可能为两种情况：

1. $a = p^3$
2. $a = p_1 * p_2$

其中，$p, p_1, p_2$ 均为质数。

对于第一种情况暴力枚举即可。

对于第二种情况，我们保证 $p_1 < p_2$，那么 $p_1 < 10^6$，所以只要枚举 $10^6$ 以内的所有 $p_1$，然后判断有多少个 $p_2$ 满足 $p_1 * p_2 \leq n$ 即可，可以直接求在 $[p_1+1, \frac{n}{p_1}]$ 之间的质数数量得到答案。

{{% /fold %}}


{{% fold "代码" %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn = 1e6+5;
int isqrt(ll n) {return sqrtl(n);}
// 时间复杂度 O(n^{2/3})，空间复杂度 O(n^{1/3} * log^3(n))
ll prime_pi(const ll N) {
  if (N <= 1) return 0;
  if (N == 2) return 1;
  const int v = isqrt(N);
  int s = (v + 1) / 2;
  vector<int> smalls(s); for (int i = 1; i < s; ++i) smalls[i] = i;
  vector<int> roughs(s); for (int i = 0; i < s; ++i) roughs[i] = 2 * i + 1;
  vector<ll> larges(s); for (int i = 0; i < s; ++i) larges[i] = (N / (2 * i + 1) - 1) / 2;
  vector<bool> skip(v + 1);
  const auto divide = [] (ll n, ll d) -> int { return double(n) / d; };
  const auto half = [] (int n) -> int { return (n - 1) >> 1; };
  int pc = 0;
  for (int p = 3; p <= v; p += 2) if (!skip[p]) {
    int q = p * p;
    if ((ll)(q) * q > N) break;
    skip[p] = true;
    for (int i = q; i <= v; i += 2 * p) skip[i] = true;
    int ns = 0;
    for (int k = 0; k < s; ++k) {
      int i = roughs[k];
      if (skip[i]) continue;
      ll d = (ll)(i) * p;
      larges[ns] = larges[k] - (d <= v ? larges[smalls[d >> 1] - pc] : smalls[half(divide(N, d))]) + pc;
      roughs[ns++] = i;
    }
    s = ns;
    for (int i = half(v), j = ((v / p) - 1) | 1; j >= p; j -= 2) {
      int c = smalls[j >> 1] - pc;
      for (int e = (j * p) >> 1; i >= e; --i) smalls[i] -= c;
    }
    ++pc;
  }
  larges[0] += (ll)(s + 2 * (pc - 1)) * (s - 1) / 2;
  for (int k = 1; k < s; ++k) larges[0] -= larges[k];
  for (int l = 1; l < s; ++l) {
    int q = roughs[l];
    ll M = N / q;
    int e = smalls[half(M / q)] - pc;
    if (e < l + 1) break;
    ll t = 0;
    for (int k = l + 1; k <= e; ++k) t += smalls[half(divide(M, roughs[k]))];
    larges[0] += t - (ll)(e - l) * (pc + l - 1);
  }
  return larges[0] + 1;
}
 
ll ans = 0;
bool isPrime[maxn];
vector<int> primes;
void euler() {
    memset(isPrime, 1, sizeof(isPrime));
    for (ll i = 2; i <= 1e6; i++) {
        if (isPrime[i]) {
            primes.push_back(i);
        }
        for (int j = 0; j < primes.size(); j++) {
            if (i * (ll)primes[j] > 1e6) break;
            isPrime[i * primes[j]] = 0;
            if (i % primes[j] == 0) break;
        }
    }
}
 
int main() {
    euler();
    ll n; cin >> n;
    for (ll p : primes) {
        if (p * p * p <= n) ans++;
        else break;
    }
    for (ll p : primes) {
        if (p * p >= n) break;
        ans += prime_pi(n/p) - prime_pi(p);
    }
    cout << ans << endl;
}
```

{{% /fold %}}



参考链接

1. https://oi-wiki.org/math/number-theory/meissel-lehmer/#%E7%AE%97%E6%B3%95%E7%9A%84%E6%97%B6%E7%A9%BA%E5%A4%8D%E6%9D%82%E5%BA%A6
2. 

