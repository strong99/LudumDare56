// vite.config.js / vite.config.ts
import ViteYaml from '@modyfi/vite-plugin-yaml';

export default {

    base: '/ld56/',
    plugins: [
        ViteYaml(), // you may configure the plugin by passing in an object with the options listed below
    ],
};