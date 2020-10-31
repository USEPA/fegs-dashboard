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
  name: 'FieldNumber',
  components: {
    BaseField,
  },
  props: {
    value: {
      type: [String, Number],
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
    multiplier: {
      type: Number,
      default: 100,
    },
    minVal: {
      type: Number,
      default: 0,
    },
    maxVal: {
      type: Number,
      default: 100,
    },
    minErrorMsg: {
      type: String,
      default: '',
    },
    maxErrorMsg: {
      type: String,
      default: '',
    },
    numErrorMsg: {
      type: String,
      default: 'Must be a number',
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      decimals: 2,
      validationMsg: '',
      localValue: this.adjustIn(this.value),
    }
  },
  watch: {
    triggerOverwrite(newVal) {
      this.localValue = this.adjustIn(this.value)
    },
  },
  created() {
    this.onCommit(this.value) // clean initial value
  },
  methods: {
    onInput(event) {
      const { val, err } = this.clean(event)
      this.localValue = event
      this.validationMsg = err
      this.$emit('input', this.adjustOut(val))
    },
    onCommit(event) {
      const { val, err } = this.clean(event)
      this.localValue = val
      this.validationMsg = '' // no error when done editing
      this.$emit('commit', this.adjustOut(val))
    },
    onKeyEnter(event) {
      const { val, err } = this.clean(event)
      this.localValue = val
      this.validationMsg = '' // no error when done editing
      this.$emit('keyEnter', this.adjustOut(val))
    },
    adjustIn(val) {
      return Util.isNum(val) ? Util.round(val*this.multiplier, this.decimals) : null
    },
    adjustOut(val) {
      return Util.isNum(val) ? val/this.multiplier : null
    },
    clean(val) {
      if (val === '') return { val: null, err: '' }
      const num = parseFloat(val)
      if (Number.isNaN(num)) return { val: null, err: this.numErrorMsg }
      if (num > this.maxVal) return { val: this.maxVal, err: this.maxErrorMsg||`Must be at most ${this.maxVal}` }
      if (num < this.minVal) return { val: this.minVal, err: this.minErrorMsg||`Must be at least ${this.minVal}` }
      return { val: Util.round(num, this.decimals), err: '' }
    },
  },
}
</script>

<style scoped>
  input {
    width: 4em;
  }
</style>