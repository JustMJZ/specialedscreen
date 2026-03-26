const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Excalidraw's ESM dist imports roughjs sub-paths without file extensions
      // (e.g. 'roughjs/bin/rough'). Webpack 5 strict ESM rejects extensionless
      // imports, so we alias each path directly to the real file.
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'roughjs/bin/rough': path.resolve(__dirname, 'node_modules/roughjs/bin/rough.js'),
        'roughjs/bin/generator': path.resolve(__dirname, 'node_modules/roughjs/bin/generator.js'),
        'roughjs/bin/math': path.resolve(__dirname, 'node_modules/roughjs/bin/math.js'),
      };
      return webpackConfig;
    },
  },
};
