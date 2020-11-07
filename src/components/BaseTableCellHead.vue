<template>
  <th
    v-if="!isDummy"
    :rowspan="rowspan"
    :style="colorBack ? { backgroundColor: `${colorBack}` } : {}"
  >
    <slot></slot>
  </th>
  <th v-else style="display: none"></th>
</template>

<script>

export default {
  name: 'BaseTableCellHead',
  props: {
    colorBack: String,
    rowspan: {
      type: Number,
      default: 1,
    },
    isDummy: Boolean,
  }
}
</script>

<style scoped>
  th {
    text-align: left;
    font-weight: bold;
  }
  tbody th {
    font-weight: normal;
  }
</style>