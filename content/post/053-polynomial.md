+++
title = '多项式全家桶'
date = 2021-09-21T20:09:39+08:00
draft = false
categories = ['算法']
tags = ['多项式', '']
+++

## 模版

{{% fold "多项式全家桶" %}}

```cpp
const int mod = 998244353;
const int maxn = (1<<22) + 5;

struct NTT {
    const ll g = 3, invg = inv(g);  // mod = 998244353
    inline ll qpow(ll a, ll b) {
        ll res = 1;
        while (b) {
            if (b & 1) res = res * a % mod;
            a = a * a % mod;
            b >>= 1;
        }
        return res;
    }
    inline ll inv(ll a) {
        return qpow(a, mod-2);
    }

    void rearrange(ll a[], const int n) {
        static int rev[maxn];  // maxn > deg(h) 且 maxn 为 2的k次方 + 5
        for (int i = 1; i <= n; i++) {
            rev[i] = rev[i >> 1] >> 1;
            if (i & 1) rev[i] |= (n >> 1);
        }
        for (int i = 1; i < n; i++) {
            if (i < rev[i]) swap(a[i], a[rev[i]]);  // 保证每对数字只翻转一次
        }
    }

    void ntt(ll a[], const int n, int on) {
        rearrange(a, n);
        for (int k = 2; k <= n; k <<= 1) {   // 模拟分治的合并过程
            ll wn = qpow(on == 1 ? g : invg, (mod-1)/k);
            for (int i = 0; i < n; i += k) {
                ll w = 1;
                for (int j = i; j < i + (k>>1); j++) {
                    ll x = a[j], y = w * a[j+(k>>1)] % mod;
                    a[j] = (x + y) % mod;
                    a[j+(k>>1)] = (x - y + mod) % mod;
                    w = w * wn % mod;
                }
            }
        }
        if (on == -1) {
            ll invn = inv(n);
            for (int i = 0; i < n; i++) a[i] = a[i] * invn % mod;
        }
    }
} ntt;

// calculate h(x) = f(x) * g(x), n1 = deg(f) + 1, n2 = deg(g) + 1
void poly_multiply(ll f[], int n1, ll g[], int n2, ll h[]) {
    static ll F[maxn], G[maxn];
    int n = 1;
    n1--, n2--;
    while (n <= n1 + n2) n <<= 1;  // deg(h) = n1 + n2

    for (int i = 0; i <= n1; i++) F[i] = f[i];
    for (int i = 0; i <= n2; i++) G[i] = g[i];
    for (int i = n1+1; i < n; i++) F[i] = 0;
    for (int i = n2+1; i < n; i++) G[i] = 0;

    memset(h, 0, sizeof(ll) * n);
    ntt.ntt(F, n, 1);  // 注意这里用的是 n (不是 n1)
    ntt.ntt(G, n, 1);
    for (int i = 0; i < n; i++) h[i] = F[i] * G[i] % mod;
    ntt.ntt(h, n, -1);
}

// calculate f^{-1}, store it into g[]
// m = deg(f) + 1
void poly_inverse(ll f[], ll g[], const int m) {
    if (m == 1) {
        g[0] = ntt.inv(f[0]);  // 应该改为二次剩余
        return;
    }
    static ll F[maxn];
    poly_inverse(f, g, (m+1)>>1);
    int n = 1;
    while (n <= ((m-1)<<1)) n <<= 1;  // 因为 deg(h) = (m-1) * 2
    for (int i = 0; i < m; i++) F[i] = f[i];
    for (int i = m; i < n; i++) F[i] = 0;
    ntt.ntt(F, n, 1);
    ntt.ntt(g, n, 1);
    for (int i = 0; i < n; i++) {
        g[i] = g[i] * ((2LL - g[i] * F[i] % mod + mod) % mod) % mod;
    }
    ntt.ntt(g, n, -1);
    for (int i = m; i < n; i++) g[i] = 0;
}

// get f'(x), store it into g[]
// n = deg(f) + 1
inline void poly_derivatives(ll f[], ll g[], const int n) {
    for (ll i = 1; i < n; i++) {
        g[i-1] = f[i] * i % mod;
    }
    g[n-1] = 0;
}

// get integral f(x)dx, store it into g[]
// n = deg(f) + 1
inline void poly_integral(ll f[], ll g[], const int n) {
    for (ll i = n-1; i >= 1; i--) {
        g[i] = f[i-1] * ntt.inv(i) % mod;
    }
    g[0] = 0;
}

// get ln(f(x)), store it into g[]
// n = deg(f) + 1
void poly_ln(ll f[], ll g[], const int n) {
    static ll invf[maxn], deriv_f[maxn];
    memset(invf, 0, sizeof(invf));
    memset(deriv_f, 0, sizeof(deriv_f));
    poly_inverse(f, invf, n);
    poly_derivatives(f, deriv_f, n);
    poly_multiply(deriv_f, n, invf, n, g);
    poly_integral(g, g, n);
}

// get e^f(x), store it into g[]
// m = deg(f) + 1
void poly_exp(ll f[], ll g[], const int m) {
    static ll F[maxn], G[maxn], lng[maxn];
    if (m == 1) {
        g[0] = 1;
        return;
    }
    poly_exp(f, g, (m+1) >> 1);

    int n = 1;
    while (n <= ((m-1)<<1)) n <<= 1;
    for (int i = 0; i < m; i++) F[i] = f[i], G[i] = g[i];
    for (int i = m; i < n; i++) F[i] = 0, G[i] = 0, lng[i] = 0;

    poly_ln(g, lng, m);
    ntt.ntt(F, n, 1);
    ntt.ntt(G, n, 1);
    ntt.ntt(lng, n, 1);
    for (int i = 0; i < n; i++) {
        g[i] = G[i] * ((1LL - lng[i] + F[i] + mod) % mod) % mod;
    }
    ntt.ntt(g, n, -1);
    for (int i = m; i < n; i++) g[i] = 0;
}

// given f(x), calculate g(x), such that g(x)^2 = f(x)
// m = deg(f) + 1
void poly_sqrt(ll f[], ll g[], const int m) {
    static ll F[maxn], G[maxn], invG[maxn];
    if (m == 1) {
        g[0] = 1;
        return;
    }
    poly_sqrt(f, g, (m+1) >> 1);

    int n = 1;
    while (n <= ((m-1)<<1)) n <<= 1;
    for (int i = 0; i < m; i++) F[i] = f[i], G[i] = g[i], invG[i] = 0;
    for (int i = m; i < n; i++) F[i] = 0, G[i] = 0, invG[i] = 0;

    poly_inverse(G, invG, m);
    poly_multiply(f, m, invG, m, g);
    for (int i = 0; i < m; i++) g[i] = (g[i] + G[i]) % mod * ntt.inv(2) % mod;
    for (int i = m; i < n; i++) g[i] = 0;
}

// given f(x) and g(x), calculate q(x), r(x) such that f(x) = q(x) * g(x) + r(x)
// n = deg(f) + 1, m = deg(g) + 1, deg(q) = n-m, deg(r) < deg(g) - 1 = m
void poly_division(ll f[], ll g[], ll q[], ll r[], const int n, const int m) {
    static ll F[maxn], G[maxn], invG[maxn];
    for (int i = 0; i <= n-1; i++) F[i] = f[n-1-i];
    for (int i = 0; i <= m-1; i++) G[i] = g[m-1-i];

    poly_inverse(G, invG, n-m+1);
    poly_multiply(F, n-m+1, invG, n-m+1, q);
    for (int i = n-m+1; i <= 2LL * (n-m+1); i++) q[i] = 0;
    reverse(q, q+n-m+1);
    poly_multiply(q, n-m+1, g, m, G);
    for (int i = 0; i < m; i++) r[i] = (f[i] - G[i] + mod) % mod;
}


ll f[maxn], g[maxn];
int main() {
    int n; cin >> n;
    for (int i = 0; i < n; i++) cin >> f[i];
    poly_sqrt(f, g, n);
    for (int i = 0; i < n; i++) cout << g[i] << " ";
    cout << endl;    
}
```

{{% /fold %}}


## 多项式求逆

{{% question 题意 %}}

给定一个多项式 $f(x)$，$deg(f) = n-1$，求多项式 $g(x)$，使得

$$f(x) * g(x) \equiv 1 ~ (\text{mod } x^n)$$

系数对 998244353 取模。

所有的系数均为非负整数，保证有解。

{{% /question %}}

定义 $x^n$：指舍弃含有 $x^n$ 及更高次数的项。

我们设 $g(x)$ 为 $f(x)$ 在 $\text{ mod } x^n$ 意义下的逆元，设 $G(x)$ 为 $f(x)$ 在 $\text{ mod } x^{\lceil{\frac{n}{2}}\rceil}$ 意义下的逆元，则有：

$$f(x)g(x) \equiv 1 (\text{mod } x^{\lceil{\frac{n}{2}}\rceil}), ~~ f(x)G(x) \equiv 1 (\text{mod } x^{\lceil{\frac{n}{2}}\rceil})$$

所以

$$f(x)(g(x) - G(x)) \equiv 0 (\text{mod } x^{\lceil{\frac{n}{2}}\rceil})$$

由于 $deg(f) = n-1$，所以 $f \neq 0 (\text{mod } x^{\lceil{\frac{n}{2}}\rceil})$，所以

$$g(x) - G(x) \equiv 0 (\text{mod } x^{\lceil{\frac{n}{2}}\rceil})$$

两边同时平方，可得

$$g(x)^2 + G(x)^2 - 2g(x)G(x) \equiv 0 (\text{mod } x^n)$$

由于 $f(x)g(x) \equiv 1 (\text{mod } x^n)$，两边同乘以 $f(x)$ 可得：

$$g(x) + f(x)G(x)^2 - 2G(x) \equiv 0 (\text{mod } x^n)$$

所以

$$g(x) \equiv 2G(x) - f(x)G(x)^2 (\text{mod } x^n)$$


{{% info "注意点" %}}

1. $G(x)$ 是 $(\text{mod } x^{\lceil{\frac{n}{2}}\rceil})$ 意义下的逆元，刚好是一个递归的问题，只要求出来 $G(x)$ 即可求出 $g(x)$，而这个式子用 NTT 解决即可。

2. 只需要用 DFT 求出 $f(x), G(x)$ 在特殊点的值 $f(x_i), G(x_i)$，然后直接进行上述计算 $2G(x_i) - f(x_i)G(x_i)^2$，然后再 IDFT 回来即可。

3. 板子里面使用的 $m$ 代表 $m = deg(f) + 1$，这样是为了递归 base case 的正确处理。

4. 如果 $f(x)$ 的常数项 $f(0) = 0$ 则无法求逆。

{{% /info %}}


<hr>

## 多项式求 $\ln$

{{% question 题意 %}}

给定一个多项式 $f(x)$，$deg(f) = n-1$，求多项式 $g(x)$，使得

$$g(x) \equiv \ln f(x) ~ (\text{mod } x^n)$$

系数对 998244353 取模。

所有的系数均为非负整数，保证有解。

{{% /question %}}

两边同时求导，可以得到 $$g'(x) \equiv \frac{f'(x)}{f(x)} ~ (\text{mod } x^n)$$

多项式求导和积分都很简单，所以右边可以很容易的计算出来。

计算出来右边以后，两边同时积分即可得到 $g(x)$。

<hr>

## 多项式求 $exp$

{{% question 题意 %}}

给定一个多项式 $f(x)$，$deg(f) = n-1$，求多项式 $g(x)$，使得

$$g(x) \equiv e^{f(x)} ~ (\text{mod } x^n)$$

系数对 998244353 取模。

所有的系数均为非负整数，保证 $f_0 = 0$。

{{% /question %}}

### 前置知识：牛顿迭代法求零点

牛顿迭代法可以快速求出一个函数 $f(x)$ 的零点。

思想：随便找一个 $x_1$ 作为起点，求出 $(x_1, f(x_1))$ 处的切线方程，设 $x_2$ 为这个切线与 $x$ 轴的交点，继续此过程。

![img](/images/053/1.png)

推导：

$f(x)$ 在 $x_1$ 处的切线为

$$y = f'(x_1)(x-x_1) + f(x_1)$$

令 $y = 0$，得到

$$x = x_1 - \frac{f(x_1)}{f'(x_1)}$$

<hr>

上述的过程对于多项式也适用！

假设我们给定一个多项式 $F(x)$，要求一个多项式 $G(x)$ 使得 $$F(G(x)) \equiv 0 ~ (\text{mod } x^n)$$

则我们可以先求出 $G_1(x)$，满足 

$$F(G_1(x)) \equiv 0 ~ (\text{mod } x^{\lceil \frac{n}{2} \rceil})$$

然后根据牛顿迭代的式子，求出

$$G(x) = G_1(x) - \frac{F(G_1(x))}{F'(G_1(x))}$$

令 $G_2(x) = G(x)$，然后递归此过程直到 $n=1$ 即可。

• base case 为 $n = 1$，所以总复杂度为 $O(n \log n)$

证明？需要用到**泰勒展开**（数学浓度有一点点高所以我先鸽了）

<hr>

### 用牛顿迭代求多项式的exp

回顾一下问题：

给定一个多项式 $f(x)$，$deg(f) = n-1$，求多项式 $g(x)$，使得

$$g(x) \equiv e^{f(x)} ~ (\text{mod } x^n)$$

两边同时求 $\ln$，可得：

$$\ln (g(x)) - f(x) \equiv 0 ~ (\text{mod } x^n)$$

设 

$$F(g(x)) = \ln (g(x)) - f(x)$$

则我们要求的是 $F(x)$ 在 $(\text{mod } x^n)$ 意义下的零点（注意这个零点本身是个多项式）。

所以根据牛顿迭代的式子，可以写出：

$$g_2(x) = g_1(x) - \frac{F(g_1(x))}{F'(g_1(x))}$$

注意到 $F'(g(x)) = \frac{1}{g(x)}$，所以有：

$$g_2(x) = g_1(x)(1-\ln (g_1(x)) - f(x))$$

• 其中 base case 是 $n=1$ 时，由于 $f_0 = 0$，所以 

$$g_0(x) = e^{f_0(x)} = e^0 = 1$$

> 时间复杂度：$T(n) = T(\frac{n}{2}) + O(n \log n)$，所以 $T(n) = O(n \log n)$

<hr>

## 多项式除法

{{% question 题意 %}}

给定一个多项式 $f(x)$ 和一个多项式 $g(x)$，$deg(f) = n, deg(g) = m, n > m$，求 $q(x), r(x)$ 使得：

$$deg(q) = n-m, deg(r) < m$$

$$f(x) = q(x) * g(x) + r(x)$$

系数对 998244353 取模。所有的系数均为非负整数。

{{% /question %}}

设 

$$F(x) = x^nf(\frac{1}{x})$$

可以发现 $F(x)$ 就是 $f(x)$ **所有系数翻转过来** 得到的多项式。

然后有：

$$f(x) = q(x) * g(x) + r(x)$$

$$f(\frac{1}{x}) = q(\frac{1}{x}) * g(\frac{1}{x}) + r(\frac{1}{x})$$

两边同乘 $x^n$ 可得：

$$x^nf(\frac{1}{x}) = x^{n-m}q(\frac{1}{x}) * x^mg(\frac{1}{x}) + x^{n-m+1} * x^{m-1}r(\frac{1}{x})$$

$$F(x) = Q(x) * G(x) + x^{n-m+1}R(x)$$

两边同时 $\text{mod } x^{n-m+1}$ 可得：

$$F(x) \equiv Q(x) * G(x) ~ (\text{mod } x^{n-m+1})$$

所以

$$Q(x) \equiv \frac{F(x)}{G(x)} ~ (\text{mod } x^{n-m+1})$$

发现 $deg(q) = n-m$，所以刚好求出来的 $Q(x)$ 在 $\text{mod } x^{n-m+1}$ 意义下，就是正确的结果。

所以可以直接计算出 $Q(x)$，翻转系数得到 $q(x)$。

至于 $r(x)$，直接由 $$r(x) = f(x) - q(x) * g(x)$$ 即可得到。

<hr>

## 多项式开根

{{% question 题意 %}}

给定一个多项式 $f(x)$，$deg(f) = n-1$，求 $g(x)$ 使得：

$$g^2(x) \equiv f(x) ~ (\text{mod } x^{n})$$

系数对 998244353 取模。保证 $f_0 = 1$，所有的系数均为非负整数。

{{% /question %}}

设 

$$F(g(x)) = g^2(x) - f(x)$$

要求的就是 $F(x)$ 的零点。

假设我们已经求出了在 $(\text{mod } x^{\lceil \frac{n}{2}} \rceil)$ 意义下的 $g_1(x)$ 使得 $g_1^2(x) \equiv f(x) (\text{mod } x^{\lceil \frac{n}{2}} \rceil)$

则根据牛顿迭代，有：

$$g_2(x) = g_1(x) - \frac{F(g_1(x))}{F'(g_1(x))}$$

$$= g_1(x) - \frac{g_1^2(x) - f(x)}{2g_1(x)}$$

• base case 为 $n=1$ 时，由于 $f_0 = 1$，直接开根得到 $g_0 = \sqrt 1 = 1$

• 如果 $f_0 \neq 1$，需要 [**二次剩余**](/post/055-二次剩余) 来求出 $g_0$

注：有另外一种不用牛顿迭代的推导方法，可以看 [这里](https://www.luogu.com.cn/blog/Owencodeisking/solution-p5205)


## 注意事项

1. 在代码中，使用 `ntt.ntt()` 时注意指定的长度是 $n$，而 **不是** $deg(f) = m$
2. TODO: 所有需要递归的非递归写法？
3. TODO: 二次剩余

## 参考链接

1. https://blog.csdn.net/a_forever_dream/article/details/102483602
2. https://gauss0320.blog.luogu.org/ti-xie-p4726-mu-ban-duo-xiang-shi-zhi-shuo-han-shuo-duo-xiang-shi-e
3. https://blog.csdn.net/a_forever_dream/article/details/106281196
4. https://www.luogu.com.cn/blog/user7035/solution-p4512