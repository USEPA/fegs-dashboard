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
  appTitle: 'FEGS Scoping Tool', // fallback name... this value is set with IPC in main.js
  state: null, // must be one of 'loading', 'loaded', 'unloading', or null
})

// Unique id generator.
export const uid = {
  num: 0,
  next() {
    return `id-${this.num++}`
  },
}
