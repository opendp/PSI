<template>

    <header>
        <table style="width:100%">
            <tr>
                <td>
                    <div class="text-center">
                        <v-menu offset-y>
                            <template v-slot:activator="{ on }">
                                <v-btn v-on="on">
                                    {{username}}
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-item v-for="(item, index) in [{name: 'logout', action: 'logout'}]"
                                             :key="index"
                                             @click="userAction(item.action)">
                                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </div>
                </td>
            </tr>
            <tr>
                <td style="width:5%">
                </td>
                <td style='width:60%'>
                    <div title="This is the name, in Dataverse, of the selected example dataset." id="datasetName"
                         style="text-align:left;">
                        <h2 style="display:inline;">{{mode}}</h2>
                    </div>
                    <div id="datasetSmallName" style="text-align:left;">
                    </div>
                    <div id="datasetHelp" style="text-align:left;">
                    </div>

                </td>


                <td style=''>
                    <h4 title="These are adjustable parameters that define the level of privacy protection guaranteed by the differentially private released statistics."
                        style="display: inline-block; padding-right:5px;"> Privacy Loss Parameters</h4>
                    <button id="edit_button" class="btn btn-default" style='color:#108db7;'
                            onclick="edit_parameters_window()">Edit Parameters
                    </button>
                    <button type="button" class="manualinfo" :data-load-url="viewContentPage" data-toggle="modal"
                            data-target="#myModal" data-id="parameters"><span
                            class="glyphicon glyphicon-question-sign"></span></button>


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
                </td>
            </tr>
        </table>
    </header>
</template>

<script>
    export default {
        name: "Header.vue",
        props: ['logoutUrl', 'viewContentPage', "username", "mode"],
        data: () => ({
            userAction(value) {
                this.$store.dispatch(value)
            }
        })
    }
</script>

<style scoped>

</style>