[![hugo](https://img.shields.io/badge/powered%20by-hugo-orange)](https://gohugo.io/)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/yourname/hugo-blog/Deploy)](https://github.com/yourname/hugo-blog/actions)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fyourname.github.io)](https://yourname.github.io)

这里是 yourname 的博客的源码，访问地址：<https://yourname.github.io>

## LICENSE

All components in the `content` folder, `static/post_doc` folder, `static/post_img` folder are distributed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), other components except for third party submodules are distributed under [MIT License](LICENSE).

---

使用方式：

```bash
git clone --recurse-submodules https://github.com/ouuan/hugo-blog-template hugo-blog
cd hugo-blog
hugo server
```

使用 VS Code 或 grep 命令等方式，将所有含有 `yourname` 的地方进行修改。（并不是所有 `yourname` 都是用户名，只是为了方便搜索全用的 `yourname` 。）

参照 [GitHub Actions 的文档](https://docs.github.com/en/free-pro-team@latest/actions/reference) 按需修改 [Workflows](.github/workflows)，尤其是 Deploy 方式，secrets 等需要修改。
