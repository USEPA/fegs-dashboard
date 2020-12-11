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
          v-for="beneficiary in filteredBeneficiaryArray"
          noBorder
          isHorz
          :key="beneficiary.name"
          :colorBack="beneficiary.category.color.primary"
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
          :rowspan="3"
        />
        <BaseCellHead
          isLastOfGroup
          doBorderTop
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
        <template v-if="showAllColumns">
          <BaseCellHead
            v-for="category in beneficiaryCategoryArray"
            style="max-width: 8rem; font-weight: normal; text-align: center;"
            :key="category.name"
            :colspan="category.computed.members"
            :colorBack="category.color.light"
          >
            {{ category.name }}
          </BaseCellHead>
        </template>
        <BaseCellHead
          v-else
          :colspan="filteredBeneficiaryArray.length"
          :colorBack="currentBeneficiaryCategory.color.light"
        >
          <BaseSelect
            style="font-weight: bold;"
            label="Beneficiary"
            :value="currentBeneficiaryCategoryName"
            :options="filteredBeneficiaryCategoryNames"
            @change="onMetricChange"
          />
        </BaseCellHead>
        <BaseCellHead
          v-if="showResults"
          style="text-align: center;"
          isLastOfGroup
          doBorderTop
          :rowspan="3"
          :colspan="2"
        >
          Result
        </BaseCellHead>
      </tr>
      <tr>
        <BaseCellHead
          v-for="beneficiary in filteredBeneficiaryArray"
          style="max-width: 8rem; font-weight: normal; text-align: center;"
          :style="{ borderRight: showResults ? 'none' : null }"
          :key="beneficiary.name"
          :colorBack="beneficiary.category.color.light"
        >
          {{ beneficiary.name }}
        </BaseCellHead>
      </tr>
      <tr>
        <BaseCellHead
          v-for="beneficiary in filteredBeneficiaryArray"
          style="max-width: 8rem; font-weight: normal; text-align: center;"
          isLastOfGroup
          :style="{ borderRight: showResults ? 'none' : null }"
          :key="beneficiary.name"
          :colorBack="beneficiary.category.color.light"
        >
          {{ percent(beneficiary.computed.result, beneficiaryResultTotal) }}
        </BaseCellHead>
      </tr>
    </template>
    <template #body>
      <tr
        v-for="(attribute, index) in attributeArray"
        :key="attribute.name"
      >
        <template v-if="attribute.category.expanded">
          <BaseCellEmphasis
            v-if="attribute.computed.isFirstOfCategory"
            isLastOfGroup
            :colorBack="attribute.category.color.primary"
            :rowspan="attribute.category.computed.members"
          />
          <BaseCellHead
            v-if="attribute.computed.isFirstOfCategory"
            style="padding-right: 0;"
            isLastOfGroup
            :rowspan="attribute.category.computed.members"
          >
            <BaseButtonIcon
              icon="chevron-up"
              color="neutral"
              hint="Collapse category"
              doBlurOnClick
              shiftY="-0.08em"
              @click="onExpandChange(attribute.categoryName, false)"
            />
          </BaseCellHead>
          <BaseCellHead
            v-if="attribute.computed.isFirstOfCategory"
            style="max-width: 6rem;"
            isLastOfGroup
            :rowspan="attribute.category.computed.members"
          >
            {{ attribute.categoryName }}
          </BaseCellHead>
          <BaseCellHead
            style="max-width: 16rem; min-width; 10rem;"
            colorBack="var(--color-table-head1-back)"
            :isLastOfGroup="attribute.computed.isLastOfCategory"
          >
            {{ attribute.name }}
          </BaseCellHead>
          <BaseCellHead
            v-if="showDefinitions"
            style="max-width: 30rem; min-width: 16rem;"
            colorBack="var(--color-table-head2-back)"
            :isLastOfGroup="attribute.computed.isLastOfCategory"
          >
            {{ attribute.def }}
          </BaseCellHead>
          <BaseCellDataField
            v-for="beneficiary in filteredBeneficiaryArray"
            :key="beneficiary.name"
            :value="isEditing(attribute.name, beneficiary.name) ? editing.val : scaleUp(attribute.scores[beneficiary.name])"
            :validationMsg="isEditing(attribute.name, beneficiary.name) ? editing.err : ''"
            :isDisabled="!(beneficiary.computed.result > 0)"
            :isLastOfGroup="attribute.computed.isLastOfCategory"
            @input="onDataInput(attribute.name, beneficiary.name, $event)"
            @change="onDataChange(attribute.name, beneficiary.name, $event)"
            @key-enter="onDataKeyEnter(index)"
          />
          <BaseCellData
            v-if="showResults"
            colorBack="var(--color-table-head2-back)"
            style="border-right: none;"
            :isLastOfGroup="attribute.computed.isLastOfCategory"
          >
            {{ percent(attribute.computed.result, attributeResultTotal) }}
          </BaseCellData>
          <BaseCellData
            v-if="showResults && attribute.computed.isFirstOfCategory"
            colorBack="var(--color-table-head2-back)"
            isLastOfGroup
            :rowspan="attribute.category.computed.members"
          >
            {{ percent(attribute.category.computed.result, attributeResultTotal) }}
          </BaseCellData>
        </template>
        <template v-else-if="attribute.computed.isFirstOfCategory">
          <BaseCellEmphasis
            isLastOfGroup
            :colorBack="attribute.category.color.primary"
          />
          <BaseCellHead
            style="padding-right: 0;"
            isLastOfGroup
            :colorBack="attribute.category.color.light"
          >
            <BaseButtonIcon
              icon="chevron-down"
              color="neutral"
              hint="Expand category"
              doBlurOnClick
              shiftY="0.05em"
              @click="onExpandChange(attribute.categoryName, true)"
            />
          </BaseCellHead>
          <BaseCellHead
            style="max-width: 6rem;"
            isLastOfGroup
          >
            {{ attribute.categoryName }}
          </BaseCellHead>
          <BaseCellHead
            style="min-width: 10rem;"
            colorBack="var(--color-table-head1-back)"
            isLastOfGroup
          >
            ...
          </BaseCellHead>
          <BaseCellHead
            v-if="showDefinitions"
            style="min-width: 16rem;"
            colorBack="var(--color-table-head2-back)"
            isLastOfGroup
          >
            ...
          </BaseCellHead>
          <BaseCellData
            v-for="beneficiary in filteredBeneficiaryArray"
            isLastOfGroup
            :key="beneficiary.name"
          >
            {{ number(attribute.category.computed.scoreTotals[beneficiary.name]) }}
          </BaseCellData>
          <BaseCellData
            v-if="showResults"
            isLastOfGroup
            colorBack="var(--color-table-head2-back)"
            :colspan="2"
          >
            {{ percent(attribute.category.computed.result, attributeResultTotal) }}
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
          v-for="beneficiary in filteredBeneficiaryArray"
          style="font-weight: bold;"
          isLastOfGroup
          :key="beneficiary.name"
        >
          {{ scaleUp(scoreTotals[beneficiary.name]) }}
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
    showResults: Boolean,
    showAllColumns: Boolean,
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
    beneficiaryCategoryArray() {
      const ret = []
      Object.entries(project.data.beneficiarySection.categories).forEach(([categoryName, category]) => {
        ret.push({
          name: categoryName,
          ...category,
        })
      })
      return ret
    },
    filteredBeneficiaryCategoryNames() {
      const ret = []
      Object.entries(project.data.beneficiarySection.categories).forEach(([categoryName, category]) => {
        if (category.computed.result > 0) ret.push(categoryName)
      })
      return ret
    },
    beneficiaryNames() {
      return Object.keys(project.data.beneficiarySection.beneficiaries)
    },
    beneficiaryArray() {
      return project.getBeneficiaryArray()
    },
    filteredBeneficiaryArray() {
      if (this.showAllColumns) return this.beneficiaryArray
      return this.beneficiaryArray.filter(beneficiary => {
        return (beneficiary.categoryName === this.currentBeneficiaryCategoryName && beneficiary.computed.result > 0)
      })
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
    beneficiaryResultTotal() {
      return project.data.beneficiarySection.computed.resultTotal
    },
    attributeResultTotal() {
      return project.data.attributeSection.computed.resultTotal
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
    onExpandChange(categoryName, event) {
      project.setAttributeCategoryExpanded(categoryName, event)
    },
    isEditing(rowName, colName) {
      return (this.editing.rowName === rowName && this.editing.colName === colName)
    }
  }
}
</script>

<style scoped>

</style>