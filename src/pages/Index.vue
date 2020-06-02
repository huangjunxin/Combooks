<template>
  <q-page class="">
    <div class="" style="max-width: 900px; margin-left: auto; margin-right: auto">
      <div style="height: 50px">
      </div>

      <div class="q-ma-md">
        <div class="q-ma-md">
          <q-form
            @submit="onSubmit"
            class="q-gutter-md"
          >
            <q-input
                v-model="booksPath"
                standard
                placeholder="Please enter the path"
            >
              <!-- <template v-slot:append>
                <q-icon name="booksPath" />
              </template> -->
            </q-input>
          </q-form>
        </div>

        <div style="height: 50px">
        </div>

        <div v-if="booksPath.length !== 0">
          <!-- <div>共有 {{tableData.length}} 条记录</div> -->
          <q-table
            title="PDFs List"
            :data="tableData"
            :filter="filter"
          >
            <template v-slot:top-right>
              <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>
          </q-table>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'PageIndex',

  data () {
    return {
      booksPath: '',
      isLoading: false,
      tableData: [],
      filter: ''
    }
  },

  methods: {
    onSubmit () {
      this.listingFile(this.booksPath)
    },
    listingFile (filePath) {
      this.isLoading = true
      const fs = require('fs')
      const path = require('path')
      fs.readdir(filePath, (err, file) => {
        if (err) {
          this.isLoading = false
          return alert(err)
        }
        this.tableData = []
        for (const fileName of file) {
          const stat = fs.statSync(path.join(filePath, fileName))
          if (stat.isFile()) {
            if (path.extname(fileName).toLowerCase() === '.pdf') {
              this.tableData.push({
                fileName: fileName,
                filesize: stat.size
              })
            }
          }
        }
        this.isLoading = false
      })
    }
  }
}
</script>
