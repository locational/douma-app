<template>
  <controls>
    <md-button slot="primary_action" class="md-icon-button md-raised md-primary" :disabled="!$can('read', 'irs_monitor') || $loading.isLoading('irs_monitor/load_responses')" @click.native='load_data'>
      <md-icon>refresh</md-icon>
    </md-button>

    <template slot="menu_items">
      <md-menu-item :disabled="!$can('read', 'irs_monitor') || $loading.isLoading('irs_monitor/load_all_plans')" @click="load_all_plans">
        <md-icon>file_download</md-icon>
        <span>Load all plans</span>
      </md-menu-item>

      <md-menu-item :disabled="!$can('read', 'irs_monitor') || $loading.isLoading('irs_monitor/load_responses')" @click="load_responses">
        <md-icon>file_download</md-icon>
        <span>Retrieve responses</span>
      </md-menu-item>

      <md-menu-item :disabled="!$can('read', 'irs_monitor') || $loading.isLoading('irs_monitor/refresh_data') || !responses.length" @click="force_load_responses">
        <md-icon>file_download</md-icon>
        <span>Re-retrieve all responses</span>
      </md-menu-item>

      <md-menu-item :disabled="!$can('read', 'irs_monitor') || $loading.isLoading('irs_monitor/refresh_data') || !responses.length" @click="download_responses">
        <md-icon>file_download</md-icon>
        <span>Download responses</span>
      </md-menu-item>

    </template>

    <div slot="text">
      <span v-if="$loading.anyLoading">Loading...</span>
      <template v-else>
        <span v-if="plan">[Plan loaded] </span>
        <span v-if="filters.length">
          {{filters.length}} filters active, {{responses.length}} filtered records showing
        </span>
        <span v-else>
          {{responses.length}} records
          Last updated: {{responses_last_updated_at}}
        </span>
      </template>
    </div>
  </controls>

</template>

<script>
  import {mapState, mapGetters} from 'vuex'
  import moment from 'moment-mini'
  import download from 'downloadjs'

  import controls from 'components/controls.vue'
  import {flatten_json_to_csv} from 'lib/helpers/csv-export'

  export default {
    name: 'dashboard-summary',
    components: {controls},
    props: ['responses', 'filters', 'plan'],
    mounted() {
    },
    data() {
      return {}
    },
    computed: {
      ...mapState({
        instance_config: state => state.instance_config,
        responses_last_updated_at: state => {
          if (state.irs_monitor.responses_last_updated_at) {
            return moment(state.irs_monitor.responses_last_updated_at).format("dddd, MMMM Do YYYY, h:mm:ss a")
          } else {
            return "not yet updated"
          }
        }
      }),
      ...mapGetters({
        isLoading: 'loading/isLoading'
      })
    },
    methods: {
      load_data() {
        this.load_responses()
        this.load_plan()
      },
      load_responses() {
        this.$emit('load_responses')
      },
      force_load_responses() {
        this.$emit('force_load_responses')
      },
      load_plan() {
        this.$emit('load_plan')
      },
      load_all_plans() {
        this.$emit('load_all_plans')
      },
      download_responses() {
        if(!this.responses.length) return

        const content = flatten_json_to_csv(this.responses)

        const date = moment().format('YYYY-MM-DD_HHmm')
        download(content, `${this.instance_config.instance.slug}_responses_${date}.csv`)
        this.$ga.event('irs_monitor','click_download_responses')
      }
    }
  }
</script>

<style scoped>
</style>
