<template>
  <BaseTableCellData
    v-bind="{ colorBack, rowspan, colspan, isSpace, darken, isLastOfGroup }"
  >
    <BaseField
      style="width: 4em; margin: auto;"
      @input="$emit('input', $event)"
      @change="$emit('change', $event)"
      @key-enter="$emit('key-enter', $event)"
      :value="value"
      :validationMsg="validationMsg"
      :isWrapped="true"
      :doSelectAll="true"
    />
  </BaseTableCellData>
</template>

<script>
import BaseField from './BaseField.vue'
import BaseTableCellData from './BaseTableCellData.vue'

export default {
  name: 'BaseTableCellDataField',
  components: {
    BaseField,
    BaseTableCellData,
  },
  props: {
    value: [String, Number],
    validationMsg: String,
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