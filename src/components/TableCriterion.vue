<template>
  <BaseTable>
    <template #head>
      <tr>
        <BaseCellEmphasis
          colorBack="var(--color-table-head-emphasis)"
          isLastOfGroup
        />
        <BaseCellHead isLastOfGroup>Criterion</BaseCellHead>
        <BaseCellHead isLastOfGroup>Weight</BaseCellHead>
        <BaseCellHead
          v-if="showResults"
          isLastOfGroup
        >
          Result
        </BaseCellHead>
      </tr>
    </template>
    <template #body>
      <tr
        v-for="(criterion, index) in criterionArray"
        :key="criterion.name"
      >
        <BaseCellEmphasis
          :colorBack="criterion.color.primary"
        />
        <BaseCellHead
          style="max-width: 20rem;"
        >
          {{ criterion.name }}
        </BaseCellHead>
        <BaseCellDataField
          :value="(criterion.name in localData) ? localData[criterion.name].val : scaleUp(criterion.result)"
          :validationMsg="(criterion.name in localData) ? localData[criterion.name].err : ''"
          @input="onDataInput(criterion.name, $event)"
          @change="onDataChange(criterion.name, $event)"
          @key-enter="onDataKeyEnter(index)"
        />
        <BaseCellData
          v-if="showResults"
          colorBack="var(--color-table-head2-back)"
        >
          {{ percent(criterion.result, resultTotal) }}
        </BaseCellData>
      </tr>
    </template>
  </BaseTable>
</template>

<script>
import BaseTable from './BaseTable.vue'
import BaseCellHead from './BaseCellHead.vue'
import BaseCellEmphasis from './BaseCellEmphasis.vue'
import BaseCellData from './BaseCellData.vue'
import BaseCellDataField from './BaseCellDataField.vue'

import input from './mixins/input.js'

// TODO add "show result" toggle, add result column to other 3 tables

import Util from '../classes/Util.js'
import { project } from '../store.js'

export default {
  name: 'TableCriterion',
  components: {
    BaseTable,
    BaseCellHead,
    BaseCellEmphasis,
    BaseCellData,
    BaseCellDataField,
  },
  mixins: [input],
  props: {
    showResults: Boolean,
  },
  data() {
    return {
      localData: {},
    }
  },
  computed: {
    criterionArray() {
      return project.getCriterionArray()
    },
    resultTotal() {
      return project.data.criterionSection.computed.resultTotal
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