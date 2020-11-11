<template>
  <th
    :style="colorBack ? { backgroundColor: `${colorBack}` } : {}"
    :class="{ space: isSpace, emphasis: isEmphasis, vert: barVert, horz: barHorz }"
    :rowspan="rowspan"
    :colspan="colspan"
    :aria-hidden="isEmphasis || isSpace"
    
  >
    <slot></slot>
  </th>
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
    colspan: {
      type: Number,
      default: 1,
    },
    barVert: Boolean,
    barHorz: Boolean,
    isSpace: Boolean,
    isEmphasis: Boolean,
  },
}
</script>

<style scoped>
  thead tr:first-child th:not(.space):not(.emphasis) {
    border-top: 1px solid var(--color-table-border)
  }
  thead th {
    vertical-align: bottom;
  }
  tbody th {
    font-weight: normal;
  }
  th {
    margin: 1px;
    padding: .5rem;
    position: relative;
    text-align: left;
    font-weight: bold;
    border-bottom: 1px solid var(--color-table-border);
  }
  th:last-child:not(.emphasis) {
    border-right: 1px solid var(--color-table-border);
  }
  th.space {
    background: none;
    border-top: none;
    border-right: none;
  }
  th.emphasis {
    padding: 0;
    border: none;
  }
  th.vert {
    padding: 0 0 0 var(--length-primary);
  }
  th.horz {
    padding: 0 0 var(--length-primary) 0;
  }
</style>