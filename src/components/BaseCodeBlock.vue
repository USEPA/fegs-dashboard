<template>
  <div class="code">{{ text }}</div>
</template>

<script>
export default {
  name: 'BaseCodeBlock',
  props: {
    text: String,
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
    background-color: #EEE;
    color: #555;
    border-radius: 5px;
  }
</style>