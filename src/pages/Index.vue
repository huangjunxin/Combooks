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

        <div class="q-ma-md" v-if="booksPath.length === 0">
          <q-table
            title="Path History"
            :data="pathHistoryData"
            :columns="pathHistoryColumns"
            @row-click="openPath"
            no-data-label="No History"
            :pagination="initPathHistory"
            binary-state-sort />
        </div>

        <div class="q-ma-md" v-if="booksPath.length !== 0">
          <!-- <div>共有 {{bookListData.length}} 条记录</div> -->
          <q-table
            title="PDFs List"
            :data="bookListData"
            :columns="bookListColumns"
            :filter="filter"
            @row-click="openBook"
            no-data-label="Please complete the input and press Enter"
            :loading="isLoading"
          >
            <template v-slot:top-right v-if="booksPath.length !== 0">
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
      bookListData: [],
      bookListColumns: [
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
      pathHistoryData: [],
      pathHistoryColumns: [
        {
          name: 'path',
          label: 'Path',
          field: 'path',
          align: 'left',
          sortable: true
        },
        {
          name: 'time',
          label: 'Time',
          field: 'time',
          sortable: true
        }
      ],
      initPathHistory: {
        sortBy: 'time',
        descending: true
      },
      filter: ''
    }
  },
  mounted () {
    this.pathHistoryData = this.$db.get('pathHistoryDataDB').value()
  },
  methods: {
    // 当路径框提交内容时
    onSubmit () {
      if (this.lastBooksPath === '') {
        this.lastBooksPath = this.booksPath
        this.listingFile(this.booksPath)
        this.addPathHistory()
      } else if (this.lastBooksPath !== this.booksPath) {
        this.lastBooksPath = this.booksPath
        this.listingFile(this.booksPath)
        this.addPathHistory()
      }
    },
    addPathHistory () {
      const pathInfo = {
        path: this.booksPath,
        time: Date.now()
      }
      const getPathInfo = this.$db.get('pathHistoryDataDB')
        .find({ path: this.booksPath })
        .value()
      if (getPathInfo === undefined) {
        this.$db.get('pathHistoryDataDB')
          .insert(pathInfo)
          .write()
      }
    },
    updatePathHistory () {
      this.$db.get('pathHistoryDataDB')
        .find({ path: this.booksPath })
        .assign({
          time: Date.now()
        })
        .value()
    },
    // 当路径框的内容发生变化时
    onChange () {
      this.bookListData = []
      this.lastBooksPath = ''
      // 若路径框的内容为空，则将路径历史从数据库重新取出
      if (this.booksPath === '') {
        this.pathHistoryData = this.$db.get('pathHistoryDataDB').value()
      }
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
              this.bookListData.push(fileInfo)
              // 若当前数据不在数据库中，则写入数据库
              const getFileInfo = this.$db.get('bookListDataDB')
                .find(fileInfo)
                .value()
              if (getFileInfo === undefined) {
                this.$db.get('bookListDataDB')
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
    },
    // 点击某条路径历史记录时，则重新检索，并更新历史记录
    openPath (evt, row) {
      this.booksPath = row.path
      this.onSubmit()
      this.updatePathHistory()
    }
  }
}
</script>
