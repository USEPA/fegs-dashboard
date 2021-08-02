<template>
  <th
    v-if="hasContent"
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
    <div class="error-wrap">
      <div class="error">{{ validationMsg }}</div>
    </div>
    <slot></slot>
  </th>
  <td
    v-else
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
  </td>
</template>

<script>

// TODO compute colors instead of hard-coding them... might still need "primary" and "light" at least

// NOTE th cells without text are discouraged for accessibility reasons, replaced with td instead

export default {
  name: 'BaseCellHead',
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
    validationMsg: String,
  },
  computed: {
    hasContent() {
      return !!this.$slots.default && !!this.$slots.default[0].text // WARN not sure if this is reactive
    },
  },
}
</script>

<style scoped>
  th, td {
    margin: 1px;
    padding: .5rem;
    position: relative;
    text-align: left;
    font-weight: bold;
    background-color: var(--color-table-head1-back);
    border-bottom: 1px solid var(--color-table-border);
  }
  thead th,
  tfoot th,
  thead td,
  tfoot td {
    vertical-align: bottom;
    background-color: var(--color-table-head0-back);
  }
  tbody th,
  tbody td {
    font-weight: normal;
  }
  th.last,
  td.last {
    border-bottom: var(--length-border-thick) solid var(--color-table-border-thick);
  }
  th.last.dark,
  td.last.dark {
    border-bottom: var(--length-border-thick) solid var(--color-table-border-thick-darken);
  }

  th:last-child:not(.space),
  td:last-child:not(.space) {
    border-right: 1px solid var(--color-table-border);
  }
  th.dark,
  td.dark {
    background-blend-mode: multiply;
    background-image: linear-gradient(90deg, var(--color-table-back-darken), var(--color-table-back-darken));
    border-color: var(--color-table-border-darken);
  }

  th.space,
  td.space {
    padding: 0;
    background: none;
    border: none;
  }

  .error-wrap {
    width: 0;
    height: 0;
    position: relative;
    top: .9rem;
  }

  .error {
    width: 12em;
    position: absolute;
    z-index: 99;
    text-align: left;
    color: var(--color-invalid-input);
  }
</style>