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

    if (store.state.workspaceList.length !== 1) return;
    await store.dispatch('fetchWorkspace', store.state.workspaceList[0].workspaceId)
};

load().then(() => console.log('(page loaded)'));

let onMessage = e => {
    let msg_data = JSON.parse(e.data).message;

    if (msg_data.msg_type === 'EDIT_VARIABLE')
        store.commit('EDIT_VARIABLE', msg_data.data);

    if (msg_data.msg_type === 'ADD_COMPONENT')
        store.commit('ADD_COMPONENT', msg_data.data);

    if (msg_data.msg_type === 'EDIT_COMPONENT')
        store.commit('EDIT_COMPONENT', msg_data.data);

    if (msg_data.msg_type === 'REMOVE_COMPONENT')
        store.commit('REMOVE_COMPONENT', msg_data.data);
};

// export let wsLink = WEBSOCKET_PREFIX + window.location.host +
//     '/ws/connect/' + username + '/';
// export let streamSocket = new WebSocket(wsLink);
// streamSocket.onmessage = onMessage;


new Vue({
    router,
    store,
    vuetify,
    render: h => h(App)
}).$mount('#root');
