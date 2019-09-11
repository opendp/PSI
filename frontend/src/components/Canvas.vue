<template>
    <multipane style="width:100%;height:100%">
        <div :style="{ width: '400px'}">
            <PanelDatasets
                    v-bind:variables="variables"
            />
        </div>
        <multipane-resizer></multipane-resizer>
        <div :style="{ width: '25%', maxWidth: '50%' }">
            <PanelStatistics
                    v-bind:analysis="analysis"
            />
        </div>
        <multipane-resizer></multipane-resizer>
        <div :style="{ flexGrow: 1 }">
            <PanelSummary
                    v-bind:analysis="analysis"
            />
        </div>
    </multipane>
</template>

<script>
    import store from '../store';

    import {Multipane, MultipaneResizer} from 'vue-multipane';

    import PanelDatasets from './PanelVariables.vue';
    import PanelStatistics from './PanelStatistics.vue';
    import PanelSummary from './PanelSummary.vue';

    export default {
        name: 'Canvas',
        computed: {
            variables() {
                if (store.state.workspace)
                    return store.state.workspace.dataset.variables
            },
            analysis() {
                if (store.state.workspace)
                    return store.state.workspace.analysis
            }
        },
        components: {
            Multipane,
            MultipaneResizer,

            PanelDatasets,
            PanelStatistics,
            PanelSummary
        }
    }
</script>

<style scoped>
</style>