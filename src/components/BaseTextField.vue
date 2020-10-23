<template>
  <input type="text" v-on:change="onChange" :value="content">
</template>

<script>
import Util from '../classes/Util.js'

export default {
  name: 'BaseInputText',
  props: {
    
  },
  computed: {

  }
}
</script>

<style scoped>
  
</style>