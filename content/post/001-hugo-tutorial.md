+++
title = 'Hugo博客搭建小记'
date = 2021-02-01T21:21:41+08:00
draft = false
categories = ['技术']
tags = ['hugo', '博客']
+++

## 起因
在几天前折腾了爬虫，成功爬下来[とにかくかわいい](https://manga1001.com/%E3%80%90%E7%AC%AC1%E8%A9%B1%E3%80%91%E3%83%88%E3%83%8B%E3%82%AB%E3%82%AF%E3%82%AB%E3%83%AF%E3%82%A4%E3%82%A4-raw/)的漫画以后，我发现我折腾似乎上瘾了。聊天时无意提到”要是我有个人网站就好了“，于是就决定动手开始构建咕咕已久的个人网站。

由于我对自己的前端水平十分有数，所以想都没想就立刻放弃了“要不自己写一个网站？”的想法。

后来想起之前逛过的ouuan大佬的博客非常好看，我的收藏夹里甚至还有他搭建博客的指南，就直接拿来用了，采用的是 **hugo + even主题 + github actions**，参考资料如下:
> https://ouuan.gitee.io/post/from-hexo-to-hugo/

## 搭建过程

### Step 1
首先阅读ouuan的指南(上述链接)，然后使用他的[hugo模版](https://github.com/ouuan/hugo-blog-template)，按照模版里指示的进行clone。

### Step 2
还是按照模版里指示的，修改一下配置文件`config.toml`里的相关配置，一些需要更改的内容：
1. 包含`yourname`的部分
2. `newContentEditor = ""`
3. `defaultContentLanguage = "en"`
4. `[[menu.main]]`的相关内容 (视情况进行保留和删除)
5. **不要**更改 `[params]` 中的 `version="4.x"`

### Step 2.5
因为我打算部署到github pages上，就在github上创建一个新的repository，叫`tom0727.github.io`

### Step 3
配置完成后，可以 `hugo new post/test.md` 创建一个新的post(在`hugo-blog/content/post/test.md`), 按照markdown随便写点东西以后保存，然后 `hugo server`，打开localhost看一下效果(也可以边写边看效果，热加载真香)。最后用`hugo`命令生成静态文件，就是`hugo-blog/public/`文件夹，把这个文件夹内的内容push到github上就可以了。

注： blog的源代码和网页内容并不是一个东西!

1. 源代码: 是`hugo-blog/` 下除了`hugo-blog/public/`以外的内容，包含了 `content/`, `config.toml` 之类的文件。
2. 网页内容：只是 `hugo-blog/public/`内的内容，有了源代码就可以用`hugo`生成网页内容，但是反之就不可以！

既然两者有别，就要分开管理，我把它们放在同一个repository里，分成2个branch。源代码就放在了`master`里，网页内容就放在`publish`上了。

### Step 4
这个时候网页上应该是没有内容的，因为github pages需要设置一下指定deploy的branch，在repository的`Settings`里，拉到下面看到`GitHub Pages`，改一下Source branch就可以了：
![image](/images/001/1.png)

> 需要在博文里插入图片的话，假设图片位于 `static/images/001/1.png`，就写上`![image](/images/001/1.png)`
> 
> 如果是插入link的话，就写 `[link_name](https://...)` 即可，外部链接记得加`https://`，不然会被当作本地的某个文件位置。

这些步骤做完就可以了，当然这种修改然后发布的方式太麻烦了，切branch也很累，所以就有了Step 5:

### Step 5:
我们配置一下Github actions，它能自动化部署流程。参考资料:
> https://segmentfault.com/a/1190000021815477

需要注意，因为源代码和网页内容在同一个repository里，就不用在github上折腾secret key之类的了，直接修改一下 `hugo-blog/.github/workflows/deploy.yml` (这个是template里自带的) 即可：
1. `personal_token: ${{ secrets.GITHUB_TOKEN }}`
2. `publish_dir: ./public`
3. `publish_branch: publish`
4. 将 `depth` 改成 `fetch-depth`  (不然build的时候会报错)

这样就完成了，从此以后，写一篇新文章的步骤就变成：
1. `hugo new post/article.md`
2. 修改位于`content/post/article.md`的博客文章
3. add, commit, 把源代码push到`master`

这样就可以了，不必切branch然后push网页内容了。

> push到`master`以后，可以在repository的`Actions`页面查看一下deploy的情况：
> ![image](/images/001/2.png)


### Step 6:
因为github.io似乎被墙了，所以学ouuan弄了一个gitee镜像，教程的话参照这两个就可以了：
> https://jasonkayzk.github.io/2020/09/18/%E5%9C%A8Gitee%E6%90%AD%E5%BB%BAGithub-Pages/

> https://github.com/yanglbme/gitee-pages-action

gitee镜像的访问网址：[tom0727.gitee.io](https://tom0727.gitee.io)

注：在 `hugo-blog/.github/workflows/sync.yml`里记得设置一下`on`，不然触发不了自动部署。

我这里设置的是：
```
on:
  push:
    branches:
      - master
  workflow_dispatch:
```

## TODO LIST
1. 打开评论区功能
2. 搞明白baidu push是什么

## 结语

新的一轮折腾结束了，总体来说还是比较满意这个博客的，个人很喜欢这种极简风的博客，功能也比较全，某种意义上算是告别了在Microsoft Word里做笔记的生活（？），之后打算先补上爬虫的一些笔记，还有搬运一点Word上的笔记吧。
