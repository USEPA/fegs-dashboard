import Vue from 'vue'
import App from './App.vue'

import store from './store.js'


Object.entries(process.env).sort().forEach(([k, v]) => console.log(`${k}: ${v}`))

// Disable annoying console warning.
Vue.config.productionTip = false


// Mount the Vue app.
new Vue({
  render: h => h(App),
}).$mount('#app')


if (process.env.IS_ELECTRON) {

  // Register data change listener.
  store.onModified(() => {
    // NOTE: the "ipc" property of "window" is created in "preload.js"
    window.ipc.send('msg', { action: 'unsaved' })
  })

  // Register main process message listener.
  window.ipc.on('msg', ({ action, data }) => {
    console.log(`IPC Action: ${action}`)
    switch (action) {
      case 'new':
        store.new()
        break
      case 'load':
        console.log(data)
        try {
          store.load(data)
        } catch (error) {
          console.error(`Error: ${error.message}`) // TODO: handle elegantly?
        }
        break
      case 'save':
        window.ipc.send('msg', {
          action: 'save',
          data: store.getSaveable()
        })
        break
      case 'saved':
        store.modified = false
        break
      default:
        throw Error(`Unknown action "${action}"`) // programmer error
    }
  })

} else { // website
  // TODO handle new/load/save etc

}
