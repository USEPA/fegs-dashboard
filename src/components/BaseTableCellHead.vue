<template>
  <th
    :style="{
      backgroundColor: colorBack,
    }"
    :class="{
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

// TODO compute colors instead of hard-coding them... might still need "primary" and "light" at least

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
    background-color: var(--color-table-head1-back);
    border-bottom: 1px solid var(--color-table-border);
  }
  thead th {
    vertical-align: bottom;
    background-color: var(--color-table-head0-back);
  }
  tbody th {
    font-weight: normal;
  }
  th.last {
    border-bottom: var(--length-border-thick) solid var(--color-table-border-thick);
  }
  th.last.dark {
    border-bottom: var(--length-border-thick) solid var(--color-table-border-thick-darken);
  }

  th:last-child:not(.space) {
    border-right: 1px solid var(--color-table-border);
  }
  th.dark {
    background-blend-mode: multiply;
    background-image: linear-gradient(90deg, var(--color-table-back-darken), var(--color-table-back-darken));
    border-color: var(--color-table-border-darken);
  }

  th.space {
    padding: 0;
    background: none;
    border: none;
  }
</style>