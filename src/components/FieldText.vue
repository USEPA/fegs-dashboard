<template>
  <BaseField
    type="text"
    @input="onInput($event)"
    @commit="onCommit($event)"
    @keyEnter="onKeyEnter($event)"
    :value="localValue"
    :placeholder="placeholder"
    :isDisabled="isDisabled"
    :validationMsg="validationMsg"
    :isWrapped="true"
    :doSelectAll="true"
  />
</template>

<script>
import BaseField from './BaseField.vue'

import Util from '../classes/Util.js'

// TODO dismissable popup with reason for invalidity
export default {
  name: 'FieldText',
  components: {
    BaseField,
  },
  props: {
    value: {
      type: String,
      default: '',
    },
    triggerOverwrite: { // increment to set value -> localValue (watcher is not enough if value is the same as before)
      type: Number,
      default: 0,
    },
    placeholder: {
      type: String,
      default: '',
    },
    validator: {
      type: Function, // return a validation error description, or empty string for no error
      default: val => '',
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      validationMsg: '',
      localValue: this.value,
      lastValue: this.value, // revert to lastValue if localValue is invalid
    }
  },
  watch: {
    triggerOverwrite(newVal) {
      this.localValue = this.value
      this.lastValue = this.value
    },
  },
  methods: {
    onInput(event) {
      const err = this.validator(event)
      this.localValue = event
      this.validationMsg = err
      this.$emit('input', this.lastValue)
    },
    onCommit(event) {
      const err = this.validator(event)
      if (!err) this.lastValue = event
      this.localValue = this.lastValue 
      this.validationMsg = '' // no error when done editing
      this.$emit('commit', this.lastValue)
    },
    onKeyEnter(event) {
      const err = this.validator(event)
      if (!err) this.lastValue = event
      this.localValue = this.lastValue 
      this.validationMsg = '' // no error when done editing
      this.$emit('keyEnter', this.lastValue)
    },
  },
}
</script>

<style scoped>
  input {
  
  }
</style>