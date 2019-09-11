import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        workspaceList: [],
        workspace: undefined,

        allMenus: ['dataset', 'variables', 'analysis', 'release'],
        selectedMenu: 'dataset'
    },
    mutations: {
        SET_VARIABLE_METADATA(state, {variable, value}) {
            let candidate = state.workspace.dataset.variables
                .find(variableMeta => variableMeta.name === variable);
            if (!candidate) return;
            candidate.metadata = value;
        },
        LOGOUT() {
            // TODO: call logout url
            console.log('Logging out');
        },
        SET_WORKSPACE(state, workspace) {
            state.workspace = workspace;
        },
        SET_WORKSPACE_LIST(state, workspaceList) {
            state.workspaceList = workspaceList;
        },
        SET_SELECTED_MENU(state, menu) {
            state.selectedMenu = menu;
        }
    },
    actions: {
        setVariableMetadata({commit}, value) {
            commit('SET_VARIABLE_METADATA', value)
        },

        logout({commit}) {
            commit('LOGOUT')
        },

        fetchWorkspaceList({commit}, specifications) {
            return Vue.axios.post('listWorkspaces', specifications)
                .then(response => {
                    if (response.status !== 200) {
                        console.log(response.config.url, " request failed with status ", response.status);
                        console.log(response);
                        return;
                    }
                    if (response.data.success)
                        commit('SET_WORKSPACE_LIST', response.data.data);
                    else console.log(response.data.message)
                })
        },

        fetchWorkspace({commit}, workspaceId) {
            return Vue.axios.post('getWorkspace', {workspaceId})
                .then(response => {
                    if (response.status !== 200) {
                        console.log(response.config.url, " request failed with status ", response.status);
                        console.log(response);
                        return;
                    }
                    if (response.data.success)
                        commit('SET_WORKSPACE', response.data.data);
                    else console.log(response.data.message)
                })
        },

        setSelectedMenu({commit}, menu) {
            commit('SET_SELECTED_MENU', menu)
        }
    }
});
