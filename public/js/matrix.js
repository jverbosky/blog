var master = {};  // holds columns and populatedDiv


// Populates matrix with code rain
function initializeMatrix() {

  // full-width characters
  var kanji = ["弁","才","千"];
  var katakana = ["ネ","ハ","メ","ム","フ","チ","コ","ロ","リ","ノ","ソ","ン","レ","二","カ","オ","ジ","ゴ","ミ","テ","キ","ケ"];
  var hiragana = ["く","や","の"];
  var numbers = ["０","１","２","３","４","５","６","７","８","９"];
  var letters = ["Ｚ"];
  var symbols = ["＝", "＋"];
  var charSet = kanji.concat(katakana, hiragana, numbers, letters, symbols);


  // Get a random number from min to max
  function genRandNum(min, max) {

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  // Get a random alpha-numberic string for the specified length
  function genRandId(length) {

    return Math.random().toString(36).substr(2, length)
  }


  // Create a random string from charSet (string length = 24 | font-size: 24px)
  function genRandString() {

    // don't let kanji be first character (column jumps to right)
    var randString = charSet[genRandNum(3, charSet.length - 1)];

    for (var i=0; i<60; i++) {
      randString += charSet[genRandNum(0, charSet.length - 1)];
    }

    return randString;
  }


  // Randomly apply changes to characters
  function transformChar(targetId, charId, speed) {

    var frequency = genRandNum(0, 100)
    var randomChar = charSet[genRandNum(0, charSet.length - 1)];

    if (frequency <= 15) {
      $("#char_" + charId + "_" + targetId).text(randomChar);
      if (frequency === 0) {
        $("#char_" + charId + "_" + targetId).css("opacity", "1");
        $("#char_" + charId + "_" + targetId).fadeTo(2000, 0);
      }
    } else if (frequency >= 16 && frequency <= 20) {
      $("#char_" + charId + "_" + targetId).css("opacity", "0");
    } else if (frequency >= 21 && frequency <= 25) {
      $("#char_" + charId + "_" + targetId).css("font-weight", "bold");
    } else if (frequency >= 26 && frequency <= 32) {
      $("#char_" + charId + "_" + targetId).css("transform", "rotate(90deg)");
    } else if (frequency === 42) {
      $("#char_" + charId + "_" + targetId).text(randomChar);
      $("#char_" + charId + "_" + targetId).css("opacity", "1");
      $("#char_" + charId + "_" + targetId).fadeTo(3000, 0);
    }
  }


  // Incrementally loops through text character by character
  function outputText(div, string, i, textId, charId, slength, speed, callback) {

    var spans = $("#" + textId).children();

    if (i < string.length) {

      // create a unique id for character and wrap in span for targeting later
      var charSpan = '<span id="char_' + charId + "_" + i + '" class="m_span bold">' + string[i] + '</span>'

      // gradually re-color non-leading characters from white to Matrix green
      if (spans.length > 0) {
        $("#char_" + charId + "_" + (spans.length - 1)).css("color", "#EDFBE4");
        $("#char_" + charId + "_" + (spans.length - 1)).removeClass("bold");
      }

      if (spans.length > 1) {
        $("#char_" + charId + "_" + (spans.length - 2)).css("color", "#D6F5CB");
      }

      if (spans.length > 2) {
        $("#char_" + charId + "_" + (spans.length - 3)).css("color", "#A8E999");
      }

      if (spans.length > 3) {
        $("#char_" + charId + "_" + (spans.length - 4)).css("color", "#7ADD67");
      }

      if (spans.length > 4) {
        $("#char_" + charId + "_" + (spans.length - 5)).css("color", "#4CD135");
      }    

      if (spans.length > 5) {
        $("#char_" + charId + "_" + (spans.length - 6)).css("color", "#1EC503");
      } 

      // randomly replace characters and flip character orientation
      if (spans.length > 10) {
        var targetId = genRandNum(0, spans.length);
        transformChar(targetId, charId, speed);
      }

      // fade out beginning characters after random number of characters are on screen
      if (spans.length > slength) {
        $("#char_" + charId + "_" + (spans.length - slength - 1)).fadeTo(speed, 0);
      }

      // write resulting character (span) to target element
      $("#" + textId).append(charSpan);

      // recursive call for next character after delay (default = 100)
      setTimeout(function() {
        outputText(div, string, i + 1, textId, charId, slength, speed, callback)
      }, speed);

    } else {

      // the remaining characters that need faded
      var remaining = spans.length - slength - 1;

      // fade the target character then call evaluateRemaining();
      function fadeEnd(remaining) {
        if (speed > 60) { speed -= 50; }  // minimize pop-outs for slow speeds
        $("#char_" + charId + "_" + remaining).fadeTo(speed, 0);
        evaluateRemaining();
      }

      // call fadeEnd() after the specified delay
      function initSetTimeout(callback) {
        setTimeout(callback, speed);
      }

      // conditionally call initSetTime() with an incremented remaining value
      function evaluateRemaining() {
        if (remaining < spans.length) {
          initSetTimeout(fadeEnd.bind(null, remaining++));  // Function.prototype.bind()
        }
      }

      // progressively fade out the rest of the characters
      evaluateRemaining();

      // callback to mDriver() for next string
      setTimeout(callback, 5000);
    }
  }


  // Drives the outputText function with incremented index value
  function mDriver(div, string, containerId, textId, charId, slength, speed) {

    // append the random text DIV to a randomly selected available container DIV
    var randTextDiv = '<div id="' + textId + '" class="flip_vertical"></div>'
    $("#" + containerId).append(randTextDiv);

    // only run if matrix isn't stopped - use to handle delayed callback
    if (master.populatedDiv) {

      // after callback (and whole text has been animated), start next text
      outputText(div, string, 0, textId, charId, slength, speed, function() {
        $("#" + containerId).empty();  // remove text div from container div
        master.populatedDiv.push(div);  // make the div available for selection
        genRandoms();  // generate new random values for next string
      });

    }
  }


  // Generate random values to help the matrix feel more organic
  function genRandoms() {

    // generate random values
    var randDiv = master.populatedDiv[Math.floor(Math.random() * master.populatedDiv.length)];
    var randDivIndex = master.populatedDiv.indexOf(randDiv);
    var randContainerId = "cont_" + randDiv;
    var randTextId = "text_" + genRandId(8);
    var randString = genRandString();
    var randStringLength = genRandNum(20, 50);
    var randCharId = genRandId(3);
    var randSpeed = genRandNum(50, 150);

    // remove randDiv value from populatedDiv to prevent overlapping divs
    if (randDivIndex > -1) {
      master.populatedDiv.splice(randDivIndex, 1);
    }

    mDriver(randDiv, randString, randContainerId, randTextId, randCharId, randStringLength, randSpeed);
  }


  // Uses self-invoking recursive function to stagger initial population of text divs
  function populateMatrix() {

    (function staggerDivPopulation(i) {
      setTimeout(function() {
        genRandoms();
        if (--i) {
          staggerDivPopulation(i);
        }
      }, 250);
    }) (master.columns)
  }


  // Calculate and create divs to hold the text div and parent container div
  function setupDivs() {

    var canvasWidth = $(".divider").width();
    var divWidth = 14;  // equal to character pixel size
    var divCount = Math.floor(canvasWidth / divWidth);
    master.columns = Math.floor(divCount / 2);
    var matrixWidth = divWidth * divCount;
    var divSet = [];

    // create container divs
    for (var i=0; i<divCount; i++) {
      var containerId = "cont_" + i;
      var containerDiv = '<div id="' + containerId + '" class="m_container"></div>';

      divSet.push(containerDiv);  // use to populate matrix
      master.populatedDiv.push(i);  // use to track which container divs are in use
    }

    $("#matrix").css({"width": matrixWidth, "margin": "0 auto"});  // center matrix div
    $("#matrix").children().remove();
    $("#matrix").append(divSet);
  }


  setupDivs();
  populateMatrix();
}


// Adjust height of Matrix Code Rain accordion panel
function matrixPanelResize() {
    var acc_matrix = document.getElementById("acc_matrix");
    var panel = acc_matrix.nextElementSibling;
    panel.style.maxHeight = panel.scrollHeight + "px";
}


// Setup objects and start running matrix code rain
function startMatrix() {

  master.columns = 0;
  master.populatedDiv = [];
  $("#m_canvas").append('<div id="matrix" class="matrix"></div>');
  $("#m_canvas").removeClass("div_hide");
  matrixPanelResize();
  doScrolling("#m_scroll", 800);

  setTimeout(function() {
    initializeMatrix();
  }, 800);
}


// Clean up all matrix elements
function purgeCanvas() {

    delete master.columns;
    delete master.populatedDiv;
    $("#m_canvas").children().remove();
    $("#m_canvas").removeAttr("style");
}


// Clear all queued timeouts
function stopAllTimeouts() {
  
  // get id of latest timeout by adding a null timeout
  var timeoutId = window.setTimeout(null, 0);
  
  while (timeoutId--) {
    window.clearTimeout(timeoutId);
  }
}


// Teardown objects and stop running matrix code rain
function stopMatrix() {

  stopAllTimeouts();
  purgeCanvas();
}