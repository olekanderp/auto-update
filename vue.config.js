const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                publish: ['github'],
                win: {
                    icon: "public/icon.png"
                },
                icon: "public/icon.png",
                appId: "synergy.app",
                productName: "Synergy",
            }

        },
    }
})
