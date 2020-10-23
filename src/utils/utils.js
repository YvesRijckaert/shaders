export const getPowerOfTwo = (value, pow) => {
  pow = pow || 1;
  while (pow < value) {
    pow *= 2;
  }
  return pow;
};

export const measureText = (ctx, textToMeasure) => {
  return ctx.measureText(textToMeasure).width;
};

export const createMultilineText = (ctx, textToWrite, maxWidth, text) => {
  textToWrite = textToWrite.replace("\n", " ");
  var currentText = textToWrite;
  var futureText;
  var subWidth = 0;
  var maxLineWidth = 0;

  var wordArray = textToWrite.split(" ");
  var wordsInCurrent, wordArrayLength;
  wordsInCurrent = wordArrayLength = wordArray.length;

  while (measureText(ctx, currentText) > maxWidth && wordsInCurrent > 1) {
    wordsInCurrent--;

    currentText = futureText = "";
    for (var i = 0; i < wordArrayLength; i++) {
      if (i < wordsInCurrent) {
        currentText += wordArray[i];
        if (i + 1 < wordsInCurrent) {
          currentText += " ";
        }
      } else {
        futureText += wordArray[i];
        if (i + 1 < wordArrayLength) {
          futureText += " ";
        }
      }
    }
  }
  text.push(currentText);
  maxLineWidth = measureText(ctx, currentText);

  if (futureText) {
    subWidth = createMultilineText(ctx, futureText, maxWidth, text);
    if (subWidth > maxLineWidth) {
      maxLineWidth = subWidth;
    }
  }

  return maxLineWidth;
};
