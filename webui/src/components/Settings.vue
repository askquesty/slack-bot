<template>
  <div class="settings-form">
    <h2>Settings</h2>

    <b-form>
      <b-form-group label="Text after installation:" label-for="input-install-thank-you-message" >
        <b-form-textarea
                id="input-install-thank-you-message"
                v-model="form['install-thank-you-message']"
                placeholder="Enter text"
        ></b-form-textarea>
      </b-form-group>

      <b-form-group label="Text after question:" label-for="input-thank-you-for-question-message" >
        <b-form-textarea
                id="input-thank-you-for-question-message"
                v-model="form['thank-you-for-question-message']"
                placeholder="Enter text"
        ></b-form-textarea>
      </b-form-group>

      <b-form-group label="Text after question timeout (sec):" label-for="input-thank-you-for-question-timeout" >
        <b-form-input
                id="input-thank-you-for-question-timeout"
                v-model="form['thank-you-for-question-timeout']"
                type="number"
                placeholder="sec"
        ></b-form-input>
      </b-form-group>

      <b-form-group label="Text after closing the ticket:" label-for="input-thank-you-for-question-message-final" >
        <b-form-textarea
                id="input-thank-you-for-question-message-final"
                v-model="form['thank-you-for-question-message-final']"
                placeholder="Enter text"
        ></b-form-textarea>
      </b-form-group>
    </b-form>

    <b-form inline>
      <b-form-checkbox class="mb-2 mr-sm-2 mb-sm-0" v-model="isEditCredentials">Edit Credentials</b-form-checkbox>

      <div v-if="isEditCredentials">
        <label class="sr-only" for="inline-form-login">Login</label>
        <b-input id="inline-form-login" class="mb-2 mr-sm-2 mb-sm-0" placeholder="Login" v-model="form['admin-login']"></b-input>

        <label class="sr-only" for="inline-form-password">Password</label>
        <b-input id="inline-form-password" class="mb-2 mr-sm-2 mb-sm-0" placeholder="Password" v-model="form['admin-pass']"></b-input>
      </div>
    </b-form>

    <hr />

    <b-button type="button" v-on:click="onSubmit" variant="primary">Save</b-button>
  </div>
</template>

<script>
export default {
  name: 'Settings',
  props: ['settings'],
  data() {
    return {
      isEditCredentials: false,
      form: this.settings
    }
  },
  methods:{
    onSubmit(){
      this.$emit('save', {
        newData:this.form,
        isEditCredentials:this.isEditCredentials
      })
    }
  }
}
</script>

<style>
  .settings-form {
    width: 700px;
    margin: 0 auto;
  }
</style>