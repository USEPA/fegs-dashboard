import Vue from 'vue'

import TheProjectStore from './classes/TheProjectStore.js'
import Util from './classes/Util.js'

// Common instance of "TheProjectStore".
export const project = Vue.observable(new TheProjectStore({
  addProp: (obj, key, val) => Vue.set(obj, key, val),
  delProp: (obj, key) => Vue.delete(obj, key),
}))

// Miscellaneous shared data.
export const misc = Vue.observable({
  appTitle: '',
})

// Unique id generator.
export const uid = {
  num: 0,
  next() {
    return `id-${this.num++}`
  },
}

// Input validation and manipulation
export const input = {
  validateNum(val, { min=0, max=100, decimals=2 }={}) { // val may be null
    if (val === '' || val === null) return { val: null, err: '' }
    const num = parseFloat(val)
    if (Number.isNaN(num)) return { val: null, err: 'num' }
    if (num > max) return { val: max, err: 'max' }
    if (num < min) return { val: min, err: 'min' }
    return { val: Util.round(num, decimals), err: '' }
  },
  scaleUp(val, { mult=100, decimals=2 }={}) { // val may be null
    return Util.isNum(val) ? Util.round(val*mult, decimals) : null
  },
  scaleDown(val, { mult=100, decimals=4 }={}) { // val may be null
    return Util.isNum(val) ? Util.round(val/mult, decimals) : null
  },
}