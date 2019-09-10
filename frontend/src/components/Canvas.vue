<template>
    <multipane style="width:100%;height:100%">
        <div :style="{ width: '400px'}">
            <PanelDatasets
                    v-bind:datasets="datasets"
            />
        </div>
        <multipane-resizer></multipane-resizer>
        <div :style="{ width: '25%', maxWidth: '50%' }">
            <PanelStatistics
                    v-bind:statistics="statistics"
            />
        </div>
        <multipane-resizer></multipane-resizer>
        <div :style="{ flexGrow: 1 }">
            <PanelSummary
                    v-bind:statistics="statistics"
            />
        </div>
    </multipane>
</template>

<script>
    import store from '../store';

    import {Multipane, MultipaneResizer} from 'vue-multipane';

    import PanelDatasets from './PanelDatasets.vue';
    import PanelStatistics from './PanelStatistics.vue';
    import PanelSummary from './PanelSummary.vue';

    export default {
        name: 'Canvas',
        computed: {
            datasets() {
                return store.state.datasets
            },
            statistics() {
                return store.state.analysis
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