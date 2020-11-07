<template>
  <td>
    <BaseField
      style="width: 4em;"
      @input="$emit('input', $event)"
      @change="$emit('change', $event)"
      @key-enter="$emit('key-enter', $event)"
      :value="value"
      :validationMsg="validationMsg"
      :isWrapped="true"
      :doSelectAll="true"
    />
    <div style="position: absolute; color: red;">{{ validationMsg }}</div>
  </td>
</template>

<script>
import BaseField from './BaseField.vue'

export default {
  name: 'BaseTableCellData',
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