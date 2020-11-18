<template>
  <BaseTable>
    <template #head>
      <tr>
        <BaseTableCellHead isSpace/>
        <BaseTableCellHead isSpace/>
        <BaseTableCellHead isSpace/>
        <BaseTableCellHead
          v-if="showDefinitions"
          isSpace
        />
        <BaseTableCellEmphasis
          noBorder
          isHorz
          :colorBack="currentStakeholder.color.primary"
        />
      </tr>
      <tr>
        <BaseTableCellEmphasis
          colorBack="var(--color-table-head-emphasis)"
          isLastOfGroup
        />
        <BaseTableCellHead isLastOfGroup doBorderTop>
          Category
        </BaseTableCellHead>
        <BaseTableCellHead isLastOfGroup doBorderTop>
          Subcategory
        </BaseTableCellHead>
        <BaseTableCellHead
          v-if="showDefinitions"
          isLastOfGroup
          doBorderTop
        >
          Definition
        </BaseTableCellHead>
        <BaseTableCellHead isLastOfGroup>
          <BaseSelect
            style="font-weight: bold;"
            label="Stakeholder"
            :options="stakeholderNames"
            @change="onMetricChange"
          />
        </BaseTableCellHead>
      </tr>
    </template>
    <template #body>
      <tr
        v-for="(beneficiary, index) in beneficiaryArray"
        :key="beneficiary.name"
      >
        <BaseTableCellEmphasis
          :colorBack="beneficiary.category.color.primary"
          :noBorder="!beneficiary.computed.isLastOfCategory"
          :isLastOfGroup="beneficiary.computed.isLastOfCategory"
        />
        <BaseTableCellHead
          v-if="beneficiary.computed.isFirstOfCategory"
          style="max-width: 6rem;"
          :isLastOfGroup="beneficiary.categoryName !== lastCategory"
          :colorBack="beneficiary.category.color.lighter"
          :rowspan="beneficiary.category.computed.members"
        >
          {{ beneficiary.categoryName }}
        </BaseTableCellHead>
        <BaseTableCellHead
          style="max-width: 16rem;"
          :isLastOfGroup="beneficiary.computed.isLastOfCategory"
          :colorBack="beneficiary.category.color.lighter"
        >
          {{ beneficiary.name }}
        </BaseTableCellHead>
        <BaseTableCellHead
          v-if="showDefinitions"
          style="max-width: 20rem;"
          :isLastOfGroup="beneficiary.computed.isLastOfCategory"
          :colorBack="beneficiary.category.color.lightest"
        >
          {{ beneficiary.def }}
        </BaseTableCellHead>
        <BaseTableCellDataField
          :isLastOfGroup="beneficiary.computed.isLastOfCategory"
          :value="isEditing(beneficiary.name) ? editing.val : scaleUp(beneficiary.scores[currentStakeholderName])"
          :validationMsg="isEditing(beneficiary.name) ? editing.err : ''"
          @input="onDataInput(beneficiary.name, $event)"
          @change="onDataChange(beneficiary.name, $event)"
          @key-enter="onDataKeyEnter(index)"
        />
      </tr>
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
import BaseTableCellHead from './BaseTableCellHead.vue'
import BaseTableCellEmphasis from './BaseTableCellEmphasis.vue'
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
    BaseTableCellHead,
    BaseTableCellEmphasis,
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
      if (!(this.currentStakeholderName in project.data.stakeholderSection.stakeholders)) {
        this.currentStakeholderName = Object.keys(project.data.stakeholderSection.stakeholders)[0]
      }
      return project.data.stakeholderSection.stakeholders[this.currentStakeholderName]
    },
    beneficiaryArray() {
      return project.getBeneficiaryArray()
    },
    lastCategory() {
      return this.beneficiaryArray[this.beneficiaryArray.length - 1].categoryName
    }
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