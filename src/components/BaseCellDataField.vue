<template>
  <BaseCellData
    v-bind="{ colorBack, rowspan, colspan, isSpace, darken, isLastOfGroup }"
  >
    <BaseField
      style="width: 4em; margin: auto;"
      @input="$emit('input', $event)"
      @change="$emit('change', $event)"
      @key-enter="$emit('key-enter', $event)"
      :value="value"
      :validationMsg="validationMsg"
      :ariaLabel="ariaLabel"
      :isDisabled="isDisabled"
      :isWrapped="true"
      :doSelectAll="true"
    />
  </BaseCellData>
</template>

<script>
import BaseField from './BaseField.vue'
import BaseCellData from './BaseCellData.vue'

export default {
  name: 'BaseCellDataField',
  components: {
    BaseField,
    BaseCellData,
  },
  props: {
    value: [String, Number],
    validationMsg: String,
    ariaLabel: String,
    isDisabled: Boolean,
    colorBack: String,
    rowspan: {
      type: Number,
      default: 1,
    },
    colspan: {
      type: Number,
      default: 1,
    },
    isSpace: Boolean, // invisible spacing cell
    darken: Boolean,
    isLastOfGroup: Boolean,
  }
}
</script>

<style scoped>

</style>