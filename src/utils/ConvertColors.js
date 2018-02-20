

/**
 * ex:
 * alert( hexToRgb("#0033ff").g ); // 51;
 * alert( hexToRgb("#03f").g ); // 51;
 * 
 * @export
 * @param {string} hexColorString 
 * @returns {json}
 */
export function hexToRgb(hexColorString) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hexColorString = hexColorString.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColorString);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
  } : null;
}

/**
 * @param {string} cssColorString 
 * @returns {string} "#008080"
 */
export function convertToHexColor(cssColorString) {
  var a = document.createElement('div');
  a.style.color = cssColorString;
  var colors = window.getComputedStyle( document.body.appendChild(a) ).color.match(/\d+/g).map(function(a){ return parseInt(a,10); });
  document.body.removeChild(a);
  return (colors.length >= 3) ? '#' + (((1 << 24) + (colors[0] << 16) + (colors[1] << 8) + colors[2]).toString(16).substr(1)) : false;
}


export function getShadowRgbString(cssColorString) {
  var hexColorString = convertToHexColor(cssColorString);
  var rgbObject = hexToRgb(hexColorString);
  return "rgba(" + rgbObject.r + "," + rgbObject.g + "," + rgbObject.b + ",0.4)";
}