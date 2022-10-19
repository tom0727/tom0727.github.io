+++
title = '2020-2021 ICPC, NERC, Southern and Volga Russian Regional Contest'
date = 2022-10-17T13:51:05-05:00
draft = false
categories = ['解题报告']
tags = ['', '']
+++

###  G. [Hobbits](https://codeforces.com/contest/1468/problem/G)

{{% question 题意 %}}

二维平面上有 $n$ 个点，第 $i$ 个点的坐标是 $(x_i,y_i)$，其中 $x_i < x_{i+1}, \forall i \in [1, n-1]$，点 $i$ 与点 $(i+1)$ 之间由一条线段链接。

在 $(x_n, y_n + H)$ 位置有一个眼睛，现在从点 $1$ 沿着线段走到点 $n$，求这个眼睛的视野能覆盖这个路程中的多长距离？

![img](/images/077/1.png)

其中，$2 \leq n \leq 2 \cdot 10^5, H \in [1, 10^4], x_i \in [0, 4 \cdot 10^5], y_i \in [0 \leq 10^4]$。

{{% /question %}}


{{% fold "题解" %}}

几何题。这里用的是 [kuangbin的板子](https://kuangbin.github.io/2019/04/28/20190428/)，并且有 [板子相对应的讲解](https://www.cnblogs.com/hoppz/p/15619756.html)

我们设这个眼睛为 $s$，那么可以知道 $(x_n,y_n)$ 在 $s$ 的正下方，接着视线顺时针旋转，每次碰到一个点就判断这个点是否能被看到。

可以知道，这个点能被看见，当且仅当它前面没有点（或相应的线段）能挡住它，判断是否能挡住只要看顺时针扫描的时候的夹角即可，如果右边有个点对应的角更大的话就看不见了。

如果能看见点 $i$，记录这个点为 $pre$，在看见下一个点 $i$ 时，链接 $(s,pre)$ 并且做延长线，与线段 $(i,i+1)$ 相交即可得到对应路程长度。

![img](/images/077/2.jpg)

<hr>

最后注意特判一下平行的情况，如图：

![img](/images/077/3.jpg)

如果 $(i,pre)$ 之间刚好是一条线段（这意味着 $pre=i+1$），并且 $s,pre,i$ 在同一条线上，那么是 $(i,pre)$ 整条可以计入答案的。

这里要注意使用 `long long` 或者板子里的 `parallel()` 函数来判断，如果用夹角判断会出现精度问题！

• 最后，注意用 `scanf()` 读入数据，否则超时。

{{% /fold %}}


{{% fold "代码" %}}

```cpp
#include <bits/stdc++.h>
using namespace std;
int sgn(double x){
	if(fabs(x) < eps)return 0;
	if(x < 0)return -1;
	else return 1;
}
//square of a double
inline double sqr(double x){return x*x;}
 
struct Point{
	double x,y;
	Point(){}
	Point(double _x,double _y){
		x = _x;
		y = _y;
	}
	void input(){
		scanf("%lf%lf",&x,&y);
	}
	void output(){
		printf("%.2f %.2f\n",x,y);
	}
	bool operator == (Point b)const{
		return sgn(x-b.x) == 0 && sgn(y-b.y) == 0;
	}
	bool operator < (Point b)const{
		return sgn(x-b.x)== 0?sgn(y-b.y)<0:x<b.x;
	}
	Point operator -(const Point &b)const{
		return Point(x-b.x,y-b.y);
	}
	//叉积
	double operator ^(const Point &b)const{
		return x*b.y - y*b.x;
	}
	//点积
	double operator *(const Point &b)const{
		return x*b.x + y*b.y;
	}
	//返回长度
	double len(){
		return hypot(x,y);//库函数
	}
	//返回长度的平方
	double len2(){
		return x*x + y*y;
	}
	//返回两点的距离
	double distance(Point p){
		return hypot(x-p.x,y-p.y);
	}
	Point operator +(const Point &b)const{
		return Point(x+b.x,y+b.y);
	}
	Point operator *(const double &k)const{
		return Point(x*k,y*k);
	}
	Point operator /(const double &k)const{
		return Point(x/k,y/k);
	}
	//`计算pa  和  pb 的夹角`
	//`就是求这个点看a,b 所成的夹角`
	//`测试 LightOJ1203`
	double rad(Point a,Point b){
		Point p = *this;
		return fabs(atan2( fabs((a-p)^(b-p)),(a-p)*(b-p) ));
	}
	//`化为长度为r的向量`
	Point trunc(double r){
		double l = len();
		if(!sgn(l))return *this;
		r /= l;
		return Point(x*r,y*r);
	}
	//`逆时针旋转90度`
	Point rotleft(){
		return Point(-y,x);
	}
	//`顺时针旋转90度`
	Point rotright(){
		return Point(y,-x);
	}
	//`绕着p点逆时针旋转angle`
	Point rotate(Point p,double angle){
		Point v = (*this) - p;
		double c = cos(angle), s = sin(angle);
		return Point(p.x + v.x*c - v.y*s,p.y + v.x*s + v.y*c);
	}
};
 
struct Line{
	Point s,e;
	Line(){}
	Line(Point _s,Point _e){
		s = _s;
		e = _e;
	}
	bool operator ==(Line v){
		return (s == v.s)&&(e == v.e);
	}
	//`根据一个点和倾斜角angle确定直线,0<=angle<pi`
	Line(Point p,double angle){
		s = p;
		if(sgn(angle-pi/2) == 0){
			e = (s + Point(0,1));
		}
		else{
			e = (s + Point(1,tan(angle)));
		}
	}
	//ax+by+c=0
	Line(double a,double b,double c){
		if(sgn(a) == 0){
			s = Point(0,-c/b);
			e = Point(1,-c/b);
		}
		else if(sgn(b) == 0){
			s = Point(-c/a,0);
			e = Point(-c/a,1);
		}
		else{
			s = Point(0,-c/b);
			e = Point(1,(-c-a)/b);
		}
	}
	void input(){
		s.input();
		e.input();
	}
	void adjust(){
		if(e < s)swap(s,e);
	}
	//求线段长度
	double length(){
		return s.distance(e);
	}
	//`返回直线倾斜角 0<=angle<pi`
	double angle(){
		double k = atan2(e.y-s.y,e.x-s.x);
		if(sgn(k) < 0)k += pi;
		if(sgn(k-pi) == 0)k -= pi;
		return k;
	}
	//`点和直线关系`
	//`1  在左侧`
	//`2  在右侧`
	//`3  在直线上`
	int relation(Point p){
		int c = sgn((p-s)^(e-s));
		if(c < 0)return 1;
		else if(c > 0)return 2;
		else return 3;
	}
	// 点在线段上的判断
	bool pointonseg(Point p){
		return sgn((p-s)^(e-s)) == 0 && sgn((p-s)*(p-e)) <= 0;
	}
	//`两向量平行(对应直线平行或重合)`
	bool parallel(Line v){
		return sgn((e-s)^(v.e-v.s)) == 0;
	}
	//`两线段相交判断`
	//`2 规范相交`
	//`1 非规范相交`
	//`0 不相交`
	int segcrossseg(Line v){
		int d1 = sgn((e-s)^(v.s-s));
		int d2 = sgn((e-s)^(v.e-s));
		int d3 = sgn((v.e-v.s)^(s-v.s));
		int d4 = sgn((v.e-v.s)^(e-v.s));
		if( (d1^d2)==-2 && (d3^d4)==-2 )return 2;
		return (d1==0 && sgn((v.s-s)*(v.s-e))<=0) ||
			(d2==0 && sgn((v.e-s)*(v.e-e))<=0) ||
			(d3==0 && sgn((s-v.s)*(s-v.e))<=0) ||
			(d4==0 && sgn((e-v.s)*(e-v.e))<=0);
	}
	//`直线和线段相交判断`
	//`-*this line   -v seg`
	//`2 规范相交`
	//`1 非规范相交`
	//`0 不相交`
	int linecrossseg(Line v){
		int d1 = sgn((e-s)^(v.s-s));
		int d2 = sgn((e-s)^(v.e-s));
		if((d1^d2)==-2) return 2;
		return (d1==0||d2==0);
	}
	//`两直线关系`
	//`0 平行`
	//`1 重合`
	//`2 相交`
	int linecrossline(Line v){
		if((*this).parallel(v))
			return v.relation(s)==3;
		return 2;
	}
	//`求两直线的交点`
	//`要保证两直线不平行或重合`
	Point crosspoint(Line v){
		double a1 = (v.e-v.s)^(s-v.s);
		double a2 = (v.e-v.s)^(e-v.s);
		return Point((s.x*a2-e.x*a1)/(a2-a1),(s.y*a2-e.y*a1)/(a2-a1));
	}
	//点到直线的距离
	double dispointtoline(Point p){
		return fabs((p-s)^(e-s))/length();
	}
	//点到线段的距离
	double dispointtoseg(Point p){
		if(sgn((p-s)*(e-s))<0 || sgn((p-e)*(s-e))<0)
			return min(p.distance(s),p.distance(e));
		return dispointtoline(p);
	}
	//`返回线段到线段的距离`
	//`前提是两线段不相交，相交距离就是0了`
	double dissegtoseg(Line v){
		return min(min(dispointtoseg(v.s),dispointtoseg(v.e)),min(v.dispointtoseg(s),v.dispointtoseg(e)));
	}
	//`返回点p在直线上的投影`
	Point lineprog(Point p){
		return s + ( ((e-s)*((e-s)*(p-s)))/((e-s).len2()) );
	}
	//`返回点p关于直线的对称点`
	Point symmetrypoint(Point p){
		Point q = lineprog(p);
		return Point(2*q.x-p.x,2*q.y-p.y);
	}
};
 
 
int n;
int H;
Point a[maxn];
double ang[maxn];
int main() {
    scanf("%d%d",&n,&H);
    for (int i = 1; i <= n; i++) {
        a[i].input();
    }
    Point p(a[n].x, a[n].y + H);
    for (int i = 1; i <= n; i++) {
        ang[i] = p.rad(a[n], a[i]);
    }
 
    int pre = n;
    double ans = 0.0;
    for (int i = n-1; i >= 1; i--) {
        Line s(p, a[pre]);  // (s, pre)
        Line t(p, a[i]);
        if (s.parallel(t)) {
            if (pre-i == 1) {
                ans += a[i].distance(a[pre]);
            }
            pre = i;
        }
        else if (ang[i] > ang[pre]) {
            Line l(a[i], a[i+1]);  // (i, i+1)
            Point c = l.crosspoint(s);
            ans += c.distance(a[i]);
            pre = i;
        } 
    }
    printf("%.15lf\n", ans);
}

```

{{% /fold %}}

