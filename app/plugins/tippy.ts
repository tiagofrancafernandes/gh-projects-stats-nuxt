import { defineNuxtPlugin } from '#app';
import VueTippy from 'vue-tippy';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/shift-away.css';

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(VueTippy, {
        defaultProps: {
            placement: 'top',
            animation: 'shift-away',
            delay: [200, 0],
            theme: 'custom',
        },
    });
});
