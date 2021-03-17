import Vue from 'vue'
import AppElectron from './AppElectron.vue'
import AppWebsite from './AppWebsite.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCheck, faEdit, faTimes, faTrash, faDownload, faThumbtack, faCircle, faExclamationCircle, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { faCircle as farCircle } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome'

import { project, misc } from './store.js'
import Util from './classes/Util'

// IMPORTANT! Don't use any node modules in the render process, use IPC if possible, otherwise wrap the module in preload.js.


// Setup Font Awesome icons.
library.add(faCheck, faEdit, faTimes, faTrash, faDownload, faThumbtack, faCircle, farCircle, faExclamationCircle, faChevronDown, faChevronUp) // add each icon here after importing
Vue.component('FontAwesomeIcon', FontAwesomeIcon)
Vue.component('FontAwesomeLayers', FontAwesomeLayers)


// Disable annoying console warning.
Vue.config.productionTip = false


// Electron application entry.
if (Util.isElectron()) {

  function send(cmd, data=null) {
    window.ipc.send('project', { cmd, data })
  }

  // Register data change listener.
  project.onModified(() => send('unsave'))

  // Register main process message listeners.
  // TODO call and response before close to check if saved for in-edit notes???
  window.ipc.on('project', ({ cmd, data }) => {
    console.log(`IPC Command: ${cmd}`)
    switch (cmd) {
      case 'new':
        misc.state = 'loading'
        project.new()
        send('name', project.data.meta.name)
        window.scroll({ top: 0 })
        break
      case 'load':
        try {
          misc.state = 'loading'
          project.load(data)
          send('name', project.data.meta.name)
          window.scroll({ top: 0 })
        } catch (error) {
          console.error(`Failed to load project. ${error.message}`) // TODO: handle elegantly?
        }
        break
      case 'save':
        send('write', project.getSaveable())
        break
      case 'saved':
        project.modified = false
        break
      case 'close':
        misc.state = 'unloading'
        document.activeElement.blur() // trigger saving of in-edit fields
        break
      default:
        throw Error(`Unsupported command "${cmd}"`) // programmer error
    }
  })
  window.ipc.on('meta', ({ cmd, data }) => {
    console.log(`IPC Command: ${cmd}`)
    switch (cmd) {
      case 'title':
        misc.appTitle = data.appTitle
        break
      default:
        throw Error(`Unsupported command "${cmd}"`) // programmer error
    }
  })

  // Query main process for app title.
  window.ipc.send('meta', { cmd: 'title?' })

  // Create new project.
  project.new()

  // Mount the Vue app.
  new Vue({
    render: h => h(AppElectron),
  }).$mount('#app')


// Web application entry.
} else {

  // Create new project.
  project.new()
  
  // Mount the Vue app.
  new Vue({
    render: h => h(AppWebsite),
  }).$mount('#app')  
}
