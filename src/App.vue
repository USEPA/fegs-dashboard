<template>
  <div id="app">
    <h1>FEGS Scoping Tool</h1>
    <button v-on:click="add">Add Stakeholder</button>
    <button v-on:click="del">Delete Stakeholder</button>
    <h2>Info</h2>
    <BaseCodeBlock v-bind:text="info"/>
    <h2>Data</h2>
    <BaseCodeBlock v-bind:text="projectData"/>
  </div>
</template>

<script>
import BaseCodeBlock from './components/BaseCodeBlock.vue'

import Util from './classes/Util.js'
import store from './store.js'

export default {
  name: 'App',
  components: {
    BaseCodeBlock
  },
  computed: {
    title() {
      if (store.data.project) {
        const name = store.data.project.name
        const save = (store.modified) ? '*' : ''
        return `${name}${save} - ${store.info.appTitle}`
      } else {
        return store.info.appTitle
      }
    },
    info() {
      return Util.strObj(store.info)
    },
    projectData() {
      return Util.strObj(store.data)
    },
  },
  watch: {
    title: 'setDocumentTitle'
  },
  // created() {
  //   this.setDocumentTitle() // not needed... set title after response from main process
  // },
  methods: {
    setDocumentTitle() {
      document.title = this.title
    },
    add() {
      store.addStakeholder('TEST', '#4cb159')
    },
    del() {
      store.delStakeholder('TEST')
    },
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
}
</style>
