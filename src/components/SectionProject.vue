<template>
  <div>
    <h3 for="project-name">
      Title
    </h3>
    <BaseField
      id="project-name"
      :value="projectName"
      @change="setProjectName"
    />
    <BaseNotes
      title="Description"
      :value="projectNote.text"
      :expanded="projectNote.expanded"
      @change-note="setProjectNote"
      @change-expanded="setProjectNoteExpanded"
    />
  </div>
</template>


<script>
import BaseField from './BaseField.vue'
import BaseNotes from './BaseNotes.vue'

import Util from '../classes/Util.js'
import { project } from '../store.js'

export default {
  name: 'SectionProject',
  components: {
    BaseField,
    BaseNotes,
  },
  computed: {
    projectName() {
      return project.data.meta.name
    },
    projectNote() {
      return project.data.meta.note
    },
  },
  methods: {
    setProjectName(event) {
      project.setProjectName(event)
    },
    setProjectNote(event) {
      project.setProjectNote({ text: event })
    },
    setProjectNoteExpanded(event) {
      project.setProjectNote({ expanded: event })
    },
  },
}
</script>

<style scoped>

</style>
