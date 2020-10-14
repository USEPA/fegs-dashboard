module.exports = {
  devServer: {
    host: 'localhost', // hosts to network otherwise...?
    progress: false, // comes out busted on git bash for windows
    stats: 'errors-warnings' // only the important stuff
  },
  configureWebpack: {
    // entry: './src/background.js'
  },
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      outputDir: 'dist_electron',
      builderOptions: {
        appId: 'FEGS-Scoping-Tool',
        productName: 'FEGS Scoping Tool',
        directories: {
          buildResources: 'src/build/'
        },
        nsis: {
          oneClick: true
        },
        fileAssociations: [
          {
            ext: ['fegs'],
            name: 'FEGS',
            description: 'FEGS file extension',
            role: 'Editor'
          }
        ]
      },
    }
  }
}