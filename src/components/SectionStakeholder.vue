<template>
  <div>
    <BaseButton
      style="margin-bottom: .5rem;"
      @click="beginNewStakeholder"
    >
      New Stakeholder
    </BaseButton>
    <BaseModal
      v-if="isCreatingNewStakeholder"
      title="New Stakeholder"
      @close="isCreatingNewStakeholder = false"
    >
      <p>Enter the name of this stakeholder group</p>
      <BaseField
        style="margin-bottom: 1rem;"
        @input="onNameInput"
        @change="onNameChange"
        @key-enter="onNameKeyEnter"
        :value="isEditing('name') ? editing.val : newStakeholderData.name"
        :validationMsg="isEditing('name') ? editing.err : ''"
      />
      <p>Score the stakeholder group for each of the 9 criteria, then click "Add Stakeholder"</p>
      <BaseTable
        style="max-width: 50vw;"
      >
        <template #head>
          <BaseTableRow
            colorEmphasis="var(--color-table-head-emphasis)"
          >
            <BaseTableCellHead>Criterion</BaseTableCellHead>
            <BaseTableCellHead>Instruction</BaseTableCellHead>
            <BaseTableCellHead>Score</BaseTableCellHead>
          </BaseTableRow>
        </template>
        <template #body>
          <BaseTableRow
            v-for="criterion in criterionArray"
            :key="criterion.name"
            :colorEmphasis="criterion.color.primary"
          >
            <BaseTableCellHead>{{ criterion.name }}</BaseTableCellHead>
            <BaseTableCellHead
              colorBack="var(--color-table-head2-back)"
            >
              {{ criterion.tip }}
              <br style="line-height: 2em;">
              Enter a number from 0 <span style="font-style: italic;">
                ({{ criterion.min }})
              </span> to 100 <span style="font-style: italic;">
                ({{ criterion.max }})
              </span>
            </BaseTableCellHead>
            <BaseTableCellDataField
              @input="onScoreInput(criterion.name, $event)"
              @change="onScoreChange(criterion.name, $event)"
              @key-enter="onScoreKeyEnter(criterion.name, $event)"
              :value="isEditing(criterion.name) ? editing.val : scaleUp(newStakeholderData.scores[criterion.name])"
              :validationMsg="isEditing(criterion.name) ? editing.err : ''"
            />
          </BaseTableRow>
        </template>
      </BaseTable>
      <!-- <div
        class="criterion"
        v-for="criterion in criterionArray"
        :key="criterion.name"
      >
        <h5>{{ criterion.name }}</h5>
        <p style="max-width: 40rem;">{{ criterion.tip }}</p>
        <BaseField
          style="width: 4em;"
          @input="onScoreInput(criterion.name, $event)"
          @change="onScoreChange(criterion.name, $event)"
          @key-enter="onScoreKeyEnter(criterion.name, $event)"
          :value="isEditing(criterion.name) ? editing.val : scaleUp(newStakeholderData.scores[criterion.name])"
          :validationMsg="isEditing(criterion.name) ? editing.err : ''"
        />
      </div> -->
      <div class="control">
        <BaseButton
          @click="createNewStakeholder"
          :isDisabled="!isValidNewStakeholder"
        >
          Add Stakeholder
        </BaseButton>
        <div
          style="color: var(--color-text-disabled); padding-left: .5em;"
          v-if="!isValidNewStakeholder"
        >
          Populate all fields first
        </div>
      </div>
    </BaseModal>
    <div class="table-wrap">
      <TableStakeholder
        v-if="hasStakeholders"
      />
    </div>
  </div>
</template>


<script>
import BaseButton from './BaseButton.vue'
import BaseField from './BaseField.vue'
import BaseModal from './BaseModal.vue'
import BaseTable from './BaseTable.vue'
import BaseTableRow from './BaseTableRow.vue'
import BaseTableCellHead from './BaseTableCellHead.vue'
import BaseTableCellData from './BaseTableCellData.vue'
import BaseTableCellDataField from './BaseTableCellDataField.vue'
import TableStakeholder from './TableStakeholder.vue'

import input from './mixins/input.js'

import Util from '../classes/Util.js'
import { project, uid } from '../store.js'

export default {
  name: 'SectionStakeholder',
  components: {
    BaseButton,
    BaseField,
    BaseModal,
    BaseTable,
    BaseTableRow,
    BaseTableCellHead,
    BaseTableCellData,
    BaseTableCellDataField,
    TableStakeholder,
  },
  mixins: [input],
  data() {
    return {
      isCreatingNewStakeholder: false,
      newStakeholderData: {
        name: null,
        scores: {},
      },
      editing: {
        rowName: null,
        val: null,
        err: null,
      },
    }
  },
  computed: {
    hasStakeholders() {
      return Object.keys(project.data.stakeholderSection.stakeholders).length > 0
    },
    isValidNewStakeholder() {
      if (!this.newStakeholderData.name) return false
      return Object.values(this.newStakeholderData.scores).every(score => (score !== null))
    },
    criterionArray() {
      return project.getCriterionArray()
    },
  },
  methods: {
    onNameInput(event) {
      const { val, err } = this.validateName(event)
      this.editing = {
        rowName: 'name',
        val: event,
        err,
      }
    },
    onNameChange(event) {
      const { val, err } = this.validateName(event)
      this.newStakeholderData.name = val
      Object.keys(this.editing).forEach(key => this.editing[key] = null)
    },
    onNameKeyEnter(index) {
      // TODO method to focus next input?
    },
    onScoreInput(criterionName, event) {
      const { val, err } = this.validateNumRange(event)
      this.editing = {
        rowName: criterionName,
        val: event,
        err,
      }
    },
    onScoreChange(criterionName, event) {
      const { val, err } = this.validateNumRange(event)
      this.newStakeholderData.scores[criterionName] = this.scaleDown(val)
      Object.keys(this.editing).forEach(key => this.editing[key] = null)
    },
    onScoreKeyEnter(index) {
      // TODO method to focus next input?
    },
    beginNewStakeholder() {
      this.isCreatingNewStakeholder = true
      const scores = {}
      Object.keys(project.data.criterionSection.criteria).forEach(criterionName => scores[criterionName] = null)
      this.newStakeholderData = { name: null, scores }
    },
    createNewStakeholder() {
      this.isCreatingNewStakeholder = false
      const color = project.data.stakeholderSection.computed.colorsRemain[0] || '#000'
      const name = this.newStakeholderData.name
      project.addStakeholder(name, color)
      Object.entries(this.newStakeholderData.scores).forEach(([criterionName, score]) => {
        project.setStakeholderScore(name, criterionName, score)
      })
      this.newStakeholderData = {}
    },
    validateName(newName) {
      if (newName in project.data.stakeholderSection.stakeholders) {
        return { val: null, err: 'Stakeholder already exists'}
      } else {
        return { val: newName, err: '' }
      }
    },
    isEditing(rowName) {
      return (this.editing.rowName === rowName)
    },
  },
}
</script>

<style scoped>
  .table-wrap {
    margin: 0 calc(-1 * var(--length-primary));
    overflow-x: auto;
  }
  div.criterion {
    margin-bottom: 2rem;
  }
  p {
    margin: .5em 0;
  }
  div.control {
    margin: 1.5rem 0 1rem 0;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
</style>