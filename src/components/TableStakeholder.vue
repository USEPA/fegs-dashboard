<template>
  <BaseTable>
    <template #head>
      <tr>
        <BaseCellHead isSpace/>
        <BaseCellHead isSpace/>
        <BaseCellHead isSpace/>
        <BaseCellEmphasis
          v-for="criterion in criterionArray"
          noBorder
          isHorz
          :key="criterion.name"
          :colorBack="criterion.color.primary"
        />
        <BaseCellHead
          v-if="showResults"
          isSpace
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
          Stakeholder
        </BaseCellHead>
        <BaseCellHead
          v-for="criterion in criterionArray"
          style="max-width: 8rem; font-weight: normal; text-align: center;"
          :key="criterion.name"
        >
          {{ criterion.name }}
        </BaseCellHead>
        <BaseCellHead
          v-if="showResults"
          isLastOfGroup
          :rowspan="2"
        >
          Result
        </BaseCellHead>
      </tr>
      <tr>
        <BaseCellHead
          v-for="criterion in criterionArray"
          style="max-width: 8rem; font-weight: normal; text-align: center;"
          isLastOfGroup
          :style="{ borderRight: showResults ? 'none' : null }"
          :key="criterion.name"
        >
          {{ percent(criterion.result, criterionResultTotal) }}
        </BaseCellHead>
      </tr>
    </template>
    <template #body>
      <tr
        v-for="(stakeholder, index) in stakeholderArray"
        :key="stakeholder.name"
      >
        <BaseCellEmphasis
          :colorBack="stakeholder.color.primary"
        />
        <BaseCellData
          style="padding-right: 0;"
          :darken="index%2 === 1"
        >
          <BaseButtonIcon
            icon="trash"
            color="danger"
            hint="Delete Stakeholder"
            @click="onBeginDelete(stakeholder.name)"
          />
          <BaseModal
            v-if="deleting === stakeholder.name"
            title="Delete Stakeholder?"
            @close="deleting = null"
          >
            <div
              style="width: 20rem; text-align: left;"
            >
              Delete stakeholder "{{ deleting }}" and all associated beneficiary scores?
            </div>
            <div
              style="margin-top: 1.5rem; display: flex; justify-content: flex-end;"
            >
              <BaseButton
                style="margin-right: .5rem;"
                @click="deleting = null"
              >
                Cancel
              </BaseButton>
              <BaseButton
                color="danger"
                @click="onConfirmDelete()"
              >
                Delete
              </BaseButton>
            </div>
          </BaseModal>
        </BaseCellData>
        <BaseCellData
          style="width: 8rem;"
          :darken="index%2 === 1"
        >
          <BaseField
            style="text-align: left;"
            :value="isEditing(stakeholder.name, 'name') ? editing.val : stakeholder.name"
            :validationMsg="isEditing(stakeholder.name, 'name') ? editing.err : ''"
            :doSelectAll="true"
            @input="onNameInput(stakeholder.name, $event)"
            @change="onNameChange(stakeholder.name, $event)"
            @key-enter="onNameKeyEnter(index)"
          />
        </BaseCellData>
        <BaseCellDataField
          v-for="criterion in criterionArray"
          :key="criterion.name"
          :value="isEditing(stakeholder.name, criterion.name) ? editing.val : scaleUp(stakeholder.scores[criterion.name])"
          :validationMsg="isEditing(stakeholder.name, criterion.name) ? editing.err : ''"
          :darken="index%2 === 1"
          @input="onDataInput(stakeholder.name, criterion.name, $event)"
          @change="onDataChange(stakeholder.name, criterion.name, $event)"
          @key-enter="onDataKeyEnter(index)"
        />
        <BaseCellData
          v-if="showResults"
          :darken="index%2 === 1"
        >
          {{ percent(stakeholder.computed.result, stakeholderResultTotal) }}
        </BaseCellData>
      </tr>
    </template>
    <!-- <template #foot>
      <tr>
        <BaseCellEmphasis
          colorBack="var(--color-table-head-emphasis)"
          isLastOfGroup
        />
        <BaseCellHead
          isLastOfGroup
          style="text-align: right;"
          :colspan="2"
        >
          Totals
        </BaseCellHead>
        <BaseCellData
          v-for="criterion in criterionArray"
          style="font-weight: bold;"
          isLastOfGroup
          :key="criterion.name"
        >
          {{ scaleUp(scoreTotals[criterion.name]) }}
        </BaseCellData>
      </tr>
    </template> -->
  </BaseTable>
</template>

<script>
import BaseButton from './BaseButton.vue'
import BaseButtonIcon from './BaseButtonIcon.vue'
import BaseField from './BaseField.vue'
import BaseModal from './BaseModal.vue'
import BaseTable from './BaseTable.vue'
import BaseCellHead from './BaseCellHead.vue'
import BaseCellEmphasis from './BaseCellEmphasis.vue'
import BaseCellData from './BaseCellData.vue'
import BaseCellDataField from './BaseCellDataField.vue'

import input from './mixins/input.js'

import Util from '../classes/Util.js'
import { project } from '../store.js'

export default {
  name: 'TableStakeholder',
  components: {
    BaseButton,
    BaseButtonIcon,
    BaseField,
    BaseModal,
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
      editing: {
        rowName: null, // stakeholderName
        colName: null, // criterionName or 'name'
        val: null,
        err: null,
      },
      deleting: null,
    }
  },
  computed: {
    criterionArray() {
      return project.getCriterionArray()
    },
    stakeholderArray() {
      return project.getStakeholderArray()
    },
    scoreTotals() {
      return project.data.stakeholderSection.computed.scoreTotals
    },
    criterionResultTotal() {
      return project.data.criterionSection.computed.resultTotal
    },
    stakeholderResultTotal() {
      return project.data.stakeholderSection.computed.resultTotal
    },
  },
  methods: {
    onBeginDelete(stakeholderName) {
      this.deleting = stakeholderName
    },
    onConfirmDelete() {
      project.delStakeholder(this.deleting)
      this.deleting = null
    },
    onNameInput(stakeholderName, event) {
      const { val, err } = this.validateName(stakeholderName, event)
      this.editing = {
        rowName: stakeholderName,
        colName: 'name',
        val: event,
        err,
      }
    },
    onNameChange(stakeholderName, event) {
      const { val, err } = this.validateName(stakeholderName, event)
      if (stakeholderName !== val) project.setStakeholderName(stakeholderName, val)
      Object.keys(this.editing).forEach(key => this.editing[key] = null)
    },
    onNameKeyEnter(index) {
      // TODO method to focus next vertical cell?
    },
    onDataInput(stakeholderName, criterionName, event) {
      const { val, err } = this.validateNumRange(event)
      this.editing = {
        rowName: stakeholderName,
        colName: criterionName,
        val: event,
        err,
      }
    },
    onDataChange(stakeholderName, criterionName, event) {
      const { val, err } = this.validateNumRange(event)
      project.setStakeholderScore(stakeholderName, criterionName, this.scaleDown(val))
      Object.keys(this.editing).forEach(key => this.editing[key] = null)
    },
    onDataKeyEnter(index) {
      // TODO method to focus next vertical cell?
    },
    validateName(oldName, newName) {
      if (newName in project.data.stakeholderSection.stakeholders && newName !== oldName) {
        return { val: oldName, err: 'Stakeholder already exists'}
      } else {
        return { val: newName, err: '' }
      }
    },
    isEditing(rowName, colName) {
      return (this.editing.rowName === rowName && this.editing.colName === colName)
    },
  },
}
</script>

<style scoped>

</style>