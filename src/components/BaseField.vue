<template>
  <input
    v-model.trim="content"
    v-on:input="onChange"
    v-on:change="onCommit"
    v-on:keyup.enter="onEnterKey"
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
    startContent: {
      type: String,
      default: '',
    },
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
    validator: {
      type: Function,
      default: val => '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      content: this.startContent,
      validationMsg: this.validator(this.startContent),
    }
  },
  computed: {

  },
  methods: {
    onChange(event) {
      this.validationMsg = this.validator(this.content)
      this.$emit('change', this.clean(this.content))
    },
    onCommit(event) {
      this.validationMsg = this.validator(this.content)
      this.$emit('commit', this.clean(this.content))
    },
    onEnterKey(event) {
      this.validationMsg = this.validator(this.content)
      this.$emit('enter', this.clean(this.content))
    },
    clean(content) {
      return (this.type === 'number') ? parseFloat(this.content) : this.content
    },
  }
}
</script>

<style scoped>
  input {
    width: 200px;
    height: 1.2em;
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