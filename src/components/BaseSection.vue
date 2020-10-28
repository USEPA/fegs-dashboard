<template>
  <section :class="{disabled:!isReady}">
    <h2>{{ title }}</h2>
    <slot v-if="isReady"></slot>
    <div v-else>
      <div class="msg">Enter data in the {{ prevSection.toLowerCase() }} section first.</div>
    </div>
  </section>
</template>

<script>
import Util from '../classes/Util.js'

export default {
  name: 'BaseSection',
  props: {
    title: {
      type: String,
      required: true,
    },
    prevSection: {
      type: String,
      default: 'previous',
    },
    isReady: {
      type: Boolean,
      default: true,
    }
  },
}
</script>

<style scoped>
  section {
    padding: .5rem .5rem 2rem .5rem;
    background-color: #FFF;
  }
  section:not(:last-child) {
    margin-bottom: 1px;
  }
  section.disabled {
    /* background-color: #EEE; */
  }
  h2 {
    margin: 0 0 .5rem 0;
  }
  section.disabled h2,
  section.disabled div {
    color: #888;
  }
  .msg {
    font-style: italic;
  }
</style>
