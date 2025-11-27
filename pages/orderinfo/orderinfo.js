Page({
  data: {
    qx: false,
    theme: '',
    id: '',
    data: {
      privateKey: ''
    }
  },
  onLoad(e) {
    if (e.id !== undefined) {
      this.setData({
        id: e.id
      })
    }
  },
  sx() {
    var status = this.data.data.status, that = this;
    if (status == 'pending' || status == 'ready' || status == 'processing' || status == 'valid') {
      var app = getApp()
      if (app.globalData.network == 'none') {
        wx.showToast({
          title: '无网络',
          icon: 'error'
        })
        return
      }
      wx.showLoading({
        title: '刷新中',
        mask: true
      })
      wx.cloud.callFunction({
        name: 'refreshSslOrder',
        data: {
          accessToken: wx.getStorageSync('user').accesstoken,
          id: that.data.id
        },
        success(res) {
          wx.hideLoading()
          if (res.result.errCode == 0) {
            that.onShow()
          } else {
            wx.showModal({
              title: '接口调用失败',
              content: '错误码：' + res.result.errCode + '；错误信息：' + res.result.errMsg + '；修复方法：' + res.result.errFix,
              showCancel: false
            })
          }
        }
      })
      return
    }
    that.onShow()
  },
  onShow() {
    var that = this
    that.setData({
      qx: false,
      theme: wx.getAppBaseInfo().theme,
      data: {
        privateKey: ''
      }
    })
    if (that.data.id == '') {
      wx.showToast({
        title: '参数未传递',
        icon: 'error'
      })
      return
    }
    if (wx.getStorageSync('user').accesstoken) {
      that.setData({
        qx: true
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
        url: 'https://api.zhangls2512.cn/ssl/getOrderInfo',
        method: 'POST',
        data: {
          accessToken: wx.getStorageSync('user').accesstoken,
          id: that.data.id
        },
        enableHttp2: true,
        enableQuic: true,
        useHighPerformanceMode: true,
        enableProfile: false,
        success(res) {
          wx.hideLoading()
          if (res.statusCode == 200) {
            if (res.data.errCode == 0) {
              const moment = require('moment-timezone')
              let data = res.data.data
              data.ariEndDate = moment(res.data.data.ariEndDate).format('YYYY-MM-DD HH:mm:ss')
              data.ariStartDate = moment(res.data.data.ariStartDate).format('YYYY-MM-DD HH:mm:ss')
              data.certificateEndDate = moment(res.data.data.certificateEndDate).format('YYYY-MM-DD HH:mm:ss')
              data.certificateStartDate = moment(res.data.data.certificateStartDate).format('YYYY-MM-DD HH:mm:ss')
              data.createDate = moment(res.data.data.createDate).format('YYYY-MM-DD HH:mm:ss')
              data.orderEndDate = moment(res.data.data.orderEndDate).format('YYYY-MM-DD HH:mm:ss')
              that.setData({
                data: data
              })
            } else {
              wx.showModal({
                title: '接口调用失败',
                content: '错误码：' + res.data.errCode + '；错误信息：' + res.data.errMsg + '；修复方法：' + res.data.errFix,
                showCancel: false
              })
            }
          } else {
            wx.showToast({
              title: '请求失败，错误码：' + res.statusCode,
              icon: 'none'
            })
          }
        },
        fail(res) {
          wx.hideLoading()
          wx.showToast({
            title: '请求失败，错误信息：' + res.errMsg,
            icon: 'none'
          })
        }
      })
    }
  },
  download(e) {
    var url = e.currentTarget.dataset.url
    var app = getApp()
    if (app.globalData.network == 'none') {
      wx.showToast({
        title: '无网络',
        icon: 'error'
      })
      return
    }
    wx.showLoading({
      title: '下载中',
      mask: true
    })
    const filepath = wx.env.USER_DATA_PATH + '/' + (url.split('/').pop()).split('?')[0]
    wx.downloadFile({
      url: url,
      enableHttp2: true,
      enableQuic: true,
      useHighPerformanceMode: true,
      enableProfile: false,
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
  },
  deleteprivatekey() {
    var that = this
    wx.showModal({
      title: '提示',
      content: '删除成功后无法恢复，确定删除？',
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
            url: 'https://api.zhangls2512.cn/ssl/deleteOrderPrivateKey',
            method: 'POST',
            data: {
              accessToken: wx.getStorageSync('user').accesstoken,
              id: that.data.id
            },
            enableHttp2: true,
            enableQuic: true,
            useHighPerformanceMode: true,
            enableProfile: false,
            success(res) {
              wx.hideLoading()
              if (res.statusCode == 200) {
                if (res.data.errCode == 0) {
                  wx.showToast({
                    title: '删除成功'
                  })
                  setTimeout(() => {
                    that.onShow()
                  }, 1500)
                } else {
                  wx.showModal({
                    title: '接口调用失败',
                    content: '错误码：' + res.data.errCode + '；错误信息：' + res.data.errMsg + '；修复方法：' + res.data.errFix,
                    showCancel: false
                  })
                }
              } else {
                wx.showToast({
                  title: '请求失败，错误码：' + res.statusCode,
                  icon: 'none'
                })
              }
            },
            fail(res) {
              wx.hideLoading()
              wx.showToast({
                title: '请求失败，错误信息：' + res.errMsg,
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },
  revoke() {
    var that = this
    wx.showActionSheet({
      alertText: '选择吊销原因',
      itemList: ['不指定', '私钥泄露', '被新证书取代', '不再使用'],
      success(res) {
        let reason = 0
        if (res.tapIndex == 0) {
          reason = 0
        }
        if (res.tapIndex == 1) {
          reason = 1
        }
        if (res.tapIndex == 2) {
          reason = 4
        }
        if (res.tapIndex == 3) {
          reason = 5
        }
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
        wx.cloud.callFunction({
          name: 'revokeSslCertificate',
          data: {
            accessToken: wx.getStorageSync('user').accesstoken,
            orderId: that.data.id,
            reason: reason
          },
          success(res) {
            wx.hideLoading()
            if (res.result.errCode == 0) {
              wx.showToast({
                title: '吊销成功'
              })
              setTimeout(() => {
                that.onShow()
              }, 1500)
            } else {
              wx.showModal({
                title: '接口调用失败',
                content: '错误码：' + res.result.errCode + '；错误信息：' + res.result.errMsg + '；修复方法：' + res.result.errFix,
                showCancel: false
              })
            }
          }
        })
      }
    })
  },
  fz() {
    var id = this.data.id, that = this;
    if (wx.getStorageSync('qxsetting').xrjtb != true) {
      wx.showModal({
        title: '提示',
        content: '“写入数据到剪贴板”权限未开启，无法使用此功能。如需使用此功能，请点击“确定”进入权限管理页面开启“写入数据到剪贴板”权限。',
        success(res) {
          if (res.confirm) {
            that.router.navigateTo({
              url: '../qxgl/qxgl'
            })
          }
        }
      })
      return
    }
    wx.setClipboardData({
      data: id
    })
  }
})