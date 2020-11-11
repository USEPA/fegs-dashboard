<template>
  <td>
    <slot></slot>
  </td>
</template>

<script>
export default {
  name: 'BaseTableCellData',
}
</script>

<style scoped>
  td {
    text-align: center;
  }
</style>