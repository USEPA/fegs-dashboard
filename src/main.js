import Vue from 'vue'
import App from './App.vue'

import Util from './classes/Util.js'
import store from './store.js'

// IMPORTANT! Don't use any node modules in the render process, wrap them in preload.js instead.


// Disable annoying console warning.
Vue.config.productionTip = false

if (process.env.IS_ELECTRON) {

  function send(cmd, data=null) {
    window.ipc.send('msg', { cmd, data })
  }

  // Register data change listener.
  store.onModified(() => send('unsave'))

  // Register main process message listener.
  window.ipc.on('msg', ({ cmd, data }) => {
    console.debug(`IPC Command: ${cmd}`)
    switch (cmd) {
      case 'new':
        store.new()
        send('name', store.data.project.name)
        break
      case 'load':
        try {
          store.load(data)
          send('name', store.data.project.name)
        } catch (error) {
          console.error(`Error: ${error.message}`) // TODO: handle elegantly?
        }
        break
      case 'save':
        send('save', store.getSaveable())
        break
      case 'saved':
        store.modified = false
        break
      case 'answer':
        store.setInfo(data)
        break
      default:
        throw Error(`Unknown command "${cmd}"`) // programmer error
    }
  })

  // Query main process for information (app title)
  send('query')

  // Create new project
  store.new()

  // Mount the Vue app.
  new Vue({
    render: h => h(App),
  }).$mount('#app')

} else { // website
  // TODO different top level Vue app to handle new/load/save/title etc
  
}
