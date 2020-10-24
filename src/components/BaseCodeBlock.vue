<template>
  <div class="code">{{ text }}</div>
</template>

<script>
import Util from '../classes/Util.js'

export default {
  name: 'BaseCodeBlock',
  props: {
    content: [String, Object, Array],
  },
  computed: {
    text() {
      if (typeof this.content === 'object') {
        return Util.strObj(this.content)
      } else {
        return this.content
      }
    }
  }
}
</script>

<style scoped>
  .code {
    margin-bottom: 5px;
    padding: 6px;
    font-family: monospace;
    font-size: 14px;
    white-space: pre-wrap;
    background-color: #EEEAE0;
    color: #555;
    border-radius: 5px;
  }
</style>