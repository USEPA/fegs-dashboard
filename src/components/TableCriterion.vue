<template>
  <BaseTable>
    <template #head>
      <tr>
        <BaseTableCellEmphasis
          colorBack="var(--color-table-head-emphasis)"
          isLastOfGroup
        />
        <BaseTableCellHead isLastOfGroup doBorderTop>Criterion</BaseTableCellHead>
        <BaseTableCellHead isLastOfGroup doBorderTop>Weight</BaseTableCellHead>
      </tr>
    </template>
    <template #body>
      <tr
        v-for="(criterion, index) in criterionArray"
        :key="criterion.name"
      >
        <BaseTableCellEmphasis
          :colorBack="criterion.color.primary"
        />
        <BaseTableCellHead
          style="max-width: 20rem;"
        >
          {{ criterion.name }}
        </BaseTableCellHead>
        <BaseTableCellDataField
          :value="(criterion.name in localData) ? localData[criterion.name].val : scaleUp(criterion.result)"
          :validationMsg="(criterion.name in localData) ? localData[criterion.name].err : ''"
          @input="onDataInput(criterion.name, $event)"
          @change="onDataChange(criterion.name, $event)"
          @key-enter="onDataKeyEnter(index)"
        />
      </tr>
    </template>
  </BaseTable>
</template>

<script>
import BaseTable from './BaseTable.vue'
import BaseTableCellHead from './BaseTableCellHead.vue'
import BaseTableCellEmphasis from './BaseTableCellEmphasis.vue'
import BaseTableCellDataField from './BaseTableCellDataField.vue'

import input from './mixins/input.js'

import Util from '../classes/Util.js'
import { project } from '../store.js'

export default {
  name: 'TableCriterion',
  components: {
    BaseTable,
    BaseTableCellHead,
    BaseTableCellEmphasis,
    BaseTableCellDataField,
  },
  mixins: [input],
  data() {
    return {
      localData: {},
    }
  },
  computed: {
    criterionArray() {
      return project.getCriterionArray()
    },
  },
  methods: {
    onDataInput(criterionName, event) {
      const { val, err } = this.validateNumRange(event)
      this.$set(this.localData, criterionName, { val: event, err })
    },
    onDataChange(criterionName, event) {
      const { val, err } = this.validateNumRange(event)
      project.setCriterionResult(criterionName, this.scaleDown(val))
      this.$delete(this.localData, criterionName)
    },
    onDataKeyEnter(index) {
      // TODO better method to focus next vertical cell?
      // if (index < this.criterionArray.length - 1) {
      //   // focus the next cell in the column
      //   const cells = this.$refs.rows.children[index+1].children
      //   cells[3].children[0].focus()
      // }
    },
  },
}
</script>

<style scoped>

</style>