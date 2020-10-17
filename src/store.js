import Vue from 'vue'

import TheDataStore from './classes/TheDataStore.js'

// Vue components import this shared instance of "TheDataStore".
const store = Vue.observable(new TheDataStore({
  addProp: (obj, key, val) => Vue.set(obj, key, val),
  delProp: (obj, key) => Vue.delete(obj, key),
}))

export default store 