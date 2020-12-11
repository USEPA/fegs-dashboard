<template>
  <div
    contenteditable
    class="textbox"
    v-text="switchValue"
    ref="textbox"
    :spellcheck="doSpellCheck ? 'true' : 'false'"
    @input="onInput"
    @focus="onFocus"
    @blur="onBlur"
  >
  </div>
</template>

<script>
import Util from '../classes/Util.js'

export default {
  name: 'BaseField',
  props: {
    value: {
      type: [String, Number],
      default: '',
    },
    isWrapped: { // whether this component's value is managed externally
      type: Boolean,
      default: true,
    },
    doSelectAll: { // whether to select all content when clicked
      type: Boolean,
      default: false,
    },
    doSpellCheck: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      localValue: this.value,
    }
  },
  computed: {
    switchValue() {
      return (this.isWrapped) ? this.value : this.localValue
    },
  },
  methods: {
    onInput(event) {
      if (!this.isWrapped) this.localValue = this.$refs.textbox.innerText
      this.$emit('input', this.$refs.textbox.innerText)
    },
    onBlur(event) {
      if (!this.isWrapped) this.localValue = this.$refs.textbox.innerText
      this.$emit('change', this.$refs.textbox.innerText)
    },
    onFocus(event) {
      if (this.doSelectAll) this.$refs.textbox.select()
    },
  },
}
</script>

<style scoped>
  div.textbox {
    width: 100%;
    min-height: 4em;
    padding: .2em .3em;
    text-align: inherit;
    white-space: pre;
    box-sizing: border-box;
    border: 1px solid var(--color-input);
    border-radius: 4px;
    outline: none;
  }
  div.textbox:hover {
    border-color: var(--color-input-hover);
  }
  div.textbox:focus,
  div.textbox:active {
    border-width: var(--length-input-active);
    border-color: var(--color-input-active);
  }
</style>