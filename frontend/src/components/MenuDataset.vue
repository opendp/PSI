<template>
    <multipane style="width:100%;height:100%">
        <div :style="{ width: '25%', maxWidth: '50%' }">
            dataset list
            <div v-for="dataset in datasets">
                {{dataset.name}}
            </div>
        </div>
        <multipane-resizer></multipane-resizer>
        <div :style="{ width: '25%', maxWidth: '50%' }">
            workspace list
        </div>
    </multipane>
</template>

<script>
    import {Multipane, MultipaneResizer} from 'vue-multipane';
    export default {
        name: "MenuDataset",
        props: ['datasets', 'selectedDataset'],
        components: {
            Multipane,
            MultipaneResizer
        }
    }
</script>

<style scoped>

</style>