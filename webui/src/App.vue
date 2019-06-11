<template>
  <div id="app">
      <b-container class="bv-example-row">
          <b-row v-if="loading" class="loader">
              <b-spinner
                      variant="success"
              ></b-spinner>
          </b-row>
          <b-row v-if="!loading">
              <Login v-if="!isLoggedIn" v-on:login="login"></Login>
              <Settings v-if="isLoggedIn" v-bind:settings="settings" v-on:save="save" ></Settings>
          </b-row>
      </b-container>
  </div>
</template>

<script>
import Login from './components/Login.vue'
import Settings from './components/Settings.vue'
import axios from 'axios'

export default {
    name: 'app',
    created() {
        this.loadData();
    },
    components: {
        Login,
        Settings,
    },
    data(){
        return {
            loading:false,
            isLoggedIn:false,
            settings:{},
        }
    },
    methods:{
        ajax(type, data, cb) {
            let self = this;
            self.loading = true;
            axios.post('/api', {
                        type: type,
                        data: data
                    })
                    .then(function (data) {
                        self.isLoggedIn =  data.data.loggedIn;
                        console.log(data.data);
                        cb(data.data);
                        self.loading = false;
                    })
                    .catch(function (error) {
                        console.log(error);
                        self.loading = false;
                    });
        },
        login(logPass) {
            let self = this;
            this.ajax('login', logPass, function(){
                self.loadData();
            });
        },
        loadData() {
            let self = this;
            this.ajax('load-data', {}, function(data){
                if (data.settings) {
                    for (let i in data.settings) {
                        self.$set(self.settings, i, data.settings[i])
                        //console.log(i, data.settings[i]);
                    }
                    //self.settings = data.settings
                }
            });
        },
        save(saveData) {
            let self = this;
            this.ajax('save-data', saveData, function(data){
                self.loadData();
            });
        }

    }

}
</script>

<style>
    .loader{
        margin: 0 auto;
        width: 32px;
        padding-top: 200px;
    }
</style>
