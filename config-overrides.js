const path = require('path');

module.exports = function override(config, env) {
  // Fix the core-js-pure missing actual directory issue
  const webpack = require('webpack');
  
  // Add webpack plugin to resolve the missing actual directory
  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /core-js-pure\/actual\/global-this/,
      require.resolve('core-js/actual/global-this')
    )
  );

  // Resolve core-js module issues
  config.resolve.alias = {
    ...config.resolve.alias,
    // Map the problematic import to the correct file
    'core-js-pure/actual/global-this': require.resolve('core-js/actual/global-this'),
  };

  // Ignore core-js warnings and source map issues
  config.ignoreWarnings = [
    /Failed to parse source map/,
    /core-js/,
    /global-this/
  ];

  return config;
};