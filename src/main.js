import Vue from 'vue'
import AppElectron from './AppElectron.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { project, misc } from './store.js'

// IMPORTANT! Don't use any node modules in the render process, wrap them in preload.js instead.


// Setup Font Awesome icons.
library.add(faCheck) // add each icon here after importing
Vue.component('FontAwesomeIcon', FontAwesomeIcon)


// Disable annoying console warning.
Vue.config.productionTip = false


// Electron application entry.
if (process.env.IS_ELECTRON) {

  function send(cmd, data=null) {
    window.ipc.send('msg', { cmd, data })
  }

  // Register data change listener.
  project.onModified(() => send('unsave'))

  // Register main process message listener.
  window.ipc.on('msg', ({ cmd, data }) => {
    console.debug(`IPC Command: ${cmd}`)
    switch (cmd) {
      case 'new':
        project.new()
        send('name', project.data.meta.name)
        break
      case 'load':
        try {
          project.load(data)
          send('name', project.data.meta.name)
        } catch (error) {
          console.error(`Error: ${error.message}`) // TODO: handle elegantly?
        }
        break
      case 'save':
        send('save', project.getSaveable())
        break
      case 'saved':
        project.modified = false
        break
      case 'answer':
        misc.appTitle = data.appTitle
        break
      default:
        throw Error(`Unknown command "${cmd}"`) // programmer error
    }
  })

  // Query main process for information (app title).
  send('query')

  // Create new project.
  project.new()

  // Mount the Vue app.
  new Vue({
    render: h => h(AppElectron),
  }).$mount('#app')


// Web application entry.
} else {
  // TODO different top level Vue app to handle new/load/save/title etc
  
}
