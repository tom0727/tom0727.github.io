const JSON_FILE_PATH = "../contests.json";
var PROBLEM_INDEX = "ABCDEFGHI";

var allContestData;
var isMobile;

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
  var link = `<a href='${problemLink}' target='_blank' rel='noopener' style='color: rgb${color}'>${index}. ${problemName}</a>`;

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

function loadDivContent(activeType) {
  $("#main-table thead").empty();
  $("#main-table tbody").empty();
  var maxLength = 0;

  // loading table content
  for (let i = 0; i < allContestData.length; i++) {
    var contestInfo = allContestData[i];
    var id = contestInfo["id"];
    var type = contestInfo["type"];
    var problemList = contestInfo["problems"];
    var hasSubProblem = contestInfo["sub"];
    var contestName = contestInfo["name"];

    if (type != activeType) continue;

    // var tableRowContent = `<tr><td><a href='https://codeforces.com/contest/${id}' target='_blank' rel='noopener'>CF${id}</a></td>`;
    var tableRowContent = `<tr><th><a href='https://codeforces.com/contest/${id}' target='_blank' rel='noopener'>${contestName}</a></th>`;

    var problemCount = 0;
    for (let j = 0; j < problemList.length; j++) {
      let problem = problemList[j];
      let index = problem["index"];
      let problemName = problem["name"];
      let rating = problem["rating"];

      let problemSpan = getProblemSpan(id, index, problemName, rating);
      if (index.length > 1) {
        if (j > 0 && problemList[j-1]["index"].length > 1) {
          tableRowContent += `${problemSpan}</td>`;
          problemCount++;
        } else {
          tableRowContent += `<td>${problemSpan}<br><br>`;
        }
      } else {
        tableRowContent += `<td>${problemSpan}</td>`;
        problemCount++;
      }
    }
    tableRowContent += "</tr>";
    $("#main-table tbody").append(tableRowContent);

    for (let j = 0; j < problemList.length; j++) {
      let problem = problemList[j];
      let index = problem["index"];
      let rating = problem["rating"];
      let solved = problem["solved"];
      let attempted = problem["attempted"];
      $(`#${id}${index}`).hover(function(event) {
        $(".tooltip-inner").html(`Rating: ${rating}<br>Submission: ${solved}/${attempted}`);
        $(".tooltip-inner").css({top: event.clientY, left: event.clientX}).show();
      }, function() {
        $(".tooltip-inner").hide();
      });
    }

    maxLength = Math.max(maxLength, problemCount);
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

  // console.log(allContestData[0]);
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

$(function() {
  isMobile = window.matchMedia("only screen and (max-width: 799px)").matches;
  addButtonListener();
  loadJSON();
  loadDivContent("Div1");
});
