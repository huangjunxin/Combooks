<template>
  <q-page class="">
    <div class="" style="max-width: 900px; margin-left: auto; margin-right: auto">
      <div style="height: 20px">
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
                @input="onChange"
            >
              <!-- <template v-slot:append>
                <q-icon name="booksPath" />
              </template> -->
            </q-input>
          </q-form>
        </div>

        <div style="height: 10px">
        </div>

        <div class="q-ma-md" v-if="booksPath.length !== 0">
          <!-- <div>共有 {{tableData.length}} 条记录</div> -->
          <q-table
            title="PDFs List"
            :data="tableData"
            :columns="tableColumns"
            :filter="filter"
            @row-click="openBook"
            no-data-label="Please complete the input and press Enter"
            :loading="isLoading"
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
      lastBooksPath: '',
      isLoading: false,
      tableData: [],
      tableColumns: [
        {
          name: 'fileName',
          label: 'File Name',
          field: 'fileName',
          align: 'left',
          sortable: true
        },
        {
          name: 'fileSize',
          label: 'File Size',
          field: 'fileSize',
          sortable: true
        }
      ],
      filter: ''
    }
  },

  methods: {
    // 当路径框提交内容时
    onSubmit () {
      if (this.lastBooksPath === '') {
        this.lastBooksPath = this.booksPath
        this.listingFile(this.booksPath)
      } else if (this.lastBooksPath !== this.booksPath) {
        this.lastBooksPath = this.booksPath
        this.listingFile(this.booksPath)
      }
    },
    // 当路径框的内容发生变化时
    onChange () {
      this.tableData = []
      this.lastBooksPath = ''
    },
    // 遍历当前目录下的所有PDF文件
    listingFile (filePath) {
      this.isLoading = true
      const fs = require('fs')
      const path = require('path')
      fs.readdir(filePath, (err, file) => {
        if (err) {
          this.isLoading = false
          return alert(err)
        }
        for (const fileName of file) {
          const stat = fs.statSync(path.join(filePath, fileName))
          if (stat.isFile()) {
            if (path.extname(fileName).toLowerCase() === '.pdf') {
              const fileInfo = {
                filePath: path.join(filePath, fileName),
                fileName: fileName,
                fileSize: stat.size
              }
              this.tableData.push(fileInfo)
              // 若当前数据不在数据库中，则写入数据库
              const getFileInfo = this.$db.get('tableDataDB')
                .find(fileInfo)
                .value()
              if (getFileInfo === undefined) {
                this.$db.get('tableDataDB')
                  .insert(fileInfo)
                  .write()
              }
            }
          } else {
            // 递归遍历子文件夹
            this.listingFile(path.join(filePath, fileName))
          }
        }
        this.isLoading = false
      })
    },
    // 点击表格行以打开电子书
    openBook (evt, row) {
      const { shell } = require('electron')
      const fp = JSON.parse(JSON.stringify(row.filePath))
      shell.openPath(fp)
    }
  }
}
</script>
