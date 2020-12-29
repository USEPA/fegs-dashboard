<template>
  <BaseSection>
    <h2>
      Project — {{ projectName }}
      <BaseButtonIcon
        style="font-size: 1.5rem;"
        icon="edit"
        color="primary"
        hint="Edit project title"
        @click="onNameEdit"
      />
    </h2>
    <BaseModal
      v-if="isEditingName"
      title="Project Title"
      @close="isEditingName = false"
    >
      <BaseField
        style="min-width: 20em; margin: .5rem .5em 0 0; display: inline-block;"
        :isWrapped="false"
        :value="projectName"
        @change="onNameChange"
        @key-enter="onNameSave"
      />
      <BaseButton
        style="margin-top: .5em; float: right;"
        @click="onNameSave"
      >
        Save
      </BaseButton>
    </BaseModal>
    <BaseNotes
      title="Description"
      :value="projectNote.text"
      :expanded="projectNote.expanded"
      @change-note="setProjectNote"
      @change-expanded="setProjectNoteExpanded"
    />
    <h3>Options</h3>
    <BaseCheckbox
      label="Greyscale colors"
      :isChecked="doGreyscale"
      @change="setDoGreyscale"
    />
  </BaseSection>
</template>


<script>
import BaseButton from './BaseButton.vue'
import BaseButtonIcon from './BaseButtonIcon.vue'
import BaseCheckbox from './BaseCheckbox.vue'
import BaseField from './BaseField.vue'
import BaseModal from './BaseModal.vue'
import BaseNotes from './BaseNotes.vue'
import BaseSection from './BaseSection.vue'

import Util from '../classes/Util.js'
import { project } from '../store.js'

export default {
  name: 'SectionProject',
  components: {
    BaseButton,
    BaseButtonIcon,
    BaseCheckbox,
    BaseField,
    BaseModal,
    BaseNotes,
    BaseSection,
  },
  data() {
    return {
      isEditingName: false,
      editingNameValue: null,
    }
  },
  computed: {
    projectName() {
      return project.data.meta.name
    },
    projectNote() {
      return project.data.meta.note
    },
    doGreyscale() {
      return project.data.meta.options.doGreyscale
    },
  },
  methods: {
    onNameEdit() {
      this.isEditingName = true
      this.editingNameValue = this.projectName
    },
    onNameChange(event) {
      this.editingNameValue = event
    },
    onNameSave() {
      this.isEditingName = false
      project.setProjectName(this.editingNameValue)
    },
    setProjectNote(event) {
      project.setProjectNote({ text: event })
    },
    setProjectNoteExpanded(event) {
      project.setProjectNote({ expanded: event })
    },
    setDoGreyscale(event) {
      project.setProjectOption('doGreyscale', event)
    },
  },
}
</script>

<style scoped>

</style>
