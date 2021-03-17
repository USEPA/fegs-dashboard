<template>
  <div id="app">
    <div id="prelude">
      <h1>FEGS Scoping Tool</h1>
      <p>The FEGS Scoping Tool informs the early stage of decision making, when decision makers are aware of a decision that needs to be made, but before any actions are taken. The tool helps users identify and prioritize stakeholders, beneficiaries, and environmental attributes through a structured, transparent, and repeatable process. These relevant and meaningful environmental attributes can then be used to evaluate decision alternatives.</p>
    </div>
    <div id="actionbar">
      <BaseButton
        color="primary"
        @click="prepareAction('new')"
      >
        New
      </BaseButton>
      <BaseButton
        style="margin-left: .5rem;"
        color="primary"
        @click="prepareAction('open')"
      >
        Open
      </BaseButton>
      <div style="display: flex; flex-grow: 1; justify-content: flex-end;">
        <BaseButton
          color="primary"
          @click="prepareAction('save')"
        >
          Save{{ modified ? '*' : '' }}
          <FontAwesomeIcon
            style="margin-left: .3em;"
            icon="download"
          />
        </BaseButton>
      </div>
    </div>
    <BaseModal
      v-if="showUnsaveWarning"
      title="Discard unsaved changes?"
      @close="cancelAction"
    >
      <div style="width: 20rem;">
        All changes to the current project will be lost if you continue. {{ targetAction === 'new' ? 'Create a new' : 'Open a different' }} project anyway?
      </div>
      <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end;">
        <BaseButton style="margin-right: .5rem;" @click="performAction">Yes</BaseButton>
        <BaseButton @click="cancelAction">Cancel</BaseButton>
      </div>
    </BaseModal>
    <input
      ref="infile"
      style="display: none;"
      type="file"
      accept=".fegs"
      aria-label="select project to open"
      @change="onFileSelect"
    />
    <a
      ref="outfile"
      style="display: none;"
    ></a>
    <TheProject/>
  </div>
</template>

<script>
// TODO rem won't work in Drupal, find another way

import BaseButton from './components/BaseButton.vue'
import BaseModal from './components/BaseModal.vue'
import TheProject from './components/TheProject.vue'

import Util from './classes/Util.js'
import { project, misc } from './store.js'

export default {
  name: 'AppWebsite',
  components: {
    BaseButton,
    BaseModal,
    TheProject,
  },
  data() {
    return {
      targetAction: null, // 'new', 'open', 'save'
      showUnsaveWarning: false,
    }
  },
  computed: {
    title() {
      if (project.data.meta) {
        const name = project.data.meta.name
        const save = (project.modified) ? '*' : ''
        return `${name}${save} - ${misc.appTitle}`
      } else {
        return misc.appTitle
      }
    },
    modified() {
      return project.modified
    }
  },
  watch: {
    title: 'setDocumentTitle'
  },
  created() {
    this.setDocumentTitle()
    window.addEventListener('beforeunload', event => {
      if (project.modified) {
        event.preventDefault() // standard
        event.returnValue = '' // chrome requires return value
      }
    })
  },
  methods: {
    setDocumentTitle() {
      document.title = this.title
    },
    prepareAction(action) {
      if (misc.state === 'unloading') return // ignore repeat input until handled
      misc.state = 'unloading'
      document.activeElement.blur() // trigger saving of in-edit fields
      window.setTimeout(() => {
        misc.state = null
        this.targetAction = action
        if (project.modified && action !== 'save') {
          this.showUnsaveWarning = true
        } else {
          this.performAction()
        }
      }, 200) // allow time for client to save in-edit fields
      
    },
    performAction() {
      this.showUnsaveWarning = false
      switch (this.targetAction) {
        case 'new':
          misc.state = 'loading'
          project.new()
          window.location.href = '#project-section'
          break
        case 'open':
          this.$refs.infile.click() // trigger file selection window
          break
        case 'save':
          const data = project.getSaveable()
          const filename = `${project.data.meta.name}.fegs`
          this.saveFile(data, filename)
          project.modified = false // assume user actually saved and didn't cancel... no way to know
          break
        default:
          this.targetAction = null
          throw Error(`Unsupported action "${action}"`) // programmer error
      }
      this.targetAction = null
    },
    cancelAction() {
      this.showUnsaveWarning = false
      this.targetAction = null
    },
    saveFile(data, filename) {
      const a = this.$refs.outfile
      const dataString = JSON.stringify(data)
      const file = new Blob([dataString], { type: 'text/plain' })
      a.href = URL.createObjectURL(file)
      a.download = filename
      a.click()
    },
    async onFileSelect(event) {
      if (event.target.files.length > 0) {
        const file = event.target.files[0]
        try {
          misc.state = 'loading'
          const data = await this.readFile(file)
          project.load(data)
          window.location.href = '#project-section'
        } catch (error) {
          console.error(`Failed to load project. ${error.message}`) // TODO: handle elegantly?
        }
      }
    },
    async readFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = reject
        reader.onload = () => {
          resolve(JSON.parse(reader.result))
        }
        reader.readAsText(file)
      })
    },
  },
}
</script>

<style>
@import './styles/style.css';

#app {
  background-color: var(--color-main);
}
#prelude {
  padding: 1rem;
  background-color: var(--color-prelude);
}
#prelude h1 {
  margin-top: 0;
}
#actionbar {
  width: auto;
  height: var(--length-actionbar-height);
  padding: .5rem;
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-flow: row;
  background-color: var(--color-actionbar);
}
html {
  scroll-padding-top: calc(var(--length-actionbar-height) + 1rem - 2px);
}
/* *, *::after, *::before {
	-webkit-user-select: none;
	-webkit-user-drag: none;
	-webkit-app-region: no-drag;
	cursor: default;
} */
</style>
