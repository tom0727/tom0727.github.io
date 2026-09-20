// 不蒜子的域名 busuanzi.ibruce.info 已被 EasyList China、anti-AD 等过滤规则表收录，
// 访客只要装了拦截类扩展，脚本就根本不会加载，计数位会永远停在 loading 图上。
// 主题自带的 bszTag.hides() 只在 JSONP 回调抛异常时才触发，覆盖不到"脚本没加载"这种情况。
// 这里兜个底：超时后仍然没拿到数字，就把对应的计数整块藏掉。
// 如果不蒜子只是慢、最终还是返回了，它自己的 shows() 会把元素重新显示出来。
(function () {
  var TIMEOUT = 5000;

  function filled(id) {
    var el = document.getElementById('busuanzi_value_' + id);
    return el && /\d/.test(el.textContent);
  }

  function hide(el) {
    if (el) el.style.display = 'none';
  }

  setTimeout(function () {
    // 页脚的 site pv / site uv 中间夹着一个 "|"，两个都没出数时整块藏掉，
    // 免得剩一个孤零零的分隔符。
    if (!filled('site_pv') && !filled('site_uv')) {
      hide(document.querySelector('.busuanzi-footer'));
    } else {
      if (!filled('site_pv')) hide(document.getElementById('busuanzi_container_site_pv'));
      if (!filled('site_uv')) hide(document.getElementById('busuanzi_container_site_uv'));
    }

    if (!filled('page_pv')) hide(document.getElementById('busuanzi_container_page_pv'));
  }, TIMEOUT);
})();
