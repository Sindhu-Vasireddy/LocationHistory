
import {toLogin} from './UI/Frontend.js';
import {handleRedirectAfterLogin} from './login/LoginUsingWebID';

const map= L.map('map');
const marker=L.marker([0, 0]);

toLogin();
handleRedirectAfterLogin(map, marker);
