<template>

    <header>
        <div style="padding:1em">
            <div style="display:inline-block">
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

            <div v-if="datasetName" id="datasetName" style="display:inline-block;margin-left:2em">
                {{datasetName}}
            </div>

            <v-btn-toggle style="float:right">
                <v-btn v-for="menu in this.$store.state.allMenus"
                       :key="menu"
                       @click="setSelectedMenu(menu)"
                >{{menu}}</v-btn>
            </v-btn-toggle>
        </div>
    </header>
</template>

<script>
    export default {
        name: "Header.vue",
        props: [
            'datasetName',
            'logoutUrl',
            'viewContentPage',
            "username",
            "selectedMode",
            "selectedMenu"
        ],
        data: () => ({
            userAction(value) {
                this.$store.dispatch(value)
            },
            setSelectedMenu(mode) {
                this.$store.dispatch('setSelectedMenu', mode)
            }
        })
    }
</script>

<style scoped>

</style>