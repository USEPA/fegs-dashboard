<template>
  <BaseTable>
    <template #head>
      <tr>
        <BaseCellHead isSpace/>
        <BaseCellHead isSpace/>
        <BaseCellHead isSpace/>
        <BaseCellHead isSpace/>
        <BaseCellHead
          v-if="showDefinitions"
          isSpace
        />
        <BaseCellEmphasis
          v-for="stakeholder in filteredStakeholderArray"
          noBorder
          isHorz
          :key="stakeholder.name"
          :colorBack="stakeholder.color.primary"
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
        <template v-if="showAllColumns">
          <BaseCellHead
            v-for="stakeholder in stakeholderArray"
            style="min-width: 4rem; font-weight: normal; text-align: center;"
            :key="stakeholder.name"
          >
            {{ stakeholder.name }}
          </BaseCellHead>
        </template>
        <BaseCellHead v-else>
          <BaseSelect
            style="font-weight: bold;"
            label="Stakeholder"
            :options="filteredStakeholderNames"
            :value="currentStakeholderName"
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
          v-for="stakeholder in filteredStakeholderArray"
          style="min-width: 4rem; font-weight: normal; text-align: center;"
          isLastOfGroup
          :key="stakeholder.name"
          :style="{ borderRight: showResults ? 'none' : null }"
        >
          {{ number(stakeholder.computed.result) }}
        <br v-if="showAllColumns">
          ({{ percent(stakeholder.computed.result, stakeholderResultTotal) }})
        </BaseCellHead>
      </tr>
    </template>
    <template #body>
      <tr
        v-for="(beneficiary, index) in beneficiaryArray"
        :key="beneficiary.name"
      >
        <template v-if="beneficiary.category.expanded">
          <BaseCellEmphasis
            v-if="beneficiary.computed.isFirstOfCategory"
            isLastOfGroup
            :colorBack="beneficiary.category.color.primary"
            :rowspan="beneficiary.category.computed.members"
          />
          <BaseCellHead
            v-if="beneficiary.computed.isFirstOfCategory"
            style="padding-right: 0;"
            isLastOfGroup
            :colorBack="beneficiary.category.color.light"
            :rowspan="beneficiary.category.computed.members"
          >
            <BaseButtonIcon
              icon="chevron-up"
              color="neutral"
              hint="Collapse category"
              doBlurOnClick
              shiftY="-0.08em"
              @click="onExpandChange(beneficiary.categoryName, false)"
            />
          </BaseCellHead>
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
            style="max-width: 16rem; min-width: 10rem;"
            :isLastOfGroup="beneficiary.computed.isLastOfCategory"
            :colorBack="beneficiary.category.color.light"
          >
            {{ beneficiary.name }}
          </BaseCellHead>
          <BaseCellHead
            v-if="showDefinitions"
            style="max-width: 30rem; min-width: 16rem;"
            :isLastOfGroup="beneficiary.computed.isLastOfCategory"
            :colorBack="beneficiary.category.color.lighter"
          >
            {{ beneficiary.def }}
          </BaseCellHead>
          <BaseCellDataField
            v-for="stakeholder in filteredStakeholderArray"
            :key="stakeholder.name"
            :isLastOfGroup="beneficiary.computed.isLastOfCategory"
            :value="isEditing(beneficiary.name) ? editing.val : scaleUp(beneficiary.scores[stakeholder.name])"
            :validationMsg="isEditing(beneficiary.name) ? editing.err : ''"
            :isDisabled="!(stakeholder.computed.result > 0)"
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
            {{ percent(beneficiary.computed.result, beneficiaryResultTotal) }}
          </BaseCellData>
          <BaseCellData
            v-if="showResults && beneficiary.computed.isFirstOfCategory"
            isLastOfGroup
            :colorBack="beneficiary.category.color.lighter"
            :rowspan="beneficiary.category.computed.members"
          >
            {{ percent(beneficiary.category.computed.result, beneficiaryResultTotal) }}
          </BaseCellData>
        </template>
        <template v-else-if="beneficiary.computed.isFirstOfCategory">
          <BaseCellEmphasis
            isLastOfGroup
            :colorBack="beneficiary.category.color.primary"
          />
          <BaseCellHead
            style="padding-right: 0;"
            isLastOfGroup
            :colorBack="beneficiary.category.color.light"
          >
            <BaseButtonIcon
              icon="chevron-down"
              color="neutral"
              hint="Expand category"
              doBlurOnClick
              shiftY="0.05em"
              @click="onExpandChange(beneficiary.categoryName, true)"
            />
          </BaseCellHead>
          <BaseCellHead
            style="max-width: 6rem;"
            isLastOfGroup
            :colorBack="beneficiary.category.color.light"
            :rowspan="beneficiary.category.computed.members"
          >
            {{ beneficiary.categoryName }}
          </BaseCellHead>
          <BaseCellHead
            style="min-width: 10rem;"
            isLastOfGroup
            :colorBack="beneficiary.category.color.light"
          >
            ...
          </BaseCellHead>
          <BaseCellHead
            v-if="showDefinitions"
            style="min-width: 16rem;"
            isLastOfGroup
            :colorBack="beneficiary.category.color.lighter"
          >
            ...
          </BaseCellHead>
          <BaseCellData
            v-for="stakeholder in filteredStakeholderArray"
            isLastOfGroup
            :key="stakeholder.name"
          >
            {{ number(beneficiary.category.computed.scoreTotals[stakeholder.name]) }}
          </BaseCellData>
          <BaseCellData
            v-if="showResults"
            isLastOfGroup
            :colorBack="beneficiary.category.color.lighter"
            :colspan="2"
          >
            {{ percent(beneficiary.category.computed.result, beneficiaryResultTotal) }}
          </BaseCellData>
        </template>
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
          :colspan="showDefinitions ? 4 : 3"
        >
          Total
        </BaseCellHead>
        <BaseCellData
          v-for="stakeholder in filteredStakeholderArray"
          style="font-weight: bold;"
          isLastOfGroup
          :key="stakeholder.name"
        >
          {{ scaleUp(scoreTotals[stakeholder.name]) }}
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
    showAllColumns: Boolean,
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
    filteredStakeholderNames() {
      const ret = []
      Object.entries(project.data.stakeholderSection.stakeholders).forEach(([stakeholderName, stakeholder]) => {
        if (stakeholder.computed.result > 0) ret.push(stakeholderName)
      })
      return ret
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
    filteredStakeholderArray() {
      if (this.showAllColumns) return this.stakeholderArray
      return this.stakeholderArray.filter(stakeholder => {
        return (stakeholder.name === this.currentStakeholderName && stakeholder.computed.result > 0)
      })
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
    stakeholderResultTotal() {
      return project.data.stakeholderSection.computed.resultTotal
    },
    beneficiaryResultTotal() {
      return project.data.beneficiarySection.computed.resultTotal
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
    onExpandChange(categoryName, event) {
      project.setBeneficiaryCategoryExpanded(categoryName, event)
    },
    isEditing(rowName) {
      return (this.editing.rowName === rowName)
    },
  }
}
</script>

<style scoped>

</style>