import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.use(VueAxios, axios);

Vue.config.productionTip = false;

let load = async () => {
    await store.dispatch('fetchDatasetList');

    if (store.state.datasetList.length !== 1) return;
    await store.dispatch('fetchWorkspaceList', {datasetId: store.state.datasetList[0].datasetId});

    if (store.state.workspaceList.length === 1) return;
    await store.dispatch('fetchWorkspace', store.state.workspaceList[0].workspaceId)
};

load().then(() => console.log('(page loaded)'));

new Vue({
    router,
    store,
    vuetify,
    render: h => h(App)
}).$mount('#root');
