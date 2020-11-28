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
          v-for="beneficiary in currentBeneficiaryArray"
          noBorder
          isHorz
          :key="beneficiary.name"
          :colorBack="beneficiary.category.color.primary"
        />
      </tr>
      <tr>
        <BaseCellEmphasis
          colorBack="var(--color-table-head-emphasis)"
          isLastOfGroup
          :rowspan="3"
        />
        <BaseCellHead
          isLastOfGroup
          doBorderTop
          :rowspan="3"
        >
          Category
        </BaseCellHead>
        <BaseCellHead
          isLastOfGroup
          doBorderTop
          :rowspan="3"
        >
          Subcategory
        </BaseCellHead>
        <BaseCellHead
          v-if="showDefinitions"
          isLastOfGroup
          doBorderTop
          :rowspan="3"
        >
          Definition
        </BaseCellHead>
        <BaseCellHead
          :colspan="currentBeneficiaryCategory.computed.members"
          :colorBack="currentBeneficiaryCategory.color.light"
        >
          <BaseSelect
            style="font-weight: bold;"
            label="Beneficiary"
            :options="beneficiaryCategories"
            @change="onMetricChange"
          />
        </BaseCellHead>
      </tr>
      <tr>
        <BaseCellHead
          v-for="beneficiary in currentBeneficiaryArray"
          style="max-width: 8rem; font-weight: normal; text-align: center;"
          :key="beneficiary.name"
          :colorBack="currentBeneficiaryCategory.color.light"
        >
          {{ beneficiary.name }}
        </BaseCellHead>
      </tr>
      <tr>
        <BaseCellHead
          v-for="beneficiary in currentBeneficiaryArray"
          style="max-width: 8rem; font-weight: normal; text-align: center;"
          isLastOfGroup
          :key="beneficiary.name"
          :colorBack="currentBeneficiaryCategory.color.light"
        >
          {{ scaleUp(percentages[beneficiary.name]) }}%
        </BaseCellHead>
      </tr>
    </template>
    <template #body>
      <tr
        v-for="(attribute, index) in attributeArray"
        :key="attribute.name"
      >
        <BaseCellEmphasis
          :colorBack="attribute.category.color.primary"
          :noBorder="!attribute.computed.isLastOfCategory"
          :isLastOfGroup="attribute.computed.isLastOfCategory"
        />
        <BaseCellHead
          v-if="attribute.computed.isFirstOfCategory"
          style="max-width: 6rem;"
          isLastOfGroup
          :rowspan="attribute.category.computed.members"
        >
          {{ attribute.categoryName }}
        </BaseCellHead>
        <BaseCellHead
          style="max-width: 16rem;"
          colorBack="var(--color-table-head1-back)"
          :isLastOfGroup="attribute.computed.isLastOfCategory"
        >
          {{ attribute.name }}
        </BaseCellHead>
        <BaseCellHead
          v-if="showDefinitions"
          style="max-width: 20rem;"
          colorBack="var(--color-table-head2-back)"
          :isLastOfGroup="attribute.computed.isLastOfCategory"
        >
          {{ attribute.def }}
        </BaseCellHead>
        <BaseCellDataField
          v-for="beneficiary in currentBeneficiaryArray"
          :key="beneficiary.name"
          :value="isEditing(attribute.name, beneficiary.name) ? editing.val : scaleUp(attribute.scores[beneficiary.name])"
          :validationMsg="isEditing(attribute.name, beneficiary.name) ? editing.err : ''"
          :isLastOfGroup="attribute.computed.isLastOfCategory"
          @input="onDataInput(attribute.name, beneficiary.name, $event)"
          @change="onDataChange(attribute.name, beneficiary.name, $event)"
          @key-enter="onDataKeyEnter(index)"
        />
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
          v-for="beneficiary in currentBeneficiaryArray"
          style="font-weight: bold;"
          isLastOfGroup
          :key="beneficiary.name"
        >
          {{ scaleUp(scoreTotals[beneficiary.name]) }}
        </BaseCellData>
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
  name: 'TableAttribute',
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
  },
  data() {
    return {
      currentBeneficiaryCategoryName: Object.keys(project.data.beneficiarySection.categories)[0],
      editing: {
        rowName: null,
        colName: Object.keys(project.data.beneficiarySection.beneficiaries)[0], // current beneficiary name
        val: null,
        err: null,
      }
    }
  },
  computed: {
    currentBeneficiaryCategory() {
      return project.data.beneficiarySection.categories[this.currentBeneficiaryCategoryName]
    },
    beneficiaryCategories() {
      return Object.keys(project.data.beneficiarySection.categories)
    },
    beneficiaryNames() {
      return Object.keys(project.data.beneficiarySection.beneficiaries)
    },
    currentBeneficiaryArray() {
      return this.beneficiaryArray.filter(beneficiary => {
        return (beneficiary.categoryName === this.currentBeneficiaryCategoryName)
      })
    },
    beneficiaryArray() {
      return project.getBeneficiaryArray()
    },
    attributeArray() {
      return project.getAttributeArray()
    },
    lastCategory() {
      return this.attributeArray[this.attributeArray.length - 1].categoryName
    },
    scoreTotals() {
      return project.data.attributeSection.computed.scoreTotals
    },
    percentages() {
      const ret = {}
      const sum = project.data.beneficiarySection.computed.resultTotal
      this.beneficiaryArray.forEach(beneficiary => {
        ret[beneficiary.name] = beneficiary.computed.result/sum
      })
      return ret
    },
  },
  methods: {
    onMetricChange(event) {
      this.currentBeneficiaryCategoryName = event
      Object.keys(this.editing).forEach(key => this.editing[key] = null)
    },
    onDataInput(attributeName, beneficiaryName, event) {
      const { val, err } = this.validateNumRange(event)
      this.editing = {
        rowName: attributeName,
        colName: beneficiaryName,
        val: event,
        err,
      }
    },
    onDataChange(attributeName, beneficiaryName, event) {
      const { val, err } = this.validateNumRange(event)
      project.setAttributeScore(attributeName, beneficiaryName, this.scaleDown(val))
      Object.keys(this.editing).forEach(key => this.editing[key] = null)
    },
    onDataKeyEnter(index) {
      // TODO method to focus next vertical cell?
    },
    isEditing(rowName, colName) {
      return (this.editing.rowName === rowName && this.editing.colName === colName)
    }
  }
}
</script>

<style scoped>

</style>