<template>
    <multipane style="width:100%;height:100%">
        <div :style="{ width: '400px'}">
            variables list
            <div v-if="variables" v-for="(variable, i) in variables"
                 :key="i">
                {{variable.name}}
            </div>
        </div>
        <multipane-resizer></multipane-resizer>
        <div :style="{ width: '25%', maxWidth: '50%' }">
            variable editing
<!--            TODO: variable editing -->
        </div>
    </multipane>
</template>

<script>
    import {Multipane, MultipaneResizer} from 'vue-multipane';
    export default {
        name: "MenuVariables",
        props: ['variables'],
        components: {
            Multipane,
            MultipaneResizer
        }
    }
</script>

<style scoped>

</style>