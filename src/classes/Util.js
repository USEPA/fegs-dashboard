
export default class Util {
  // create a clone of a primitive object, optionally ignoring specified keys
  static cloneObj(obj, ignore=[]) {
    const ret = (Array.isArray(obj)) ? [] : {}
    Object.entries(obj).forEach(([key, val]) => {
      if (ignore.includes(key)) return
      if (val && typeof val === 'object') {
        ret[key] = this.cloneObj(val, ignore)
      } else {
        ret[key] = val
      }
    })
    return ret
  }

  // rename a key in an object
  static renameKey(obj, oldKey, newKey) {
    const oldVal = obj[oldKey]
    const newVal = (oldVal && typeof oldVal === 'object') ? this.cloneObj(oldVal) : oldVal
    delete obj[oldKey]
    obj[newKey] = newVal
  }

  // recursively delete specified keys from object
  static filterObj(obj, remove=[]) {
    Object.entries(obj).forEach(([key, val]) => {
      if (remove.includes(key)) {
        delete obj[key]
      } else if (val && typeof val === 'object') {
        this.filterObj(val, remove)
      }
    })
  }

  // erase contents of dest object and replace with contents of src object
  static replaceObj(dest, src) {
    Object.keys(dest).forEach(key => {
      delete dest[key]
    })
    Object.entries(src).forEach(([key, val]) => {
      dest[key] = val
    })
  }

  // get a value multiple keys deep in an object, returns undefined if keys are missing
  static deepGet(obj, [key, ...rest]) {
    const val = (typeof obj === 'object' && key in obj) ? obj[key] : undefined
    return (rest.length > 0) ? this.deepGet(val, rest) : val
  }

  // set a value multiple keys deep in an object, creates objects as necessary
  static deepSet(obj, [key, ...rest], val) {
    if (rest.length > 0) {
      if (!(key in obj && typeof obj[key] === 'object')) obj[key] = {}
      this.deepSet(obj[key], rest, val)
    } else {
      obj[key] = val
    }
  }

  // get a nicely formatted JSON string from an object
  static strObj(obj) {
    return JSON.stringify(obj, null, 2)
  }

  // remove specified item from an array, if possible
  static remove(arr, item) {
    const index = arr.indexOf(item);
    if (index > -1) {
      arr.splice(index, 1);
    }
  }

  // replace item in array, if possible
  static replace(arr, oldItem, newItem) {
    const index = arr.indexOf(oldItem);
    if (index > -1) {
      arr.splice(index, 1, newItem) // detectable by Vue
    }
  }

  // check if a value is a regular number (not null, undefined, NaN, object, etc)
  static isNum(val) {
    return (typeof val === 'number' && !Number.isNaN(val))
  }

  // round a number to the specified decimal place
  static round(num, decimals=0) {
    return Math.round(num*Math.pow(10, decimals))/Math.pow(10, decimals)
  }

  // call a potentially undefined function
  static safeCall(func=undefined, ...args) {
    return (typeof func === 'function') ? func(...args) : undefined
  }

  // create an element specified by an object
  static element({ tag, cls, text, childs, ...rest }) {
    const ele = document.createElement(tag)
    if (cls) ele.className = cls
    if (text) ele.innerText = text
    if (childs) childs.forEach(child => ele.appendChild(this.element(child))) // recursive
    Object.entries(rest).forEach(([key, val]) => ele.setAttribute(key, val))
    return ele
  }

  // focus provided node or the first focusable descendant of the node (depth first)
  static focusFirst(node) {
    node.focus() // attempt to focus element
    if (document.activeElement === node) return true // success, element focused
    for (let i = 0; i < node.children.length; i++) {
      if (this.focusFirst(node.children[i])) return true // success, descendant focused
    }
    return false // failure, no element focused
  }

  // determine if running on macOS, Node only
  static isMac() {
    if (!process) throw Error('This method only works in a Node environment') // programmer error
    return (process.platform === 'darwin')
  }

  // determine if running in development mode, Node only
  static isDev() {
    if (!process) throw Error('This method only works in a Node environment') // programmer error
    return (process.env.NODE_ENV && process.env.NODE_ENV.slice(0, 3) === 'dev')
  }
}