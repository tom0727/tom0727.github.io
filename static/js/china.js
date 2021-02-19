/*function isInChina(cb) {
  var url = 'https://graph.facebook.com/feed?callback=h';
  var xhr = new XMLHttpRequest();
  var called = false;
  xhr.open('GET', url);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      called = true;
      cb(false);
    }
  };
  xhr.send();
  // timeout 1s, this facebook API is very fast.
  setTimeout(function() {
    if (!called) {
      xhr.abort();
      cb(true);
    }
  }, 1500);
};

function china() {
    isInChina(function(inChina) {
        if (inChina) {
            window.alert("In China!");
            cur_url = window.location.href;
            new_url = cur_url.replace("github", "gitee")
            if (new_url != cur_url) {
                window.location = new_url;
            }
        } else {
            window.alert("Not in China!");
        }
    });
}

if (!document.referrer.match(/tom0727.github.io|tom0727.gitee.io|localhost/)) {
    china();
} else {
    window.alert("not changing!");
}*/
