<template>
  <td
    :style="{ backgroundColor: colorBack }"
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
  </td>
</template>

<script>
export default {
  name: 'BaseTableCellData',
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
  td {
    margin: 1px;
    padding: .5rem;
    position: relative;
    text-align: center;
    background-blend-mode: multiply;
    background-color: var(--color-table-body-back);
    border-bottom: 1px solid var(--color-table-border);
  }
  tr:not(:last-child) td.last {
    border-bottom: 2px solid var(--color-table-border);
  }
  td:last-child:not(.space) {
    border-right: 1px solid var(--color-table-border);
  }

  /* darken */
  td.dark {
    background-image: linear-gradient(90deg, var(--color-table-body-back-darken), var(--color-table-body-back-darken));
    border-color: var(--color-table-border-darken);
  }

  td.space {
    padding: 0;
    background: none;
    border-top: none;
    border-right: none;
  }
</style>