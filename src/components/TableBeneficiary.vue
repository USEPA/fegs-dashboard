<template>
  <BaseTable>
    <template #head>
      <BaseTableRow :doEmphasis="false">
        <BaseTableCellHead
          :barHorz="true"
          :isSpace="true"
        />
        <BaseTableCellHead
          :barHorz="true"
          :isSpace="true"
        />
        <BaseTableCellHead
          v-if="showDefinitions"
          :barHorz="true"
          :isSpace="true"
        />
        <BaseTableCellHead
          :colorBack="currentStakeholder.color.primary"
          :barHorz="true"
          :isEmphasis="true"
        />
      </BaseTableRow>
      <BaseTableRow
        colorEmphasis="var(--color-table-head-emphasis)"
      >
        <BaseTableCellHead>Category</BaseTableCellHead>
        <BaseTableCellHead>Subcategory</BaseTableCellHead>
        <BaseTableCellHead v-if="showDefinitions">Definition</BaseTableCellHead>
        <BaseTableCellHead>
          <BaseSelect
            style="font-weight: bold;"
            label="Stakeholder"
            @change="onMetricChange"
            :options="stakeholderNames"
          />
        </BaseTableCellHead>
      </BaseTableRow>
    </template>
    <template #body>
      <BaseTableRow
        v-for="(beneficiary, index) in beneficiaryArray"
        :key="beneficiary.name"
        :colorEmphasis="beneficiary.category.color.primary"
        :darken="beneficiary.computed.evenCategory"
      >
        <BaseTableCellHead
          v-if="beneficiary.computed.firstOfCategory"
          style="max-width: 6rem;"
          :colorBack="beneficiary.category.color.lighter"
          :rowspan="beneficiary.category.computed.members"
        >
          {{ beneficiary.categoryName }}
        </BaseTableCellHead>
        <BaseTableCellHead
          style="max-width: 16rem;"
          :colorBack="beneficiary.category.color.lighter"
        >
          {{ beneficiary.name }}
        </BaseTableCellHead>
        <BaseTableCellHead
          v-if="showDefinitions"
          style="max-width: 20rem;"
          :colorBack="beneficiary.category.color.lightest"
        >
          {{ beneficiary.def }}
        </BaseTableCellHead>
        <BaseTableCellDataField
          @input="onDataInput(beneficiary.name, $event)"
          @change="onDataChange(beneficiary.name, $event)"
          @key-enter="onDataKeyEnter(index)"
          :value="isEditing(beneficiary.name) ? editing.val : scaleUp(beneficiary.scores[currentStakeholderName])"
          :validationMsg="isEditing(beneficiary.name) ? editing.err : ''"
        />
      </BaseTableRow>
    </template>
  </BaseTable>
</template>

<script>
import BaseButton from './BaseButton.vue'
import BaseButtonIcon from './BaseButtonIcon.vue'
import BaseField from './BaseField.vue'
import BaseModal from './BaseModal.vue'
import BaseSelect from './BaseSelect.vue'
import BaseTable from './BaseTable.vue'
import BaseTableRow from './BaseTableRow.vue'
import BaseTableCellHead from './BaseTableCellHead.vue'
import BaseTableCellData from './BaseTableCellData.vue'
import BaseTableCellDataField from './BaseTableCellDataField.vue'

import input from './mixins/input.js'

import Util from '../classes/Util.js'
import { project } from '../store.js'

export default {
  name: 'TableBeneficiary',
  components: {
    BaseButton,
    BaseButtonIcon,
    BaseField,
    BaseModal,
    BaseSelect,
    BaseTable,
    BaseTableRow,
    BaseTableCellHead,
    BaseTableCellData,
    BaseTableCellDataField,
  },
  mixins: [input],
  props: {
    showDefinitions: Boolean,
  },
  data() {
    return {
      currentStakeholderName: Object.keys(project.data.stakeholderSection.stakeholders)[0],
      editing: {
        rowName: null,
        val: null,
        err: null,
      }
    }
  },
  computed: {
    stakeholderNames() {
      return Object.keys(project.data.stakeholderSection.stakeholders)
    },
    currentStakeholder() {
      return project.data.stakeholderSection.stakeholders[this.currentStakeholderName]
    },
    beneficiaryArray() {
      return project.getBeneficiaryArray()
    },
  },
  methods: {
    onMetricChange(event) {
      this.currentStakeholderName = event
      Object.keys(this.editing).forEach(key => this.editing[key] = null)
    },
    onDataInput(beneficiaryName, event) {
      const { val, err } = this.validateNumRange(event)
      this.editing = {
        rowName: beneficiaryName,
        val: event,
        err,
      }
    },
    onDataChange(beneficiaryName, event) {
      const { val, err } = this.validateNumRange(event)
      project.setBeneficiaryScore(beneficiaryName, this.currentStakeholderName, this.scaleDown(val))
      Object.keys(this.editing).forEach(key => this.editing[key] = null)
    },
    onDataKeyEnter(index) {
      // TODO method to focus next vertical cell?
    },
    isEditing(rowName) {
      return (this.editing.rowName === rowName)
    }
  }
}
</script>

<style scoped>

</style>