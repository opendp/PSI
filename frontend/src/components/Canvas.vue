<template>
    <div>
        <MenuDataset v-if="selectedMenu === 'dataset'"
                     v-bind:datasets="datasets"
        ></MenuDataset>
        <MenuVariables v-if="selectedMenu === 'variables'"
                       v-bind:variables="variables"
        ></MenuVariables>
        <MenuAnalysis v-if="selectedMenu === 'analysis'"
                      v-bind:analysis="analysis"
        ></MenuAnalysis>
        <MenuRelease v-if="selectedMenu === 'release'"
                     v-bind:release="release"
        ></MenuRelease>
    </div>
</template>

<script>
    import store from '../store';

    import MenuDataset from "./MenuDataset.vue";
    import MenuAnalysis from "./MenuAnalysis.vue";
    import MenuVariables from "./MenuVariables.vue";
    import MenuRelease from "./MenuRelease.vue";

    export default {
        name: 'Canvas',
        props: ['selectedMenu'],
        computed: {
            datasets() {
                if (store.state.workspace)
                    return [store.state.workspace.dataset]
            },
            variables() {
                if (store.state.workspace)
                    return store.state.workspace.dataset.variables
            },
            analysis() {
                if (store.state.workspace)
                    return store.state.workspace.analysis
            },
            release() {
                if (store.state.workspace)
                    return store.state.workspace.release
            }
        },
        components: {
            MenuDataset,
            MenuAnalysis,
            MenuVariables,
            MenuRelease
        }
    }
</script>

<style scoped>
</style>