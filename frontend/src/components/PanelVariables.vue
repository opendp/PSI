<template>
    <div>
        <div v-if="variables" v-for="(variable, i) in variables"
             :key="i">
            {{variable.name}}
        </div>
    </div>
</template>

<script>
    export default {
        name: "PanelDatasets",
        props: ['variables']
    }
</script>

<style scoped>

</style>