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
              <template v-slot:append v-if="booksPath.length !== 0">
                <q-icon name="close" @click="booksPath = ''" class="cursor-pointer" />
              </template>
            </q-input>
          </q-form>
        </div>

        <div style="height: 10px">
        </div>

        <div class="q-ma-md" v-if="booksPath.length === 0">
          <!-- <q-table
            title="Path History"
            :data="pathHistoryData"
            :columns="pathHistoryColumns"
            @row-click="openPath"
            no-data-label="No History"
            :pagination="initPathHistory"
            binary-state-sort /> -->

          <vxe-table
            border
            highlight-hover-row
            highlight-hover-column
            :data="pathHistoryData"
            @cell-click="openPath"
            row-id="id"
            height="400px"
            :sort-config="{trigger: 'cell', defaultSort: {field: 'time', order: 'desc'}, orders: ['desc', 'asc']}">
            <vxe-table-column field="path" title="Path"></vxe-table-column>
            <vxe-table-column field="time" title="Time" width="170" sortable></vxe-table-column>
          </vxe-table>
        </div>

        <div class="q-ma-md" v-show="booksPath.length !== 0">
          <!-- <div>共有 {{bookListData.length}} 条记录</div> -->
          <!-- <q-table
            title="PDFs List"
            :data="bookListData"
            :columns="bookListColumns"
            :filter="filter"
            @row-click="openBook"
            :no-data-label="bookListNoDataInfo"
            :loading="isLoading"
          >
            <template v-slot:top-right v-show="booksPath.length !== 0">
              <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>
          </q-table> -->

          <vxe-table
            border
            show-overflow
            highlight-hover-row
            highlight-hover-column
            :data="bookListData"
            @cell-click="openBook"
            row-id="id"
            height="400px"
            :loading="isLoading"
            :sort-config="{trigger: 'cell', defaultSort: {field: 'fileName', order: 'desc'}, orders: ['desc', 'asc']}">
            <vxe-table-column field="fileName" title="File Name" sortable></vxe-table-column>
            <vxe-table-column field="fileSize" title="File Size" :formatter="formatFileSize" :sort-method="sortFileSize" width="100" sortable></vxe-table-column>
            <template v-slot:empty>
                <p>{{bookListNoDataInfo}}</p>
            </template>
          </vxe-table>
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
      // bookListColumns: [
      //   {
      //     name: 'fileName',
      //     label: 'File Name',
      //     field: 'fileName',
      //     align: 'left',
      //     sortable: true
      //   },
      //   {
      //     name: 'fileSize',
      //     label: 'File Size',
      //     field: 'fileSize',
      //     sortable: true
      //   }
      // ],
      bookListNoDataInfo: 'Please complete the input and press Enter',
      pathHistoryData: [],
      // pathHistoryColumns: [
      //   {
      //     name: 'path',
      //     label: 'Path',
      //     field: 'path',
      //     align: 'left',
      //     sortable: true
      //   },
      //   {
      //     name: 'time',
      //     label: 'Time',
      //     field: 'time',
      //     sortable: true
      //   }
      // ],
      initPathHistory: {
        sortBy: 'time',
        descending: true
      },
      filter: ''
    }
  },
  mounted () {
    console.info('[mounted]')
    this.pathHistoryData = this.$db.get('pathHistoryDataDB').value()
    // this.pathHistoryData = window.MOCK_DATA_LIST.slice(0, 50)
    // 仅调试时启用
    window.vue = this
  },
  methods: {
    // 当路径框提交内容时
    onSubmit () {
      if (this.booksPath.length > 0 && (this.lastBooksPath === '' || this.lastBooksPath !== this.booksPath)) {
        this.lastBooksPath = this.booksPath
        this.listingFile(this.booksPath)
        this.addPathHistory()
      }
    },
    // 增加一条历史路径记录
    addPathHistory () {
      console.info('[methods][addPathHistory]')
      const moment = require('moment')
      const path = require('path')
      const pathInfo = {
        path: path.resolve(this.booksPath),
        time: moment().format('YYYY-MM-DD HH:mm:ss')
      }
      const getPathInfo = this.$db.get('pathHistoryDataDB')
        .find({ path: pathInfo.path })
        .value()
      if (getPathInfo === undefined) {
        this.$db.get('pathHistoryDataDB')
          .insert(pathInfo)
          .write()
      } else {
        this.updatePathHistory()
      }
    },
    // 当点击某条历史路径记录时，更新其时间
    updatePathHistory () {
      console.info('[methods][updatePathHistory]')
      const moment = require('moment')
      const path = require('path')
      const resolveBooksPath = path.resolve(this.booksPath)
      this.$db.get('pathHistoryDataDB')
        .find({ path: resolveBooksPath })
        .assign({
          time: moment().format('YYYY-MM-DD HH:mm:ss')
        })
        .write()
    },
    // 当路径框的内容发生变化时
    onChange () {
      console.info('[methods][onChange]')
      this.bookListData = []
      this.lastBooksPath = ''
      this.bookListNoDataInfo = 'Please complete the input and press Enter'
      // 若路径框的内容为空，则将路径历史从数据库重新取出
      if (this.booksPath === '') {
        this.pathHistoryData = this.$db.get('pathHistoryDataDB').value()
      }
    },
    // 转换为可读文件大小
    formatFileSize ({ cellValue: size }) {
      // console.info('[methods][formatFileSize]')
      var i = Math.floor(Math.log(size) / Math.log(1024))
      return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i]
    },
    // 文件大小排序
    sortFileSize (a, b) {
      // console.info('[methods][sortFileSize]')
      return a.fileSize < b.fileSize ? -1 : a.fileSize > b.fileSize ? 1 : 0
    },
    // 遍历当前目录下的所有PDF文件
    listingFile (filePath) {
      console.info('[methods][listingFile]')
      // 空路径不进行搜索
      if (filePath === '') {
        return
      }
      this.isLoading = true
      const fs = require('fs')
      const path = require('path')
      fs.readdir(filePath, (err, file) => {
        if (err) {
          this.isLoading = false
          this.bookListNoDataInfo = 'No such file or directory'
        } else {
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
            if (this.bookListData.length === 0) {
              this.bookListNoDataInfo = 'No PDF found'
            }
          }
        }
        this.isLoading = false
      })
    },
    // 点击书名以打开电子书
    openBook ({ column, row }) {
      console.info('[methods][openBook]')
      // 判断是否为点击File Name列的单元格
      if (column.property === 'fileName') {
        const { shell } = require('electron')
        const fp = JSON.parse(JSON.stringify(row.filePath))
        shell.openPath(fp)
      }
    },
    // 当点击某条历史路径记录时，重新检索，并更新历史记录
    openPath ({ column, row }) {
      console.info('[methods][openPath]')
      // 判断是否为点击path列的单元格
      if (column.property === 'path') {
        console.info('[methods][openPath]: column.property === \'path\'')
        this.booksPath = row.path
        this.bookListData = []
        this.listingFile(row.path)
        this.updatePathHistory()
      } else {
        console.info('[methods][openPath]: else')
      }
    }
  }
}
</script>
