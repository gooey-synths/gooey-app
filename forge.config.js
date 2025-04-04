module.exports = {
    packagerConfig: {
        ignore: [
          /^\/node_modules/
        ]
      },
  makers: [
    {
      name: '@electron-forge/maker-squirrel', // Windows
      config: {}
    },
    {
      name: '@electron-forge/maker-zip', // Mac
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-deb', // Linux
      config: {}
    }
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "gooey-synths",
          name: "gooey-app"
        },
        prerelease: false,
        draft: false,
        tagPrefix: "v"
      }
    }
  ]
};