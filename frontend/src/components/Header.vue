<template>

    <header>
        <table style="width:100%">
            <tr>
                <td>
                    <div class="dropdown">
                        <button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">{{username}}
                            <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a :href="logoutUrl">Logout</a></li>
                        </ul>
                    </div>
                </td>
            </tr>
            <tr>
                <td style="width:5%">
                </td>
                <td style='width:60%'>
                    <div title="This is the name, in Dataverse, of the selected example dataset." id="datasetName"
                         style="text-align:left;">
                        <h2 style="display:inline;">Dataset Name</h2>
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
                            data-target="#myModal" data-id="parameters"><span class="glyphicon glyphicon-question-sign"></span></button>


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
    // let qmark_color = "#090533"; //old value: #FA8072
    // let qmark_size = "15px"; // old value: 12px
    // export default Vue.component('header', {
    //     props: ['logoutUrl', 'viewContentPage']
    // })
    export default {
        name: "Header.vue",
        props: ['logoutUrl', 'viewContentPage', "username"]
    }
</script>

<style scoped>

</style>