<template>
  <div id="app">
    <TheProject/>
  </div>
</template>

<script>
import TheProject from './components/TheProject.vue'

import Util from './classes/Util.js'
import { project, misc } from './store.js'

export default {
  name: 'AppElectron',
  components: {
    TheProject
  },
  computed: {
    title() {
      if (project.data.meta) {
        const name = project.data.meta.name
        const save = (project.modified) ? '*' : ''
        return `${name}${save} - ${misc.appTitle}`
      } else {
        return misc.appTitle
      }
    },
  },
  watch: {
    title: 'setDocumentTitle'
  },
  // created() {
  //   this.setDocumentTitle() // not needed... title first computed after response from main process
  // },
  methods: {
    setDocumentTitle() {
      document.title = this.title
    },
  },
}
</script>

<style>
@import './styles/style.css';
#app {
  background-color: var(--color-main);
}
*, *::after, *::before {
	-webkit-user-select: none;
	-webkit-user-drag: none;
	-webkit-app-region: no-drag;
	cursor: default;
}
</style>
