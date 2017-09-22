var textArray = [ 
  "This is your last chance.",
  "だがもし赤い薬を飲めば、君の物語はまだ終わらない。",
  "After this, there is no turning back.",
  "この世界が抱える秘密の深淵にお連れしよう。",
  "There is no spoon.",
  "入り口までは案内するが､扉は君自身で開けろ。",
  "Follow the white rabbit.",
  "道を知っていることと、実際にその道を歩くことは、別物だ。",
  "What is real?",
  "人生は自分で決めるものよ。",
  "You have to see it for yourself.",
  "重要なのは、何事も理由があって起こるということだ。",
  "You've already made the choice.",
  "'マトリックス'って何だ？",
  "Don't think you are - know you are."
];


// Get a random number from min to max
function genRandNum(min, max) {

  return Math.floor(Math.random() * (max - min + 1)) + min;
}


// Get a random alpha-numberic string for the specified length
function genRandString(length) {

  return Math.random().toString(36).substr(2, length)
}


// Create randomly named divs to hold the text div and parent container div
function genRandDiv(containerId, textId) {

  var divData = '<div id="' + containerId + '" class="m_container"><div id="' + textId + '"></div></div>';

  return divData;
}


// Incrementally loops through text character by character
function outputText(text, i, textId, randChar, callback) {

  // var spans = $("#text").children();
  var spans = $("#" + textId).children();

  if (i < text.length) {

    // create a unique id for character and wrap in span for targeting later
    var charSpan = '<span id="char_' + randChar + "_" + i + '">' + text[i] + '</span>'

    // set characters before the leading 3 to lime
    if (spans.length > 2) {
      $("#char_" + randChar + "_" + (spans.length - 3)).addClass("m_trailing");
    }

    // fade out beginning characters after 10 characters are on screen
    if (spans.length > 9) {
      $("#char_" + randChar + "_" + (spans.length - 11)).fadeTo(1500, 0);
    }

    // write resulting character (span) to target element
    $("#" + textId).append(charSpan);

    // recursive call for next character after delay (default = 100)
    setTimeout(function() {
      outputText(text, i + 1, textId, randChar, callback)
    }, 100);

  } else {

    // the remaining characters that need faded
    var remaining = spans.length - 11;

    // fade the target character then call 
    function fadeEnd(remaining) {
      $("#char_" + randChar + "_" + remaining).fadeTo(1500, 0);
      evaluateRemaining();
    }

    // call fadeEnd() after the specified delay (default = 100)
    function initSetTimeout(callback) {
      setTimeout(callback, 100)
    }

    // conditionally call initSetTime() with an incremented remaining value
    function evaluateRemaining() {
      if (remaining < spans.length) {
        initSetTimeout(fadeEnd.bind(null, remaining++));  // Function.prototype.bind()
      }
    }

    // progressively (and recursively) fade out the rest of the characters
    evaluateRemaining();

    // callback to mDriver() for next item in textArray
    setTimeout(callback, 3000);
  }
}


// Drives the outputText function with incremented index value
function mDriver(i, containerId, textId, randChar) {

  // empty the existing text
  $("#" + textId).empty();

  // generate random numbers
  var randXLocation = genRandNum(0, 100);
  var randYLocation = genRandNum(0, 15);
  var randFontSize = genRandNum(8, 24);

  $("#" + containerId).css("right", randXLocation + "%");
  $("#" + containerId).css("top", randYLocation + "%");
  $("#" + textId).css("font-size", randFontSize + "px");

  // after callback (and whole text has been animated), start next text
  outputText(textArray[i], 0, textId, randChar, function() {
    mDriver(genRandNum(0, 6), containerId, textId, randChar);
  });
}


//
function mInit() {

  // generate random values
  var randText = genRandNum(0, 14);
  var randChar = genRandString(3);
  var randContainerId = "cont_" + genRandString(6);
  var randTextId = "text_" + genRandString(8);
  var randDiv = genRandDiv(randContainerId, randTextId);

  // append the random DIVs to the main DIV
  $("#matrix").append(randDiv);

  // start the text animation
  mDriver(randText, randContainerId, randTextId, randChar);
}



$(document).ready(function() {

  var m = 20;
  while (m--) {
    setTimeout(function() {
      mInit();
    }, 1000);
  }
});