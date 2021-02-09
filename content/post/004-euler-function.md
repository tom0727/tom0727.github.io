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
3. $\varphi(p^k) = p^k - p^{k-1}$
4. $\forall n = p_1^{k_1}p_2^{k_2}...p_r^{k_r}, ~\varphi(n) = n\prod_{i=1}^{r}(1-\frac{1}{p_i}) = n(1-\frac{1}{p_1})(1-\frac{1}{p_2})...(1-\frac{1}{p_r})$
5. $\forall n = p_1^{k_1}p_2^{k_2}...p_r^{k_r}$, 如果 $~\exists ~i, ~s.t. ~k_i > 1$, 则 $\varphi(n) = \varphi(\frac{n}{p_i})*p_i$


## 证明

{{% fold 证明性质2 %}}

求证: $\varphi(mn) = \varphi(m)\varphi(n) \iff \gcd(m,n) = 1$

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
求证：$\varphi(p^k) = p^k - p^{k-1}$
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

## 后记
写这篇文章的时候出了几个数学公式上的问题:
1. 如果排版炸了，可以试着在 `_` 的前面加上 `\`