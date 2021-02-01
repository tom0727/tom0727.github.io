$(document).ready(function () {
  Even.backToTop();
  Even.mobileNavbar();
  Even.toc();
  Even.fancybox();
});

Even.responsiveTable();
Even.flowchart();
Even.sequence();

if (window.hljs) {
  hljs.initHighlighting();
  Even.highlight();
} else {
  Even.chroma();
}

// copy codes
// based on https://xinyo.org/archives/66226

$(function() {
  //用 div 包裹 figure 便于定位
  $('figure.highlight').wrap('<div class="highlight-wrapper"></div>')
  //添加复制按钮
  $('figure.highlight').before('<div class="copy-code btn btn-outline-secondary">copy</div>');

  //为复制按钮添加click事件
  $(".copy-code").on("click", function() {
    //初始化
    $("textarea").remove("#targetId");

    //获取对应的代码
    var codeText = '';
    $(this).next('figure').find('td.code div.line').each(function() {
      codeText += $(this).text() + '\n';
    });

    //添加 <textarea> DOM节点，将获取的代码写入
    var target = document.createElement("textarea");
    target.style.opacity = 0;
    target.style.left = "-9999px";
    target.id = "targetId";
    $(this).append(target);
    target.textContent = codeText;

    //选中textarea内的代码
    target.focus();
    target.setSelectionRange(0, target.value.length);

    // 复制选中的内容
    document.execCommand("copy");

    //删除添加的节点
    $("textarea").remove("#targetId");
    $(this).html("copied!");
    var thisCopied = $(this);
    setTimeout(function() {
      thisCopied.html("copy");
    }, 1200)
  })
})
