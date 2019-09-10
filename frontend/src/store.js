import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

let store = new Vuex.Store({
    state: {
        datasets: [
            {
                name: 'PUMS',
                records: 2000,
                variables: [
                    {
                        name: 'age',
                        metadata: {},
                        metadataDefault: {
                            type: 'numeric',
                            minimum: 0,
                            maximum: 100
                        }
                    },
                    {
                        name: 'educ',
                        metadata: {},
                        metadataDefault: {
                            type: 'numeric',
                            minimum: 0,
                            maximum: 12
                        }
                    },
                    {
                        name: 'sex',
                        metadata: {},
                        metadataDefault: {
                            type: 'categorical',
                            categories: [0, 1]
                        }
                    }
                ]
            }
        ],
        analysis: [
            {
                id: 1,
                name: 'add',
                children: [
                    {dataset: 'PUMS', variable: 'age'},
                    {dataset: 'PUMS', variable: 'educ'}
                ]
            },
            {
                id: 2,
                name: 'mean',
                children: [{id: 1}]
            },
            {
                id: 3,
                name: 'mean',
                children: [
                    {dataset: 'PUMS', variable: 'sex'}
                ]
            }
        ]
    },
    mutations: {
        setVariableMetadata(dataset, variable, value) {
            let candidate = store.state.datasets[dataset].variables
                .find(variableMeta => variableMeta.name === variable);
            if (!candidate) return;
            candidate.metadata = value;
        }
    },
    actions: {
        setVariableMetadata({commit}, value) {
            commit('setVariableMetadata', value)
        }
    }
});

export default store;