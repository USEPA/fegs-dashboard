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
          v-for="beneficiary in currentBeneficiaryArray"
          noBorder
          isHorz
          :key="beneficiary.name"
          :colorBack="beneficiary.category.color.primary"
        />
      </tr>
      <tr>
        <BaseTableCellEmphasis
          colorBack="var(--color-table-head-emphasis)"
          noBorder
        />
        <BaseTableCellHead
          isLastOfGroup
          doBorderTop
          :rowspan="2"
        >
          Category
        </BaseTableCellHead>
        <BaseTableCellHead
          isLastOfGroup
          doBorderTop
          :rowspan="2"
        >
          Subcategory
        </BaseTableCellHead>
        <BaseTableCellHead
          v-if="showDefinitions"
          isLastOfGroup
          doBorderTop
          :rowspan="2"
        >
          Definition
        </BaseTableCellHead>
        <BaseTableCellHead
          :colspan="currentBeneficiaryCategory.computed.members"
          :colorBack="currentBeneficiaryCategory.color.light"
        >
          <BaseSelect
            style="font-weight: bold;"
            label="Beneficiary"
            :options="beneficiaryCategories"
            @change="onMetricChange"
          />
        </BaseTableCellHead>
      </tr>
      <tr>
        <BaseTableCellEmphasis
          colorBack="var(--color-table-head-emphasis)"
          isLastOfGroup
        />
        <BaseTableCellHead
          v-for="beneficiary in currentBeneficiaryArray"
          style="max-width: 8rem; font-weight: normal; text-align: center;"
          isLastOfGroup
          :key="beneficiary.name"
          :colorBack="beneficiary.category.color.light"
        >
          {{ beneficiary.name }}
        </BaseTableCellHead>
      </tr>
    </template>
    <template #body>
      <tr
        v-for="(attribute, index) in attributeArray"
        :key="attribute.name"
      >
        <BaseTableCellEmphasis
          :colorBack="attribute.category.color.primary"
          :noBorder="!attribute.computed.isLastOfCategory"
          :isLastOfGroup="attribute.computed.isLastOfCategory"
        />
        <BaseTableCellHead
          v-if="attribute.computed.isFirstOfCategory"
          style="max-width: 6rem;"
          isLastOfGroup
          :rowspan="attribute.category.computed.members"
        >
          {{ attribute.categoryName }}
        </BaseTableCellHead>
        <BaseTableCellHead
          style="max-width: 16rem;"
          colorBack="var(--color-table-head1-back)"
          :isLastOfGroup="attribute.computed.isLastOfCategory"
        >
          {{ attribute.name }}
        </BaseTableCellHead>
        <BaseTableCellHead
          v-if="showDefinitions"
          style="max-width: 20rem;"
          colorBack="var(--color-table-head2-back)"
          :isLastOfGroup="attribute.computed.isLastOfCategory"
        >
          {{ attribute.def }}
        </BaseTableCellHead>
        <BaseTableCellDataField
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
  name: 'TableAttribute',
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
      return project.getBeneficiaryArray().filter(beneficiary => {
        return (beneficiary.categoryName === this.currentBeneficiaryCategoryName)
      })
    },
    attributeArray() {
      return project.getAttributeArray()
    },
    lastCategory() {
      return this.attributeArray[this.attributeArray.length - 1].categoryName
    }
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