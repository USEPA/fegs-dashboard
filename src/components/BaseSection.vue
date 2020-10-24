<template>
  <section :class="{disabled:!isShown}">
    <h2>{{ title }}</h2>
    <slot v-if="isShown"></slot>
    <div v-else>
      <div class="msg">Enter data in the {{ prevSection }} section first.</div>
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
    isShown: {
      type: Boolean,
      default: true,
    }
  },
}
</script>

<style scoped>
  section {
    padding: .8rem;
    background-color: #FFF;
    border-radius: 8px;
  }
  section:not(:last-child) {
    margin-bottom: 8px;
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
