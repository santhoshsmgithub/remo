module.exports = ({ env }) => ({
  // ...
  'config-sync': {
    enabled: true,
    config: {
      syncDir: "config/sync/",
      minify: false,
      importOnBootstrap: false,
      customTypes: [
      ],
      excludedTypes: [],
      excludedConfig: [
        "core-store.plugin_users-permissions_grant"
      ],
	sizeLimit: 20 * 1024 * 1024 // 20mb in bytes
    },
  },
   'upload': {
    config: {
          sizeLimit: 10 * 1024 * 1024  // 10mb
      },
    },
});
