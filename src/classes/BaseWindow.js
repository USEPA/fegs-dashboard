// all BrowserWindow wrappers should have the following structure
export default class BaseWindow {
  constructor({ width=800, height=600 }) {
    this.width = width
    this.height = height
    this.ref = null
  }
  exists() {
    return (this.ref !== null)
  }
  close() {
    if (this.ref) this.ref.close()
  }
  create() { 
    // this.ref = new BrowserWindow()
    // OVERRIDE
  }
}