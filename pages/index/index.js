Page({
  data: {
    lb: [],
    qx: false,
    theme: '',
    dhltitle: '默认标题',
    options: ['全部', '待提交', '签发中', '已签发', '签发失败', '已吊销', '已过期'],
    zt: '全部',
    value: 0
  },
  sx(e) {
    var t = e.detail.value
    if (t == '0') {
      this.setData({
        zt: '全部'
      })
      this.onShow()
    } else {
      this.setData({
        zt: String(Number(t) - 1)
      })
      this.onShow()
    }
  },
  onShow() {
    var that = this
    that.setData({
      lb: [],
      qx: false,
      theme: wx.getAppBaseInfo().theme,
      dhltitle: '默认标题'
    })
    if (wx.getStorageSync('user').zt == true) {
      that.setData({
        qx: true,
        dhltitle: '申请管理'
      })
      var app = getApp()
      if (app.globalData.network == 'none') {
        wx.showToast({
          title: '无网络',
          icon: 'error'
        })
        return
      }
      wx.showLoading({
        title: '获取数据中',
        mask: true
      })
      wx.request({
        url: 'https://api.dqmybkj.com/sslgetsqlb',
        method: 'POST',
        data: {
          email: wx.getStorageSync('user').email,
          password: require('../../password').token(),
          startnumber: 0,
          zt: that.data.zt
        },
        useHighPerformanceMode: true,
        enableHttp2: true,
        enableProfile: false,
        enableQuic: true,
        success(res) {
          wx.hideLoading()
          if (res.statusCode == 200) {
            if (res.data.code == 0) {
              if (res.data.data == '') {
                wx.showToast({
                  title: '无数据',
                  icon: 'error'
                })
                return
              }
              const moment = require('moment-timezone')
              var array = res.data.data.map(item => ({
                ...item,
                zsenddate: moment(item.zsenddate).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss'),
                orderenddate: moment(item.orderenddate).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')
              }))
              that.setData({
                lb: array
              })
            } else {
              wx.showModal({
                title: '接口调用失败',
                content: '错误码：' + res.data.code + '；错误信息：' + res.data.msg,
                showCancel: false
              })
            }
          } else {
            wx.showToast({
              title: 'HTTP请求失败，错误码：' + res.statusCode,
              icon: 'none'
            })
          }
        }
      })
    }
  },
  onReachBottom() {
    var that = this
    if (wx.getStorageSync('user').zt == true) {
      var app = getApp()
      if (app.globalData.network == 'none') {
        wx.showToast({
          title: '无网络',
          icon: 'error'
        })
        return
      }
      wx.showLoading({
        title: '获取更多数据',
        mask: true
      })
      wx.request({
        url: 'https://api.dqmybkj.com/sslgetsqlb',
        method: 'POST',
        data: {
          email: wx.getStorageSync('user').email,
          password: require('../../password').token(),
          startnumber: that.data.lb.length,
          zt: that.data.zt
        },
        useHighPerformanceMode: true,
        enableHttp2: true,
        enableProfile: false,
        enableQuic: true,
        success(res) {
          wx.hideLoading()
          if (res.statusCode == 200) {
            if (res.data.code == 0) {
              if (res.data.data == '') {
                wx.showToast({
                  title: '没有更多数据啦~',
                  icon: 'none'
                })
                return
              }
              const moment = require('moment-timezone')
              var array = res.data.data.map(item => ({
                ...item,
                zsenddate: moment(item.zsenddate).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss'),
                orderenddate: moment(item.orderenddate).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')
              }))
              that.setData({
                lb: that.data.lb.concat(array)
              })
            } else {
              wx.showModal({
                title: '接口调用失败',
                content: '错误码：' + res.data.code + '；错误信息：' + res.data.msg,
                showCancel: false
              })
            }
          } else {
            wx.showToast({
              title: 'HTTP请求失败，错误码：' + res.statusCode,
              icon: 'none'
            })
          }
        }
      })
      return
    }
    this.pageRouter.navigateTo({
      url: '../login/login'
    })
  },
  onShareAppMessage() {
    return {
      title: '轩铭SSL证书，简单、便捷地申请DV SSL证书。',
      imageUrl: '../../image/fxfm.png'
    }
  },
  tg() {
    if (wx.getStorageSync('user').zt == true) {
      this.pageRouter.navigateTo({
        url: '../tg/tg'
      })
      return
    }
    this.pageRouter.navigateTo({
      url: '../login/login'
    })
  },
  dl() {
    this.pageRouter.navigateTo({
      url: '../login/login'
    })
  },
  dns(e) {
    var id = e.currentTarget.dataset.id
    this.pageRouter.navigateTo({
      url: '../dns/dns?id=' + id
    })
  },
  tj(e) {
    var id = e.currentTarget.dataset.id, that = this;
    wx.showModal({
      title: '提示',
      content: '请确认所有授权状态均已通过。提交成功后无法撤回，确定提交？',
      success(res) {
        if (res.confirm) {
          var app = getApp()
          if (app.globalData.network == 'none') {
            wx.showToast({
              title: '无网络',
              icon: 'error'
            })
            return
          }
          wx.showLoading({
            title: '提交中',
            mask: true
          })
          wx.request({
            url: 'https://api.dqmybkj.com/sslsqqf',
            method: 'POST',
            data: {
              email: wx.getStorageSync('user').email,
              password: require('../../password').token(),
              id: id
            },
            useHighPerformanceMode: true,
            enableHttp2: true,
            enableProfile: false,
            enableQuic: true,
            success(res) {
              wx.hideLoading()
              if (res.statusCode == 200) {
                if (res.data.code == 0) {
                  wx.showToast({
                    title: '提交成功'
                  })
                  setTimeout(() => {
                    that.onShow()
                  }, 1500)
                } else {
                  wx.showModal({
                    title: '接口调用失败',
                    content: '错误码：' + res.data.code + '；错误信息：' + res.data.msg,
                    showCancel: false
                  })
                }
              } else {
                wx.showToast({
                  title: 'HTTP请求失败，错误码：' + res.statusCode,
                  icon: 'none'
                })
              }
            }
          })
        }
      }
    })
  },
  xz(e) {
    var id = e.currentTarget.dataset.id, yuming = e.currentTarget.dataset.ym;
    wx.showActionSheet({
      itemList: ['证书', '私钥'],
      success(res) {
        const index = res.tapIndex
        var app = getApp()
        if (app.globalData.network == 'none') {
          wx.showToast({
            title: '无网络',
            icon: 'error'
          })
          return
        }
        wx.showLoading({
          title: '加载中',
          mask: true
        })
        wx.request({
          url: 'https://api.dqmybkj.com/sslxz',
          method: 'POST',
          data: {
            email: wx.getStorageSync('user').email,
            password: require('../../password').token(),
            id: id,
            lx: index
          },
          useHighPerformanceMode: true,
          enableHttp2: true,
          enableProfile: false,
          enableQuic: true,
          success(res) {
            wx.hideLoading()
            if (res.statusCode == 200) {
              if (res.data.code == 0) {
                let hz = ''
                if (index == 0) {
                  hz = '.crt'
                }
                if (index == 1) {
                  hz = '.key'
                }
                wx.showLoading({
                  title: '下载中',
                  mask: true
                })
                const filepath = wx.env.USER_DATA_PATH + '/' + id + '-' + yuming[0] + hz
                wx.downloadFile({
                  url: res.data.url,
                  useHighPerformanceMode: true,
                  enableHttp2: true,
                  enableProfile: false,
                  enableQuic: true,
                  success(res) {
                    wx.hideLoading()
                    if (res.statusCode == 200) {
                      wx.saveFileToDisk({
                        filePath: res.tempFilePath,
                        success() {
                          wx.showToast({
                            title: '保存成功'
                          })
                        },
                        fail() {
                          const fm = wx.getFileSystemManager()
                          fm.saveFile({
                            tempFilePath: res.tempFilePath,
                            filePath: filepath,
                            success(res) {
                              const path = res.savedFilePath
                              wx.showActionSheet({
                                alertText: '将文件',
                                itemList: ['转发到聊天', '添加到微信收藏'],
                                success(res) {
                                  if (res.tapIndex == 0) {
                                    wx.shareFileMessage({
                                      filePath: path,
                                      success() {
                                        fm.removeSavedFile(path)
                                      }
                                    })
                                  }
                                  if (res.tapIndex == 1) {
                                    wx.addFileToFavorites({
                                      filePath: path,
                                      success() {
                                        wx.showToast({
                                          title: '添加成功'
                                        })
                                        fm.removeSavedFile(path)
                                      }
                                    })
                                  }
                                }
                              })
                            }
                          })
                        }
                      })
                    } else {
                      wx.showToast({
                        title: 'HTTP请求失败，错误码：' + res.statusCode,
                        icon: 'none'
                      })
                    }
                  }
                })
              } else {
                wx.showModal({
                  title: '接口调用失败',
                  content: '错误码：' + res.data.code + '；错误信息：' + res.data.msg,
                  showCancel: false
                })
              }
            } else {
              wx.showToast({
                title: 'HTTP请求失败，错误码：' + res.statusCode,
                icon: 'none'
              })
            }
          }
        })
      }
    })
  },
  dx(id, reason) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '吊销后无法恢复。确定吊销？',
      success(res) {
        if (res.confirm) {
          var app = getApp()
          if (app.globalData.network == 'none') {
            wx.showToast({
              title: '无网络',
              icon: 'error'
            })
            return
          }
          wx.showLoading({
            title: '加载中',
            mask: true
          })
          wx.request({
            url: 'https://api.dqmybkj.com/ssldx',
            method: 'POST',
            data: {
              email: wx.getStorageSync('user').email,
              password: require('../../password').token(),
              id: id,
              reason: reason
            },
            useHighPerformanceMode: true,
            enableHttp2: true,
            enableProfile: false,
            enableQuic: true,
            success(res) {
              wx.hideLoading()
              if (res.statusCode == 200) {
                if (res.data.code == 0) {
                  wx.showToast({
                    title: '提交证书吊销申请成功',
                    icon: 'none'
                  })
                  setTimeout(() => {
                    that.onShow()
                  }, 1500)
                } else {
                  wx.showModal({
                    title: '接口调用失败',
                    content: '错误码：' + res.data.code + '；错误信息：' + res.data.msg,
                    showCancel: false
                  })
                }
              } else {
                wx.showToast({
                  title: 'HTTP请求失败，错误码：' + res.statusCode,
                  icon: 'none'
                })
              }
            }
          })
        }
      }
    })
  },
  dxa(e) {
    var id = e.currentTarget.dataset.id, that = this;
    wx.showActionSheet({
      alertText: '请选择吊销原因',
      itemList: ['私钥已被泄露', '被新证书取代', '证书不再使用', '其他'],
      success(res) {
        if (res.tapIndex == 0) {
          that.dx(id, 1)
        }
        if (res.tapIndex == 1) {
          that.dx(id, 4)
        }
        if (res.tapIndex == 2) {
          that.dx(id, 5)
        }
        if (res.tapIndex == 3) {
          that.dx(id, 0)
        }
      }
    })
  },
  sc(e) {
    var id = e.currentTarget.dataset.id, that = this;
    wx.showModal({
      title: '提示',
      content: '删除后无法恢复，确定删除？',
      success(res) {
        if (res.confirm) {
          var app = getApp()
          if (app.globalData.network == 'none') {
            wx.showToast({
              title: '无网络',
              icon: 'error'
            })
            return
          }
          wx.showLoading({
            title: '删除中',
            mask: true
          })
          wx.request({
            url: 'https://api.dqmybkj.com/sslsc',
            method: 'POST',
            data: {
              email: wx.getStorageSync('user').email,
              password: require('../../password').token(),
              id: id
            },
            useHighPerformanceMode: true,
            enableHttp2: true,
            enableProfile: false,
            enableQuic: true,
            success(res) {
              wx.hideLoading()
              if (res.statusCode == 200) {
                if (res.data.code == 0) {
                  wx.showToast({
                    title: '删除成功'
                  })
                  setTimeout(() => {
                    that.onShow()
                  }, 1500)
                } else {
                  wx.showModal({
                    title: '接口调用失败',
                    content: '错误码：' + res.data.code + '；错误信息：' + res.data.msg,
                    showCancel: false
                  })
                }
              } else {
                wx.showToast({
                  title: 'HTTP请求失败，错误码：' + res.statusCode,
                  icon: 'none'
                })
              }
            }
          })
        }
      }
    })
  }
})