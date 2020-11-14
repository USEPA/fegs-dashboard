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
        <template>
          <BaseTableCellHead
            v-for="beneficiary in currentBeneficiaryArray"
            :key="beneficiary.name"
            :colorBack="beneficiary.category.color.primary"
            :barHorz="true"
            :isEmphasis="true"
          />
        </template>
      </BaseTableRow>
      <BaseTableRow
        colorEmphasis="var(--color-table-head-emphasis)"
      >
        <BaseTableCellHead :rowspan="2">Category</BaseTableCellHead>
        <BaseTableCellHead :rowspan="2">Subcategory</BaseTableCellHead>
        <BaseTableCellHead
          v-if="showDefinitions"
          :rowspan="2"
        >
          Definition
        </BaseTableCellHead>
        <BaseTableCellHead
          :colspan="currentBeneficiaryCategory.computed.members"
          :colorBack="currentBeneficiaryCategory.color.lighter"
        >
          <BaseSelect
            style="font-weight: bold;"
            label="Beneficiary"
            @change="onMetricChange"
            :options="beneficiaryCategories"
          />
        </BaseTableCellHead>
      </BaseTableRow>
      <BaseTableRow
        colorEmphasis="var(--color-table-head-emphasis)"
      >
        <template>
          <BaseTableCellHead
            style="max-width: 8rem; font-weight: normal; text-align: center;"
            v-for="beneficiary in currentBeneficiaryArray"
            :key="beneficiary.name"
            :colorBack="beneficiary.category.color.lighter"
          >
            {{ beneficiary.name }}
          </BaseTableCellHead>
        </template>
      </BaseTableRow>
    </template>
    <template #body>
      <BaseTableRow
        v-for="(attribute, index) in attributeArray"
        :key="attribute.name"
        :colorEmphasis="attribute.category.color.primary"
        :darken="index%2 === 1"
      >
        <BaseTableCellHead
          style="max-width: 6rem;"
          v-if="attribute.computed.firstOfCategory"
          :rowspan="attribute.category.computed.members"
          :darken="true"
        >
          {{ attribute.categoryName }}
        </BaseTableCellHead>
        <BaseTableCellHead
          style="max-width: 16rem;"
          colorBack="var(--color-table-head-back)"
        >
          {{ attribute.name }}
        </BaseTableCellHead>
        <BaseTableCellHead
          v-if="showDefinitions"
          style="max-width: 20rem;"
          colorBack="var(--color-table-head2-back)"
        >
          {{ attribute.def }}
        </BaseTableCellHead>
        <template>
          <BaseTableCellDataField
            v-for="beneficiary in currentBeneficiaryArray"
            @input="onDataInput(attribute.name, beneficiary.name, $event)"
            @change="onDataChange(attribute.name, beneficiary.name, $event)"
            @key-enter="onDataKeyEnter(index)"
            :key="beneficiary.name"
            :value="isEditing(attribute.name, beneficiary.name) ? editing.val : scaleUp(attribute.scores[editing.colName])"
            :validationMsg="isEditing(attribute.name, beneficiary.name) ? editing.err : ''"
          />
        </template>
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
  name: 'TableAttribute',
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