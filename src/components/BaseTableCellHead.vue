<template>
  <th
    :style="{
      backgroundColor: colorBack,
    }"
    :class="{
      bordtop: doBorderTop,
      space: isSpace,
      last: isLastOfGroup,
      dark: darken,
    }"
    :rowspan="rowspan"
    :colspan="colspan"
    :aria-hidden="isSpace"
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
    isSpace: Boolean, // invisible spacing cell
    darken: Boolean,
    isLastOfGroup: Boolean,
    doBorderTop: Boolean,
  },
}
</script>

<style scoped>
  th {
    margin: 1px;
    padding: .5rem;
    position: relative;
    text-align: left;
    font-weight: bold;
    background-blend-mode: multiply;
    background-color: var(--color-table-head1-back);
    border-bottom: 1px solid var(--color-table-border);
  }
  th.bordtop {
    border-top: 1px solid var(--color-table-border);
  }
  thead th {
    vertical-align: bottom;
    background-color: var(--color-table-head0-back);
  }
  tbody th {
    font-weight: normal;
  }
  thead th.last,
  tbody tr:not(:last-child) th.last {
    border-bottom: 2px solid var(--color-table-border-thick);
  }
  th:last-child:not(.space) {
    border-right: 1px solid var(--color-table-border);
  }

  /* darken */
  th.dark {
    background-image: linear-gradient(90deg, var(--color-table-body-back-darken), var(--color-table-body-back-darken));
    border-color: var(--color-table-border-darken);
  }

  th.space {
    padding: 0;
    background: none;
    border: none;
  }
</style>