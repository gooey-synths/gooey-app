module.exports = {
    packagerConfig: {
        // Copied to resources/definitions and seeded into userData on first
        // launch. It has to be an extraResource rather than part of the app
        // bundle because the user needs a writable copy to drop files into.
        extraResource: ['definitions'],
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
  ]
};