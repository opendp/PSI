<template>
    <div>
        <div v-for="(dataset, i) in datasets"
             :key="i">
            {{dataset.name}}
            <div v-for="(variable, j) in dataset.variables"
                 :key="j">
                {{variable.name}}
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "PanelDatasets",
        props: ['datasets']
    }
</script>

<style scoped>

</style>