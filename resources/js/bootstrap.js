import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute('content');

if (csrfToken) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
}

const refreshExpiredSession = () => {
    if (sessionStorage.getItem('csrf-refreshing')) return;

    sessionStorage.setItem('csrf-refreshing', '1');

    const showCsrfMessage = () => {
        const message = document.createElement('div');
        message.textContent = 'Session expired. Refreshing the page...';
        message.style.cssText = [
            'position:fixed',
            'top:24px',
            'left:50%',
            'z-index:99999',
            'transform:translateX(-50%)',
            'border:1px solid rgba(253,186,116,.45)',
            'border-radius:14px',
            'background:linear-gradient(135deg,#071158,#111b69)',
            'padding:14px 20px',
            'color:#fff',
            'font:600 14px system-ui,sans-serif',
            'box-shadow:0 18px 45px rgba(2,6,47,.45)',
        ].join(';');
        document.body.appendChild(message);
        window.setTimeout(() => window.location.reload(), 800);
    };

    if (document.body) {
        showCsrfMessage();
    } else {
        document.addEventListener('DOMContentLoaded', showCsrfMessage, {
            once: true,
        });
    }
};

window.axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if ([401, 419].includes(error.response?.status)) {
            refreshExpiredSession();
        }

        return Promise.reject(error);
    },
);

window.addEventListener('load', () => {
    sessionStorage.removeItem('csrf-refreshing');
});


/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allow your team to quickly build robust real-time web applications.
 */

import './echo';
