/**
 * Require Browsersync
 */
var bs = require('browser-sync').create();

/**
 * Run Browsersync with server config
 */
bs.init({
    server: "app",
    files: ["app/css/*.css", "app/js/*.js"],
    plugins: [
        {
            module: "bs-html-injector",
            options: {
                files: ["app/*.html"]
            }
        }
    ]
});