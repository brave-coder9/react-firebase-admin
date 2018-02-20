/**
* Makes first letter uppercase
* @param {String} string, string to be converted
*/
function capitalizeFirstLetter(string){
  return (string.charAt(0).toUpperCase() + string.slice(1)).replace(/_/g, ' ');;
}
exports.capitalizeFirstLetter=capitalizeFirstLetter;

/**
* Gets object class type
* @param {Object} obj
* @example
* getClass("")   === "String";
* getClass(true) === "Boolean";
* getClass(0)    === "Number";
* getClass([])   === "Array";
* getClass({})   === "Object";
* getClass(null) === "null";
*/
function getClass(obj){
  if (typeof obj === "undefined")
    return "undefined";
  if (obj === null)
    return "null";
  return Object.prototype.toString.call(obj)
    .match(/^\[object\s(.*)\]$/)[1];
}
exports.getClass=getClass;


function firebasePathToReactPath(firebasePath){
  //ex. firebasePath =

}
exports.firebasePathToReactPath=firebasePathToReactPath;
