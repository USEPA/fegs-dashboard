<template>
  <div class="container">
    <h3>
      {{ title }}
      <BaseButtonIcon
        v-if="editing"
        icon="check"
        color="success"
        hint="Done"
        @click="onDone"
      />
      <BaseButtonIcon
        v-if="!editing"
        icon="edit"
        color="primary"
        :hint="`Edit ${title.toLowerCase()}`"
        @click="onEdit"
      />
      <BaseButtonIcon
        v-if="hasNote && !editing && expanded"
        icon="chevron-up"
        color="neutral"
        :hint="`Collapse ${title.toLowerCase()}`"
        doBlurOnClick
        @click="onExpandedClick"
      />
      <BaseButtonIcon
        v-if="hasNote && !editing && !expanded"
        icon="chevron-down"
        shiftY="0.05em"
        color="neutral"
        :hint="`Expand ${title.toLowerCase()}`"
        doBlurOnClick
        @click="onExpandedClick"
      />
    </h3>
    <BaseTextbox
      v-if="editing"
      ref="textbox"
      :value="value"
      @change="onNoteChange"
    />
    <p v-else-if="!hasNote" style="color: var(--color-text-disabled)">
      <em>Your notes here...</em>
    </p>
    <p v-else-if="expanded">{{ value }}</p>
    <p v-else style="color: var(--color-text-disabled)">
      <em>{{ title }} hidden</em>
    </p>
  </div>
</template>

<script>
import BaseButtonIcon from './BaseButtonIcon.vue'
import BaseTextbox from './BaseTextbox.vue'

import Util from '../classes/Util.js'
import { project, misc } from '../store.js'

export default {
  name: 'BaseNotes',
  components: {
    BaseButtonIcon,
    BaseTextbox,
  },
  props: {
    title: {
      type: String,
      default: 'Notes',
    },
    value: {
      type: String,
      default: '',
    },
    expanded: {
      type: Boolean,
      default: true,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      editing: false,
    }
  },
  computed: {
    hasNote() {
      return !!this.value.trim()
    },
    appState() {
      return misc.state
    },
  },
  watch: {
    appState(val) {
      if (val === 'unloading') this.onDone()
    },
  },
  methods: {
    onEdit() {
      this.editing = true
      this.$nextTick(() => this.$refs.textbox.$el.focus()) // wait for textbox to exist
      if (!this.hasNote && !this.expanded) this.$emit('change-expanded', true) // default expanded when note created
    },
    onDone() {
      this.editing = false
    },
    onNoteChange(event) {
      if (this.value !== event) this.$emit('change-note', event)
    },
    onExpandedClick() {
      this.$emit('change-expanded', !this.expanded)
    },
    onPinnedClick() {
      this.$emit('change-pinned', !this.pinned)
    },
  },
}
</script>

<style scoped>
  .container {
    margin-bottom: 1rem;
  }
  p {
    white-space: pre-line;
  }
</style>