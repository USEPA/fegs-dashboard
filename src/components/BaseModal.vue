<template>
  <div
    class="overlay"
    @click="close"
    @keyup.esc="close"
  >
    <div
      ref="modal"
      class="modal"
      role="alertdialog"
      @click.stop=""
    >
      <BaseButtonIcon
        ref="closeBtn"
        class="close"
        aria-label="close"
        icon="times"
        color="neutral"
        @click="close"
      />
      <h3>{{ title }}</h3>
      <div
        ref="content"
        class="content"
      >
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import BaseButtonIcon from './BaseButtonIcon.vue'

import Util from '../classes/Util.js'

// TODO bunch of accessibility stuff: focus, escape, previous focus, etc...

export default {
  name: 'BaseModal',
  components: {
    BaseButtonIcon,
  },
  props: {
    title: {
      type: String,
      default: '',
    }
  },
  data() {
    return {
      lastFocus: null
    }
  },
  computed: {

  },
  created() {
    this.lastFocus = document.activeElement
    document.addEventListener('focus', this.trapFocus, true)
    document.body.style.overflow = 'hidden'
    document.body.style.marginRight = '17px' // TODO determine scrollbar width programatically
  },
  mounted() {
    const start = Date.now()
    this.intialFocus()
    console.log(Date.now() - start)
  },
  destroyed() {
    document.body.style.overflow = 'auto'
    document.body.style.marginRight = '0'
    document.removeEventListener('focus', this.trapFocus, true)
    this.lastFocus.focus()
  },
  methods: {
    close(event) {
      this.$emit('close')
    },
    trapFocus(event) {
      if (!this.$refs.modal.contains(event.target)) {
        event.stopPropagation();
        this.$refs.closeBtn.$el.focus()
      }
    },
    intialFocus() {
      const success = this.focusFirst(this.$refs.content)
      if (!success) this.$refs.closeBtn.$el.focus()
    },
    focusFirst(node) {
      node.focus() // attempt to focus element
      if (document.activeElement === node) return true // success, element focused
      for (let i = 0; i < node.children.length; i++) {
        if (this.focusFirst(node.children[i])) return true // success, descendant focused
      }
      return false // failure, no element focused
    },
  }
}
</script>

<style scoped>
  .overlay {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #000B;
  }
  .modal {
    min-width: 10vw;
    max-width: 90vw;
    max-height: 90vh;
    padding: calc(2* var(--length-primary));
    position: relative;
    background-color: #FFF;
    border-radius: var(--length-primary);
    box-shadow: 0 .4rem 4rem 0 #0008;
  }
  .close {
    position: absolute;
    top: .5rem;
    right: .5rem;
    font-size: 1.2rem;
  }
  h3 {
    margin-top: 0;
  }
  .content {
    max-height: 80vh; /* must be explicit for scroll to work */
    overflow-y: auto;
  }
</style>