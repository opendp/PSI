<template>
    <multipane style="width:100%;height:100%">
        <div :style="{ width: '400px'}">
            components list
            <div v-if="analysis" v-for="(statistic, i) in analysis"
                 :key="i">
                {{statistic.name}}
            </div>
        </div>
        <multipane-resizer></multipane-resizer>
        <div :style="{ width: '25%', maxWidth: '50%' }">
            <div>
                <h4 title="These are adjustable parameters that define the level of privacy protection guaranteed by the differentially private released statistics."
                    style="display: inline-block; padding-right:5px;"> Privacy Loss Parameters</h4>

                <div id='display_parameters'>
                    <table align="center">
                        <tr>
                            <td style="text-align:right; padding-right: 15px;">
                                Epsilon (&epsilon;):
                            </td>
                            <td id="epsilonDisplay" style="text-align:left;">
                                0.5000
                            </td>
                        </tr>
                        <tr>
                            <td style="text-align:right; padding-right: 15px;">
                                Delta (&delta;):
                            </td>
                            <td id="deltaDisplay" style="text-align:left;">
                                1&times;10<sup>-6</sup>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>

            <v-data-table v-if="analysis" :headers="['name', 'epsilon', 'accuracy']"
                          :items="analysis.map((elem, i) => ({name: elem, epsilon: i, accuracy: i}))">
            </v-data-table>
        </div>
    </multipane>
</template>

<script>
    import {Multipane, MultipaneResizer} from 'vue-multipane';
    export default {
        name: "MenuAnalysis",
        props: ['analysis'],
        components: {
            Multipane,
            MultipaneResizer
        }
    }
</script>

<style scoped>

</style>