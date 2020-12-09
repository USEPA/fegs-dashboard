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
        hint="Edit"
        @click="onEdit"
      />
      <BaseButtonIcon
        v-if="!editing && expanded"
        icon="chevron-up"
        color="neutral"
        hint="Collapse notes"
        @click="onExpandedClick"
      />
      <BaseButtonIcon
        v-if="!editing && !expanded"
        icon="chevron-down"
        shiftY="0.05em"
        color="neutral"
        hint="Expand notes"
        @click="onExpandedClick"
      />
    </h3>
    <BaseTextbox
      v-if="editing"
      ref="textbox"
      :value="value"
      @change="onNoteChange"
    />
    <p v-else-if="expanded && value.trim()">{{ value }}</p>
    <p v-else-if="!expanded" style="color: var(--color-text-disabled)">
      <em>{{ title }} hidden</em>
    </p>
    <p v-else style="color: var(--color-text-disabled)">
      <em>Your notes here...</em>
    </p>
  </div>
</template>

<script>
import BaseButtonIcon from './BaseButtonIcon.vue'
import BaseTextbox from './BaseTextbox.vue'

import Util from '../classes/Util.js'
import { project } from '../store.js'

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
  methods: {
    onEdit() {
      this.editing = true
      this.$nextTick(() => this.$refs.textbox.$el.focus()) // wait for textbox to exist
    },
    onDone(event) {
      this.editing = false
    },
    onNoteChange(event) {
      this.$emit('change-note', event)
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
    white-space: pre;
  }
</style>