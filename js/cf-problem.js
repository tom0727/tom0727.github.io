const JSON_FILE_PATH = "../contests.json";
var PROBLEM_INDEX = "ABCDEFGHIJKLMNO";

var allContestData;
var isMobile;
var isLoggedin;
var submission = {};
var max_subproblem_count = {};


function getProblemSpan(contestId, index, problemName, rating) {
  var allContent = "";
  var circleAttribute = "";
  var circleSpan = ""

  var lowLimit, highLimit;
  var color = "", colorPercent = 0;
  if (rating < 1200) {
    lowLimit = 800;
    highLimit = 1199;
    color = "(128, 128, 128)";
  } else if (rating < 1400) {
    lowLimit = 1200;
    highLimit = 1399;
    color = "(0, 128, 0)";
  } else if (rating < 1600) {
    lowLimit = 1400;
    highLimit = 1599;
    color = "(3, 168, 158)";
  } else if (rating < 1900) {
    lowLimit = 1600;
    highLimit = 1899;
    color = "(0, 0, 255)";
  } else if (rating < 2100) {
    lowLimit = 1900;
    highLimit = 2099;
    color = "(170, 0, 170)";
  } else if (rating < 2400) {
    lowLimit = 2100;
    highLimit = 2399;
    color = "(255, 140, 0)";
  // } else if (rating < 2600) {
  //   lowLimit = 2400;
  //   highLimit = 2599;
  //   color = "(255, 99, 71)";
  } else if (rating < 3000) {
    // lowLimit = 2600;
    lowLimit = 2400;
    highLimit = 2999;
    color = "(255, 0, 0)";
  } else {
    lowLimit = 3000;
    highLimit = 3500;
    color = "(0, 0, 0)";
  }
  colorPercent = Math.round((rating - lowLimit) * 100 / (highLimit - lowLimit));
  circleAttribute = `id='${contestId}${index}' class='difficulty-circle' style='border-color: rgb${color}; background: linear-gradient(to top, rgb${color} 0%, rgb${color} ${colorPercent}%, rgba(0, 0, 0, 0) ${colorPercent}%, rgba(0, 0, 0, 0) 100%);'`;
  circleSpan = `<span ${circleAttribute}></span>`;
  allContent += circleSpan;

  let problemLink = `https://codeforces.com/contest/${contestId}/problem/${index}`;
  var link = `<a id='${contestId}${index}_link' href='${problemLink}' target='_blank' rel='noopener' style='color: rgb${color}'>${index}. ${problemName}</a>`;

  allContent += link;
  return allContent;
}

function addButtonListener() {
  $('.btn-group button').each(function() {
    $(this).on('click', function() {
      $('.btn-group button').each(function() {
        $(this).removeClass("active");
      });
      $(this).addClass("active");
      loadDivContent($(this).text());
    });
  });
}

function renderUserACStatus() {
  for (let probId in submission) {
    if (!($(probId).length)) continue;
    if (probId[probId.length-1] == '1') {  // has subproblem
      let parent = $(probId).parent();
      probId = probId.slice(0, -1);

      id = parseInt(probId.replace(/[^0-9\.]/g, ''), 10);
      cur_sub = parent.children("span").length;
      max_sub = max_subproblem_count[id];

      let sub = [];
      for (let i = 1; i <= cur_sub; i++) {
        let cur_probId = probId + i.toString();
        if (cur_probId in submission) {
          if (submission[cur_probId] == "OK") sub.push(1);  // OK
          else sub.push(-1);  // TRY
        } else {
          sub.push(0);  // not attempted
        }
      }
      // console.log(probId);
      // let sub1 = 0, sub2 = 0;
      // if ((probId + '1') in submission) {
      //   if (submission[probId + '1'] == "OK") sub1 = 1;
      //   else sub1 = 2;
      // }
      // if ((probId + '2') in submission) {
      //   if (submission[probId + '2'] == "OK") sub2 = 1;
      //   else sub2 = 2;
      // }
      parent.removeClass();
      // all OK or all TRY
      if (sub.every(v => v === 1)) parent.addClass("OK");
      else if (sub.every(v => v === -1)) parent.addClass("TRY");
      else {
        // linear-gradient(to bottom, #d4edc9 0%,#d4edc9 33%, #fff 33%,#fff 66%, #ffe3e3 66%,#ffe3e3 100%)
        let background_style = `linear-gradient(to bottom, `;
        let cur_percent = 0;
        for (let i = 0; i < sub.length; i++) {
          let color = "";
          if (sub[i] == 1) {
            color = "#d4edc9";
          } else if (sub[i] == 0) {
            color = "#fff";
          } else if (sub[i] == -1) {
            color = "#ffe3e3";
          }
          background_style += `${color} ${cur_percent}%,`;
          cur_percent += Math.round(100 / max_sub);
          background_style += `${color} ${cur_percent}%,`;
        }
        background_style = background_style.slice(0, -1) + ")";
        // background_style += ')';
        console.log(background_style);
        parent.css("background", background_style);
      }

      // if (sub1 == 0 && sub2 == 1) parent.addClass("OK-2");
      // if (sub1 == 0 && sub2 == 2) parent.addClass("TRY-2");
      // if (sub1 == 1 && sub2 == 0) parent.addClass("OK-1");
      // if (sub1 == 1 && sub2 == 1) parent.addClass("OK");
      // if (sub1 == 1 && sub2 == 2) parent.addClass("OK-TRY");
      // if (sub1 == 2 && sub2 == 0) parent.addClass("TRY-1");
      // if (sub1 == 2 && sub2 == 1) parent.addClass("TRY-OK");
      // if (sub1 == 2 && sub2 == 2) parent.addClass("TRY");
    } else {
      let parent = $(probId).parent();
      parent.removeClass();
      parent.addClass(submission[probId]);
    }
  }
}

function loadUserACStatus(username) {
  // console.log("username = " + username);
  if ($.isEmptyObject(submission)) {
    $.ajax({
      url: `https://codeforces.com/api/user.status?handle=${username}`,
      type: 'GET',
      retryLimit: 3,
      success: function(data) {
        for (let i = 0; i < data["result"].length; i++) {
          let problem = data["result"][i]["problem"];
          let verdict = data["result"][i]["verdict"];
          let id = problem["contestId"], index = problem["index"];
          let probId = `#${id}${index}`;
          if (verdict == "OK") {
            submission[probId] = "OK";
          } else {
            if (!(probId in submission)) {
              submission[probId] = "TRY";
            }
          }
        }
        renderUserACStatus();
      }, 
      error : function(xhr, textStatus, errorThrown) {
        this.retryLimit--;
        if (this.retryLimit > 0) {
          $.ajax(this);  // retry
          return;
        }
      }
    });
  } else {
    renderUserACStatus();
  }
}

function loadDivContent(activeType) {
  $("#main-table thead").empty();
  $("#main-table tbody").empty();
  var maxLength = 0;

  // loading table content
  for (let i = 0; i < allContestData.length; i++) {
    var contestInfo = allContestData[i];
    var type = contestInfo["type"];
    if (type != activeType) continue;
    var id = contestInfo["id"];
    var problemList = contestInfo["problems"];
    var hasSubProblem = contestInfo["sub"];
    var contestName = contestInfo["name"];
    if (contestName.startsWith("Codeforces ")) {
      contestName = contestName.replace("Codeforces ", "");
    } else if (contestName.startsWith("Educational Codeforces ")) {
      contestName = contestName.replace("Educational Codeforces ", "Edu ");
    }
    if (!(id in max_subproblem_count)) max_subproblem_count[id] = 1;

    // var tableRowContent = `<tr><td><a href='https://codeforces.com/contest/${id}' target='_blank' rel='noopener'>CF${id}</a></td>`;
    var tableRowContent = `<tr><th><a id='CF${id}' href='https://codeforces.com/contest/${id}' target='_blank' rel='noopener'>${contestName}</a><br><a href='https://codeforces.com/contest/${id}' target='_blank' rel='noopener'>(CF${id})</a></th>`;

    var problemCount = 0;
    for (let j = 0; j < problemList.length; j++) {
      let problem = problemList[j];
      let index = problem["index"];
      let problemName = problem["name"];
      let rating = problem["rating"];

      let problemSpan = getProblemSpan(id, index, problemName, rating);
      if (index.length > 1) {
        max_subproblem_count[id] = Math.max(max_subproblem_count[id], parseInt(index[index.length-1]));
        if (j > 0 && problemList[j-1]["index"].length > 1 && problemList[j]["index"][0] == problemList[j-1]["index"][0]
            && (j == problemList.length - 1 || (problemList[j]["index"][0] != problemList[j+1]["index"][0]))) {
          tableRowContent += `${problemSpan}</td>`;
          problemCount++;
        } else {
          if (index[index.length-1] == "1") {
            tableRowContent += `<td>${problemSpan}<br><br>`;
          } else {
            tableRowContent += `${problemSpan}<br><br>`;  // cannot add new td if it is not first
          }
        }
      } else {
        tableRowContent += `<td>${problemSpan}</td>`;
        problemCount++;
      }
    }

    tableRowContent += "</tr>";
    $("#main-table tbody").append(tableRowContent);

    $(`#CF${id}`).hover(function(event) {
      let contestName = allContestData[i]["name"];
      $(".tooltip-inner").html(`${contestName}`);
      $(".tooltip-inner").css({top: event.clientY, left: event.clientX}).show();
    }, function() {
      $(".tooltip-inner").hide();
    });

    for (let j = 0; j < problemList.length; j++) {
      let problem = problemList[j];
      let index = problem["index"];
      let rating = problem["rating"];
      let solved = problem["solved"];
      let attempted = problem["attempted"];
      let name = problem["name"];
      let contestId = problem["contestId"];
      $(`#${id}${index}`).hover(function(event) {
        $(".tooltip-inner").html(`Rating: ${rating}<br>Submission: ${solved}/${attempted}`);
        $(".tooltip-inner").css({top: event.clientY, left: event.clientX}).show();
      }, function() {
        $(".tooltip-inner").hide();
      });
      $(`#${id}${index}_link`).hover(function(event) {
        $(".tooltip-inner").html(`CF${contestId}${index}. ${name}`);
        $(".tooltip-inner").css({top: event.clientY, left: event.clientX}).show();
      }, function() {
        $(".tooltip-inner").hide();
      });
    }
    maxLength = Math.max(maxLength, problemCount);
  }

  if (isLoggedin) {
    loadUserACStatus(window.localStorage["cf-username"]);
  }

  // loading table header
  // console.log(maxLength);

  if (!isMobile) {
    var tableHeaderContent = `<tr><th>Contest</th>`;
    for (let i = 0; i < maxLength; i++) {
      tableHeaderContent += `<th>${PROBLEM_INDEX[i]}</th>`;
    }
    tableHeaderContent += `</tr>`;
    $("#main-table thead").html(tableHeaderContent);
  }
}

function loadJSON() {
  $.ajax({
    dataType: "json",
    url: JSON_FILE_PATH,
    async: false,
    success: function(data) {
      allContestData = data;
    }
  });
}

function tryLogin(username) {
  $.ajax({
    url: `https://codeforces.com/api/user.status?handle=${username}`,
    type: 'GET',
    retryLimit: 3,
    success: function() {
      window.localStorage['cf-username'] = username;
      loadLoginContent();
    }, 
    error : function(xhr, textStatus, errorThrown) {
      this.retryLimit--;
      if (this.retryLimit > 0) {
        $.ajax(this);  // retry
        return;
      }
      $(".login-msg").text("Invalid handle.");
      setTimeout(() => {
        $(".login-msg").empty();
      }, 5000);
    }
  });
}

function logout() {
  window.localStorage.removeItem("cf-username");
  for (let key in submission) delete submission[key];

  loadLoginContent();
  loadDivContent($(".btn-group .active").text());
}

function loadLoginContent() {
  $(".navigator-wrapper").empty();
  $(".navigator-wrapper").css("float", "right");
  if (window.localStorage["cf-username"]) {
    isLoggedin = true;
    var username = window.localStorage["cf-username"];
    $(".navigator-wrapper").append(`<button class="username-btn btn" type="button" style='text-decoration: underline'>${username}</button><button class='logout-btn btn' type="button" class="btn">Logout</button>`);
    $(".navigator-wrapper .username-btn").on('click', function() {
      window.open(`https://codeforces.com/profile/${username}`, "_blank", "noopener,noreferrer");
    });
    $(".navigator-wrapper .logout-btn").on('click', logout);
  } else {
    isLoggedin = false;
    $(".navigator-wrapper").append(`<span class='login-msg' style='color: red'></span><input type="text" placeholder="Your handle"><button type="button" id='login-btn' class="btn">Login</button>`);
    $(".navigator-wrapper button").on('click', function() {
      tryLogin($(".navigator-wrapper input").val());
    });
  }
  loadDivContent($(".btn-group .active").text());
}

$(function() {
  isMobile = window.matchMedia("only screen and (max-width: 799px)").matches;
  addButtonListener();
  loadJSON();
  loadLoginContent();
});
