<template>
  <td>
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
  </td>
</template>

<script>
import BaseField from './BaseField.vue'

export default {
  name: 'BaseTableCellDataField',
  components: {
    BaseField,
  },
  props: {
    value: [String, Number],
    validationMsg: String,
  }
}
</script>

<style scoped>
  td {
    text-align: center;
  }
</style>