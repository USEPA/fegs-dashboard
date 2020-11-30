<template>
  <BaseTable>
    <template #head>
      <tr>
        <BaseCellHead isSpace/>
        <BaseCellHead isSpace/>
        <BaseCellHead isSpace/>
        <BaseCellHead
          v-if="showDefinitions"
          isSpace
        />
        <BaseCellEmphasis
          noBorder
          isHorz
          :colorBack="currentStakeholder.color.primary"
        />
        <BaseCellHead
          v-if="showResults"
          isSpace
          :colspan="2"
        />
      </tr>
      <tr>
        <BaseCellEmphasis
          colorBack="var(--color-table-head-emphasis)"
          isLastOfGroup
          :rowspan="2"
        />
        <BaseCellHead 
          isLastOfGroup
          :rowspan="2"
        >
          Category
        </BaseCellHead>
        <BaseCellHead 
          isLastOfGroup
          :rowspan="2"
        >
          Subcategory
        </BaseCellHead>
        <BaseCellHead
          v-if="showDefinitions"
          isLastOfGroup
          :rowspan="2"
        >
          Definition
        </BaseCellHead>
        <BaseCellHead>
          <BaseSelect
            style="font-weight: bold;"
            label="Stakeholder"
            :options="stakeholderNames"
            @change="onMetricChange"
          />
        </BaseCellHead>
        <BaseCellHead
          v-if="showResults"
          style="text-align: center;"
          isLastOfGroup
          :rowspan="2"
          :colspan="2"
        >
          Result
        </BaseCellHead>
      </tr>
      <tr>
        <BaseCellHead
          style="max-width: 8rem; font-weight: normal; text-align: center;"
          isLastOfGroup
          :style="{ borderRight: showResults ? 'none' : null }"
        >
          {{ scaleUp(stakeholderPercentages[currentStakeholderName]) }}%
        </BaseCellHead>
      </tr>
    </template>
    <template #body>
      <tr
        v-for="(beneficiary, index) in beneficiaryArray"
        :key="beneficiary.name"
      >
        <BaseCellEmphasis
          :colorBack="beneficiary.category.color.primary"
          :noBorder="!beneficiary.computed.isLastOfCategory"
          :isLastOfGroup="beneficiary.computed.isLastOfCategory"
        />
        <BaseCellHead
          v-if="beneficiary.computed.isFirstOfCategory"
          style="max-width: 6rem;"
          isLastOfGroup
          :colorBack="beneficiary.category.color.light"
          :rowspan="beneficiary.category.computed.members"
        >
          {{ beneficiary.categoryName }}
        </BaseCellHead>
        <BaseCellHead
          style="max-width: 16rem;"
          :isLastOfGroup="beneficiary.computed.isLastOfCategory"
          :colorBack="beneficiary.category.color.light"
        >
          {{ beneficiary.name }}
        </BaseCellHead>
        <BaseCellHead
          v-if="showDefinitions"
          style="max-width: 30rem;"
          :isLastOfGroup="beneficiary.computed.isLastOfCategory"
          :colorBack="beneficiary.category.color.lighter"
        >
          {{ beneficiary.def }}
        </BaseCellHead>
        <BaseCellDataField
          :isLastOfGroup="beneficiary.computed.isLastOfCategory"
          :value="isEditing(beneficiary.name) ? editing.val : scaleUp(beneficiary.scores[currentStakeholderName])"
          :validationMsg="isEditing(beneficiary.name) ? editing.err : ''"
          @input="onDataInput(beneficiary.name, $event)"
          @change="onDataChange(beneficiary.name, $event)"
          @key-enter="onDataKeyEnter(index)"
        />
        <BaseCellData
          v-if="showResults"
          style="border-right: none;"
          :isLastOfGroup="beneficiary.computed.isLastOfCategory"
          :colorBack="beneficiary.category.color.lighter"
        >
          {{ scaleUp(beneficiary.computed.result/resultTotal) }}%
        </BaseCellData>
        <BaseCellData
          v-if="showResults && beneficiary.computed.isFirstOfCategory"
          isLastOfGroup
          :colorBack="beneficiary.category.color.lighter"
          :rowspan="beneficiary.category.computed.members"
        >
          {{ scaleUp(beneficiaryCategoryPercentages[beneficiary.categoryName]) }}%
        </BaseCellData>
      </tr>
    </template>
    <template #foot>
      <tr>
        <BaseCellEmphasis
          colorBack="var(--color-table-head-emphasis)"
          isLastOfGroup
        />
        <BaseCellHead
          isLastOfGroup
          style="text-align: right;"
          :colspan="showDefinitions ? 3 : 2"
        >
          Total
        </BaseCellHead>
        <BaseCellData
          style="font-weight: bold;"
          isLastOfGroup
        >
          {{ scaleUp(scoreTotals[currentStakeholderName]) }}
        </BaseCellData>
        <BaseCellData
          v-if="showResults"
          isLastOfGroup
          :colspan="2"
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
import BaseCellHead from './BaseCellHead.vue'
import BaseCellEmphasis from './BaseCellEmphasis.vue'
import BaseCellData from './BaseCellData.vue'
import BaseCellDataField from './BaseCellDataField.vue'

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
    BaseCellHead,
    BaseCellEmphasis,
    BaseCellData,
    BaseCellDataField,
  },
  mixins: [input],
  props: {
    showDefinitions: Boolean,
    showResults: Boolean,
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
    stakeholderArray() {
      return project.getStakeholderArray()
    },
    beneficiaryArray() {
      return project.getBeneficiaryArray()
    },
    lastCategory() {
      return this.beneficiaryArray[this.beneficiaryArray.length - 1].categoryName
    },
    scoreTotals() {
      return project.data.beneficiarySection.computed.scoreTotals
    },
    resultTotal() {
      return project.data.beneficiarySection.computed.resultTotal
    },
    stakeholderPercentages() {
      const ret = {}
      const sum = project.data.stakeholderSection.computed.resultTotal
      this.stakeholderArray.forEach(stakeholder => {
        ret[stakeholder.name] = stakeholder.computed.result/sum
      })
      return ret
    },
    beneficiaryCategoryPercentages() {
      const ret = {}
      const sum = project.data.beneficiarySection.computed.resultTotal
      this.beneficiaryArray.forEach(beneficiary => {
        if (!(beneficiary.categoryName in ret)) {
          ret[beneficiary.categoryName] = 0
        }
        ret[beneficiary.categoryName] += beneficiary.computed.result/sum
      })
      return ret
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