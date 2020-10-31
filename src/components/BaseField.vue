<template>
  <input
    @input="onInput"
    @change="onCommit"
    @keyup.enter="onKeyEnter"
    @focus="onFocus"
    :value="switchValue"
    :type="type"
    :class="{invalid:!!validationMsg}"
    :disabled="isDisabled"
    :placeholder="placeholder"
  >
</template>

<script>
import Util from '../classes/Util.js'

// TODO dismissable popup with reason for invalidity
export default {
  name: 'BaseField',
  props: {
    type: {
      type: String,
      default: 'text',
      validator(val) {
        return [
          'text',
          'number',
        ].includes(val)
      }
    },
    value: {
      type: [String, Number],
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    validationMsg: {
      type: String,
      default: '', // empty string means valid
    },
    isWrapped: { // whether this component should update it's own value
      type: Boolean,
      default: false,
    },
    doSelectAll: { // whether to select all content when clicked
      type: Boolean,
      default: false,
    }
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
      if (!this.isWrapped) this.localValue = event.target.value
      this.$emit('input', event.target.value)
    },
    onCommit(event) {
      if (!this.isWrapped) this.localValue = event.target.value
      this.$emit('commit', event.target.value)
    },
    onKeyEnter(event) {
      if (!this.isWrapped) this.localValue = event.target.value
      this.$emit('keyEnter', event.target.value)
    },
    onFocus(event) {
      if (this.doSelectAll) event.target.select()
    },
  },
}
</script>

<style scoped>
  input {
    width: 12em;
    height: 1.3em;
    border: 1px solid var(--color-input);
    border-radius: 4px;
    outline: none;
  }
  input::placeholder {
    color: var(--color-input);
  }
  input:hover {
    border-color: var(--color-input-hover);
  }
  input:focus,
  input:active {
    border-color: var(--color-input-active);
  }

  input.invalid,
  input.invalid:hover {
    border-color: var(--color-invalid-input);
  }
  input.invalid:focus,
  input.invalid:active {
    box-shadow: 0 0 0 1px var(--color-invalid-input);
  }

  input:disabled,
  input:disabled:hover,
  input:disabled:focus,
  input:disabled:active {
    pointer-events: none;
    color: var(--color-text-disabled);
    background-color: var(--color-input-disabled-back);
    border-color: var(--color-input-disabled);
    box-shadow: none;
  }
</style>