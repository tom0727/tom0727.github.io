+++
title = '欧拉函数'
date = 2021-02-06T17:23:34+08:00
draft = false
categories = ['算法']
tags = ['数学', '抽代']
+++

## 定义

给定正整数$n$，求$\varphi(n)$，
即 
1. 小于等于$n$  且
2. 与$n$互质

的正整数个数。

## 性质
1. $\varphi(p) = p-1, ~\forall \text{prime } p$
2. $\varphi(mn) = \varphi(m)\varphi(n) \iff \gcd(m,n) = 1$
3. $\varphi(p^k) = p^k - p^{k-1} = p^k(1-\frac{1}{p})$
4. $\forall n = p_1^{k_1}p_2^{k_2}...p_r^{k_r}, ~\varphi(n) = n\prod_{i=1}^{r}(1-\frac{1}{p_i}) = n(1-\frac{1}{p_1})(1-\frac{1}{p_2})...(1-\frac{1}{p_r})$
5. $\forall n = p_1^{k_1}p_2^{k_2}...p_r^{k_r}$, 如果 $~\exists ~i, ~s.t. ~k_i > 1$, 则 $\varphi(n) = \varphi(\frac{n}{p_i})*p_i$


## 证明

{{% fold 证明性质1 %}}
求证： $\varphi(p) = p-1, ~\forall \text{prime } p$
> 由质数的定义可知，小于等于$p$ 且 与$p$互质的数，在$[1,p]$中，除了 $p$以外均满足！
 
 注： $\varphi(1) = 1$

{{% /fold %}}

{{% fold 证明性质2 %}}

求证： $\varphi(mn) = \varphi(m)\varphi(n) \iff \gcd(m,n) = 1$

> 首先，易知 $\varphi(n) = |\mathbb{Z}_n^{\times}|$
> , 即 $\mathbb{Z}_n$ 中 **unit**(存在关于$\bmod~ n$乘法逆元的元素)的数量
> 
> 因为 $\mathbb{Z}_{mn} \cong \mathbb{Z}_m \times \mathbb{Z}_n  \iff \gcd(m,n) = 1$
> 
> 所以
> $\mathbb{Z}_{mn}$的units $\mathbb{Z}\_{mn}^{\times}$ ， 与  
> $\mathbb{Z}_m \times \mathbb{Z}_n$的 units 
> $(\mathbb{Z}_m \times \mathbb{Z}_n)^{\times}$ 之间存在一个 bijection, 即 
> 
> $\mathbb{Z}_{mn}^{\times} \cong (\mathbb{Z}_m \times \mathbb{Z}_n)^{\times} = \mathbb{Z}_m^{\times} \times \mathbb{Z}_n^{\times}$
> 
> 所以 $\varphi(mn) = |\mathbb{Z}_{mn}^{\times}| = |\mathbb{Z}_m^{\times} \times \mathbb{Z}_n^{\times}| = |\mathbb{Z}_m^{\times}||\mathbb{Z}_n^{\times}| = \varphi(m)\varphi(n)$

注： 
1. $\mathbb{Z}_{mn} \cong \mathbb{Z}_m \times \mathbb{Z}_n  \iff \gcd(m,n) = 1$ 的证明见 [这里](https://math.stackexchange.com/questions/795919/mathbb-z-mn-isomorphic-to-mathbb-z-m-times-mathbb-z-n-whenever-m-and)
2. 更严格的证明需要用到抽代里的中国剩余定理 （以Ring和Ideal表示的）

{{% /fold %}}

{{% fold 证明性质3 %}}
求证：$\varphi(p^k) = p^k - p^{k-1} = p^k(1-\frac{1}{p})$
> $\forall n = p^k$，所有与它**不互质**的数$m$必然包含$p$这个质数因子，因此满足条件的$m$为：$1p, 2p, 3p, ... , p^{k-1}p$，共 $p^{k-1}$个。
> 
> 所以，与$n = p^k$**互质**的数共有 $p^k-p^{k-1}$个。

{{% /fold %}}

{{% fold 证明性质4 %}}

求证：$\forall n = p_1^{k_1}p_2^{k_2}...p_r^{k_r}, ~\varphi(n) = n\prod_{i=1}^{r}(1-\frac{1}{p_i}) = n(1-\frac{1}{p_1})(1-\frac{1}{p_2})...(1-\frac{1}{p_r})$

> 因为 $n = p_1^{k_1}p_2^{k_2}...p_r^{k_r}$，且$p_1,p_2,...,p_r$都是质数（所以两两互质）
> 
> 
> 由性质2， $\varphi(n) = \varphi(p_1^{k_1})\varphi(p_2^{k_2})...\varphi(p_r^{k_r})$
> 
> 
> 由性质3，$\varphi(p_i^{k_i}) = p_i^{k_i} - p_i^{k_i-1} = p_i^{k_i}(1-\frac{1}{p_i})$
> 
> 
> 所以 $\varphi(n) = p_1^{k_1}p_2^{k_2}...p_r^{k_r}(1-\frac{1}{p_1})(1-\frac{1}{p_2})...(1-\frac{1}{p_r}) = n(1-\frac{1}{p_1})(1-\frac{1}{p_2})...(1-\frac{1}{p_r})$

{{% /fold %}}

{{% fold 证明性质5 %}}
求证：$\forall n = p_1^{k_1}p_2^{k_2}...p_r^{k_r}$, 如果 $~\exists ~i, ~s.t. ~k_i > 1$, 则 $\varphi(n) = \varphi(\frac{n}{p_i})*p_i$

> 因为 $n = p_1^{k_1}p_2^{k_2}...p_r^{k_r}$， 
> 
> 由性质2，$\varphi(n) = \varphi(p_1^{k_1})\varphi(p_2^{k_2})...\varphi(p_r^{k_r})$
> 
> 由性质3， $\varphi(p^k) = p^k - p^{k-1}$, 我们可以推出 $\varphi(p^{k+1}) = \varphi(p^{k}) * p$
> 
> 因为 $~\exists ~i, ~s.t. ~k_i > 1$，由上可得出 $\varphi(p_i^{k_i}) = \varphi(p_i^{k_i-1}) * p_i$
> 
> 即 $\varphi(n) = \varphi(p_1^{k_1})\varphi(p_2^{k_2})... (\varphi(p_i^{k_i-1})*p_i)...\varphi(p_r^{k_r}) = \varphi(\frac{n}{p_i})*p_i$

{{% /fold %}}


## 求单个数的欧拉函数值

$\forall n = p_1^{k_1}p_2^{k_2}...p_r^{k_r}$，直接质因数分解，由性质4即可求出！

时间复杂度：$O(\sqrt n)$

### 代码
```cpp
ll phi(ll x) {
    ll res = x;
    for (ll p = 2; p * p <= x; p++) {
        if (x % p == 0) {
            res = (res / p) * (p-1);
        }
        while (x % p == 0) x /= p;
    }
    if (x > 1) res = res / x * (x-1);
    return res;
}
```

## 线性筛求1~n的欧拉函数值

和线性筛的基本思路一样，只不过要分类讨论 `i % p == 0` 与否。（`i`是当前处理到的数, `p`是当前用到的质数）

1. 如果 `i % p == 0`，说明 `i * p` 这个数里，包含了**至少2个质因子$p$** (即$p^2$)。
   
   由性质5，有 $\varphi(i * p) = \varphi(i) * p$
2. 如果 `i % p != 0`，说明 $\gcd(i,p) = 1$。
   
   由性质2，有 $\varphi(i * p) = \varphi(i) * \varphi(p)$


时间复杂度： $O(n)$

### 代码

{{% fold luogu-P2158-AC代码 %}}
题目链接: https://www.luogu.com.cn/problem/P2158
```cpp
#include <bits/stdc++.h>
using namespace std;

const int mod = 998244352;
const int maxn = 4e4+5;

int phi[maxn];
bool p[maxn];
vector<int> primes;

int main() {
    int n; cin >> n;
    if (n <= 1) {
        cout << 0 << endl;
        return 0;
    }
    phi[1] = 1;
    fill(p, p+maxn, 1);

    for (int i = 2; i <= n; i++) {
        if (p[i]) {
            phi[i] = i-1;
            primes.push_back(i);
        }

        for (int j = 0; j < primes.size() && i * primes[j] <= n; j++) {
            int cur = primes[j];
            p[i*cur] = 0;
            if (i % cur == 0) {
                phi[i*cur] = phi[i] * cur;
                break;
            } else {
                phi[i*cur] = phi[i] * phi[cur];
            }
        }
    }
    
    int ans = 3;
    for (int i = 2; i <= n-1; i++) ans += 2*phi[i];
    cout << ans << endl;
    
}
```
{{% /fold %}}

## 例题

### 例1 [CF1295D](https://codeforces.com/contest/1295/problem/D)

{{% question 题意 %}}
给定两个正整数 $a$, $m$, 求满足以下条件的 $x$ 的数量？

1. $0 \leq x < m$
2. $\gcd(a,m) = \gcd(a+x,m)$

其中，$1 \leq a < m \leq 10^{10}$

{{% /question %}}

{{% fold "题解" %}}

设 $g = \gcd(a,m)$，则 $g = \gcd(a+x,m)$，所以 $\gcd(\frac{a+x}{g}, \frac{m}{g}) = 1~$ 且 $~g|(a+x)$，又因为 $g|a$，所以 $~g|x$

所以问题转化为：

设 $c = \frac{a}{g}, x = \frac{m}{g}$，求 $k \in [c,c+x)$，使得 $k$ 满足：$gcd(x, k) = 1$ 的  $k$ 的数量？

我们会发现当 $k > x$ 时，因为 $\gcd(x,k) = \gcd(x, k-x)$，所以我们可以将 $k \in (x,c+x)$ 的这一段，映射到 $k \in (0,c)$ 上。

![image](/images/004/1.jpg)

所以最后我们要求的$k$就是： $k \in [1,x]$ 使得 $\gcd(k, x) = 1$，所以满足条件的 $k$ 的数量就等于 $\varphi(x)$

{{% /fold %}}


## 参考链接
1. https://blog.csdn.net/paxhujing/article/details/51353672
2. https://www.luogu.com.cn/blog/JustinRochester/solution-p2158
3. https://blog.nowcoder.net/n/0cbf747dc0874027b5c48cf7fbf27060

## 后记
写这篇文章的时候出了几个数学公式上的问题:
1. 如果排版炸了，可以试着在 `_` 的前面加上 `\`