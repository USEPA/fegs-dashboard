<template>
  <BaseTable>
    <template #head>
      <tr>
        <BaseTableCellHead isSpace/>
        <BaseTableCellHead isSpace/>
        <BaseTableCellHead isSpace/>
        <BaseTableCellEmphasis
          v-for="criterion in criterionArray"
          noBorder
          isHorz
          :key="criterion.name"
          :colorBack="criterion.color.primary"
        />
      </tr>
      <tr>
        <BaseTableCellEmphasis
          colorBack="var(--color-table-head-emphasis)"
          isLastOfGroup
        />
        <BaseTableCellHead isLastOfGroup doBorderTop/>
        <BaseTableCellHead isLastOfGroup doBorderTop>Stakeholder</BaseTableCellHead>
        <BaseTableCellHead
          v-for="criterion in criterionArray"
          style="max-width: 8rem; font-weight: normal; text-align: center;"
          isLastOfGroup
          :key="criterion.name"
        >
          {{ criterion.name }}
        </BaseTableCellHead>
      </tr>
    </template>
    <template #body>
      <tr
        v-for="(stakeholder, index) in stakeholderArray"
        :key="stakeholder.name"
      >
        <BaseTableCellEmphasis
          :colorBack="stakeholder.color.primary"
        />
        <BaseTableCellData
          :darken="index%2 === 1"
        >
          <BaseButtonIcon
            icon="trash"
            color="danger"
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
        </BaseTableCellData>
        <BaseTableCellData
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
        </BaseTableCellData>
        <BaseTableCellDataField
          v-for="criterion in criterionArray"
          :key="criterion.name"
          :value="isEditing(stakeholder.name, criterion.name) ? editing.val : scaleUp(stakeholder.scores[criterion.name])"
          :validationMsg="isEditing(stakeholder.name, criterion.name) ? editing.err : ''"
          :darken="index%2 === 1"
          @input="onDataInput(stakeholder.name, criterion.name, $event)"
          @change="onDataChange(stakeholder.name, criterion.name, $event)"
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
import BaseTable from './BaseTable.vue'
import BaseTableCellHead from './BaseTableCellHead.vue'
import BaseTableCellEmphasis from './BaseTableCellEmphasis.vue'
import BaseTableCellData from './BaseTableCellData.vue'
import BaseTableCellDataField from './BaseTableCellDataField.vue'

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
    BaseTableCellHead,
    BaseTableCellEmphasis,
    BaseTableCellData,
    BaseTableCellDataField,
  },
  mixins: [input],
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