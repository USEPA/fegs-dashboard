<template>
  <BaseSection
    title="Stakeholders"
    prevSection="Weights"
    :isReady="isReady"
  >
    <h2>Stakeholders</h2>
    <p>
      Identify your stakeholder groups.
      Press <em>New Stakeholder</em> to open the stakeholder creation modal.
    </p>
    <p style="margin-bottom: 1rem;">
      Once you have entered your stakeholder data proceed to the beneficiary section.
    </p>
    <BaseNotes
      :value="stakeholderNote.text"
      :expanded="stakeholderNote.expanded"
      @change-note="setStakeholderNote"
      @change-expanded="setStakeholderNoteExpanded"
    />
    <div style="display: flex; margin-top: 1rem;">
      <BaseButton
        style="margin-bottom: .5rem;"
        @click="beginNewStakeholder"
      >
        New Stakeholder
      </BaseButton>
      <BaseButton
        style="margin-bottom: .5rem; margin-left: .5rem;"
        v-if="isDev"
        @click="createNewStakeholderDev"
      >
        Generate
      </BaseButton>
      <BaseCheckbox
        v-if="hasStakeholders"
        style="margin-bottom: .5rem; margin-left: .5rem;"
        label="Show results"
        :isChecked="stakeholderShow.results"
        @change="onShowResultChange"
      />
    </div>
    <BaseModal
      v-if="isCreatingNewStakeholder"
      title="New Stakeholder"
      @close="isCreatingNewStakeholder = false"
    >
      <p>Enter the name of this stakeholder group</p>
      <BaseField
        style="margin-bottom: 1rem;"
        :value="isEditing('name') ? editing.val : newStakeholderData.name"
        :validationMsg="isEditing('name') ? editing.err : ''"
        @input="onNameInput"
        @change="onNameChange"
        @key-enter="onNameKeyEnter"
      />
      <p>Score the stakeholder group for each of the 9 criteria, then click "Add Stakeholder"</p>
      <BaseTable
        style="max-width: 50vw; margin-right: .5rem;"
      >
        <template #head>
          <tr>
            <BaseCellEmphasis
              colorBack="var(--color-table-head-emphasis)"
              isLastOfGroup
            />
            <BaseCellHead isLastOfGroup doBorderTop>Criterion</BaseCellHead>
            <BaseCellHead isLastOfGroup doBorderTop>Instruction</BaseCellHead>
            <BaseCellHead isLastOfGroup doBorderTop>Score</BaseCellHead>
          </tr>
        </template>
        <template #body>
          <tr
            v-for="criterion in criterionArray"
            :key="criterion.name"
          >
            <BaseCellEmphasis
              :colorBack="criterion.color.primary"
            />
            <BaseCellHead>{{ criterion.name }}</BaseCellHead>
            <BaseCellHead
              colorBack="var(--color-table-head2-back)"
            >
              {{ criterion.tip }}
              <br style="line-height: 2em;">
              Enter a number from 0 <span style="font-style: italic;">
                ({{ criterion.min }})
              </span> to 100 <span style="font-style: italic;">
                ({{ criterion.max }})
              </span>
            </BaseCellHead>
            <BaseCellDataField
              :value="isEditing(criterion.name) ? editing.val : scaleUp(newStakeholderData.scores[criterion.name])"
              :validationMsg="isEditing(criterion.name) ? editing.err : ''"
              @input="onScoreInput(criterion.name, $event)"
              @change="onScoreChange(criterion.name, $event)"
              @key-enter="onScoreKeyEnter(criterion.name, $event)"
            />
          </tr>
        </template>
      </BaseTable>
      <div class="control">
        <BaseButton
          :isDisabled="!isValidNewStakeholder"
          @click="createNewStakeholder"
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
    <div class="full">
      <TableStakeholder
        v-if="hasStakeholders"
        :showResults="stakeholderShow.results"
      />
    </div>
    <div class="full">
      <BaseChartBar
        v-if="hasStakeholders"
        title="Stakeholder Prioritization"
        :width="1080"
        :height="500"
        :data="barContent.data"
        :colors="barContent.colors"
      />
      <BaseChartPie
        v-if="hasStakeholders"
        title="Prioritization Criteria Relative Weights"
        :width="1080"
        :height="300"
        :data="pieContent.data"
        :colors="pieContent.colors"
      />
    </div>
  </BaseSection>
</template>


<script>
import BaseButton from './BaseButton.vue'
import BaseCellHead from './BaseCellHead.vue'
import BaseCellEmphasis from './BaseCellEmphasis.vue'
import BaseCellData from './BaseCellData.vue'
import BaseCellDataField from './BaseCellDataField.vue'
import BaseChartBar from './BaseChartBar.vue'
import BaseChartPie from './BaseChartPie.vue'
import BaseCheckbox from './BaseCheckbox.vue'
import BaseField from './BaseField.vue'
import BaseModal from './BaseModal.vue'
import BaseNotes from './BaseNotes.vue'
import BaseSection from './BaseSection.vue'
import BaseTable from './BaseTable.vue'
import TableStakeholder from './TableStakeholder.vue'

import input from './mixins/input.js'

// TODO extract new stakeholder modal into a separate component file (hard code some things)

import Util from '../classes/Util.js'
import { project, uid } from '../store.js'

export default {
  name: 'SectionStakeholder',
  components: {
    BaseButton,
    BaseCellHead,
    BaseCellEmphasis,
    BaseCellData,
    BaseCellDataField,
    BaseChartBar,
    BaseChartPie,
    BaseCheckbox,
    BaseField,
    BaseModal,
    BaseNotes,
    BaseSection,
    BaseTable,
    TableStakeholder,
  },
  mixins: [input],
  props: {
    isReady: {
      type: Boolean,
      default: true,
    },
  },
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
    isDev() {
      return Util.isDev()
    },
    pieContent() {
      return project.getCriterionPieContent()
    },
    barContent() {
      return project.getStakeholderBarContent({ short: true })
    },
    stakeholderNote() {
      return project.data.stakeholderSection.note
    },
    stakeholderShow() {
      return project.data.stakeholderSection.show
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
      const name = this.newStakeholderData.name
      const color = project.data.stakeholderSection.computed.colorsRemain[0] || '#000'
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
    createNewStakeholderDev() {
      const name = `Test Stakeholder ${uid.next().substring(3)}`
      const color = project.data.stakeholderSection.computed.colorsRemain[0] || '#000'
      project.addStakeholder(name, color)
      Object.keys(project.data.criterionSection.criteria).forEach(criterion => {
        const score = Math.floor(Math.random()*100)/100
        project.setStakeholderScore(name, criterion, score)
      })
    },
    setStakeholderNote(event) {
      project.setStakeholderNote({ text: event })
    },
    setStakeholderNoteExpanded(event) {
      project.setStakeholderNote({ expanded: event })
    },
    onShowResultChange(event) {
      project.setStakeholderShow({ results: event })
    },
  },
}
</script>

<style scoped>
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