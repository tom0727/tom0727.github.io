+++
title = 'Hugo博客搭建小记'
date = 2021-02-01T21:21:41+08:00
draft = false
categories = ['工程']
tags = ['hugo', '博客']
+++

## 起因
在几天前折腾了爬虫，成功爬下来[とにかくかわいい](https://manga1001.com/%E3%80%90%E7%AC%AC1%E8%A9%B1%E3%80%91%E3%83%88%E3%83%8B%E3%82%AB%E3%82%AF%E3%82%AB%E3%83%AF%E3%82%A4%E3%82%A4-raw/)的漫画以后，我发现我折腾似乎上瘾了。聊天时无意提到”要是我有个人网站就好了“，于是就决定动手开始构建咕咕已久的个人网站。

由于我对自己的前端水平十分有数，所以想都没想就立刻放弃了“要不自己写一个网站？”的想法。

后来想起之前逛过的ouuan大佬的博客非常好看，我的收藏夹里甚至还有他搭建博客的指南，就直接拿来用了，采用的是 **hugo + even主题 + github actions**，参考资料如下:
> https://ouuan.gitee.io/post/from-hexo-to-hugo/

## 搭建过程

### Step 1 阅读指南
首先阅读ouuan的指南(上述链接)，然后使用他的[hugo模版](https://github.com/ouuan/hugo-blog-template)，按照模版里指示的进行clone。

### Step 2 Config的修改
还是按照模版里指示的，修改一下配置文件`config.toml`里的相关配置，一些需要更改的内容：
1. 包含`yourname`的部分
2. `newContentEditor = ""`
3. `defaultContentLanguage = "en"`
4. `[[menu.main]]`的相关内容 (视情况进行保留和删除)
5. **不要**更改 `[params]` 中的 `version="4.x"`

### Step 2.5 创建repository
因为我打算部署到github pages上，就在github上创建一个新的repository，叫`tom0727.github.io`

### Step 3 本地测试
配置完成后，可以 `hugo new post/test.md` 创建一个新的post(在`hugo-blog/content/post/test.md`), 按照markdown随便写点东西以后保存，然后 `hugo server`，打开localhost看一下效果(也可以边写边看效果，热加载真香)。最后用`hugo`命令生成静态文件，就是`hugo-blog/public/`文件夹，把这个文件夹内的内容push到github上就可以了。

注： blog的源代码和网页内容并不是一个东西!

1. 源代码: 是`hugo-blog/` 下除了`hugo-blog/public/`以外的内容，包含了 `content/`, `config.toml` 之类的文件。
2. 网页内容：只是 `hugo-blog/public/`内的内容，有了源代码就可以用`hugo`生成网页内容，但是反之就不可以！

既然两者有别，就要分开管理，我把它们放在同一个repository里，分成2个branch。源代码就放在了`master`里，网页内容就放在`publish`上了。

### Step 4 Github Settings
这个时候网页上应该是没有内容的，因为github pages需要设置一下指定deploy的branch，在repository的`Settings`里，拉到下面看到`GitHub Pages`，改一下Source branch就可以了：
![image](/images/001/1.png)

> 需要在博文里插入图片的话，假设图片位于 `static/images/001/1.png`，就写上`![image](/images/001/1.png)`
> 
> 如果是插入link的话，就写 `[link_name](https://...)` 即可，外部链接记得加`https://`，不然会被当作本地的某个文件位置。

这些步骤做完就可以了，当然这种修改然后发布的方式太麻烦了，切branch也很累，所以就有了Step 5:

### Step 5 Github Actions
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


### Step 6 gitee镜像
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


### Step 7 评论区

评论区用很多种，我选用了`utterances`，部署步骤如下：
1. 在Github上安装 [utterances app](https://github.com/apps/utterances)，选择这个博客的repo
2. 在 `config.toml` 中更改配置，将 `[params.utterances]` 下的 `repo` 改成这个repo的名字即可。（可以新开一个repo来储存评论，不过评论会以`issues`的形式出现在repo里，所以没必要新开一个）


## 一些其他的魔改

### 更改右上方的导航栏

先打开 `view-source` 的博客，找到导航栏的 `class="post-toc"`。

然后利用 [Linux的根据content搜索文件](https://stackoverflow.com/questions/16956810/how-do-i-find-all-files-containing-specific-text-on-linux)，使用 `grep -rnwl '.' -e 'post-toc-title'` 找到相应的文件。最后在 `./themes/even/assets/sass/_partial/_post/_toc.scss` 和 `./themes/even/assets/sass/_variables.scss` 找到了相关信息。

### 修改内容的宽度

ouuan大佬在 2021年04月11日 更新了一下博客的内容宽度，在大屏上显示效果更加优秀了。

以下是ouuan的commit链接：

[feat: use scrollbar for TOC](https://github.com/ouuan/hugo-theme-even/commit/4f41ce38317307279fb2899d141d7a4afe881523)
[feat: adjust widths](https://github.com/ouuan/hugo-theme-even/commit/768ba022c3fdfa057bd8013a76db996b08030721)

修改了 `themes/even/assets/js/even.js`，`themes/even/assets/sass/_partial/_post/_toc.scss`，`themes/even/assets/sass/_variables.scss`。

我在 2021年04月20日 直接复制并替换了这三个文件，之后如果需要revert，可以从github里找对应版本。

### 增强搜索功能

ouuan大佬在 2021年05月16日 更新了博客的搜索功能，再复制粘贴就显得我很low了所以我选择 cherry-pick，步骤如下：

1. `git add remote ouuan https://github.com/ouuan/hugo-blog-template.git`
2. `git fetch ouuan`
3. `git log ouuan/master` 查看得到这个修改的 commit ID
4. `git cherry-pick 01798429c1585662c50cf890fa7f92c9e3ca9c96`

### 自定义 shortcodes

所谓 shortcode 就是一些模版，比如 `{% question %}` 之类的。

如果要自定义 shortcode，可以在 

`hugo-blog/themes/even/layouts/shortcodes/` 下面创建新的html文件，修改一下里面的 `class`，然后直接用就可以了。

同样，shortcode也有一个图标，我至今没有找到这些图标是从哪里来的，但是可以在：

`hugo-blog/themes/even/assets/sass/_partial/_post/_admonition.scss` 看到 shortcode 的其他样式，还有

`./themes/even/assets/sass/_iconfont.scss` 看到一些图标的名称和对应 unicode 编号。

## 自定义页面

在 2021年06月09日，我参考 https://kenkoooo.com/atcoder#/table/ ，利用 Codeforces API 高仿一个类似的页面。经 kenkoooo 本人同意，现在已经上线在 [这里](/cf-problems) 了。主要的技术点如下：

1. 利用 python 和 Codeforces API 进行交互（因为 `requests` 有自动重试功能，而 CF 的 API 并不是太稳定）。数据以 `contests.json` 的形式存在 `/static/` 中，`/scripts/UpdateCF_Problems.py` 用于更新这个 `json`，这个更新的过程已经设置在 Github Action 中了。
2. 将写好的 `html` 文件放在 `/layouts/_default/cf-problems.html` 中（需要更改一下才能正常使用导航栏等模版，具体的看这个文件里的内容即可），再创建 `/content/cf-problems.md`（其中需要更改 `layout = 'cf-problems'`），最后在 `/config.toml` 中把这个页面挂在导航栏里面。对应的 `css` 和 `js` 文件我分别放在了 `/static/css/cf-problems.css` 和 `/static/js/cf-problem.js`（在 `cf-problems.html` 中引用的时候也要注意使用变量名）。
3. 为了使得用户体验更好，`/static/css/cf-problems.css` 还 override 了部分模版的 style，比如使得 CF-problems 页面的宽度变成 `95%` 等等。
4. 在电脑上测试手机端的 media query 的时候最好使用 `Safari`（在 `Develop > Enter Responsive Design Mode`，如果导航栏里面没有 `Develop` 的话需要手动打开一下），chrome 的体验真的挺差的。

• 附：kenkoooo 大佬用的是 `react`，我一是不会写 `react`，二是不太清楚 hugo 是否支持 `react` 写的页面，如果以后有需求的时候可以尝试一下。

## 修改样式

我觉得数学公式字体有点小，发现可以更改模版里的 css 来修改样式。

`/Users/huzhenwei/hugo-blog/themes/even/assets/sass/_custom/_custom.scss`

## 一些注意事项

1. 博客默认模版的最底部有一个 `--more--`，要把它删掉，否则预览的时候整个博客都会被预览出来。


## 结语

新的一轮折腾结束了，总体来说还是比较满意这个博客的，个人很喜欢这种极简风的博客，功能也比较全，某种意义上算是告别了在Microsoft Word里做笔记的生活（？），之后打算先补上爬虫的一些笔记，还有搬运一点Word上的笔记吧。
