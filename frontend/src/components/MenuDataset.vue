<template>
    <multipane style="width:100%;height:100%">
        <div :style="{ width: '25%', maxWidth: '50%' }">
            dataset list
            <div v-for="dataset in datasetList">
                {{dataset.name}}
            </div>
        </div>
        <multipane-resizer></multipane-resizer>
        <div :style="{ width: '25%', maxWidth: '50%' }">
            workspace list
            <div v-for="workspace in workspaceList">
                {{workspace.workspaceId}}
            </div>
        </div>
    </multipane>
</template>

<script>
    import {Multipane, MultipaneResizer} from 'vue-multipane';
    export default {
        name: "MenuDataset",
        props: ['datasetList', 'workspaceList', 'workspace'],
        components: {
            Multipane,
            MultipaneResizer
        }
    }
</script>

<style scoped>

</style>