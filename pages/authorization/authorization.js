Page({
  data: {
    lb: [],
    qx: false,
    theme: '',
    id: ''
  },
  onLoad(e) {
    if (e.id !== undefined) {
      this.setData({
        id: e.id
      })
    }
  },
  onShow() {
    var that = this
    that.setData({
      lb: [],
      qx: false,
      theme: wx.getAppBaseInfo().theme
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
        title: '加载中',
        mask: true
      })
      wx.request({
        url: 'https://api.zhangls2512.cn/ssl/getOrderAuthorization',
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
              that.setData({
                lb: res.data.authorization.map(item => ({
                  ...item,
                  expires: moment(item.createDate).format('YYYY-MM-DD HH:mm:ss')
                }))
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
  sx() {
    this.onShow()
  },
  fz(e) {
    var id = e.currentTarget.dataset.id, that = this;
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
  },
  tj(e) {
    var url = e.currentTarget.dataset.url, that = this;
    wx.showModal({
      title: '提示',
      content: '只有一次验证机会，确定验证？',
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
            url: 'https://api.zhangls2512.cn/ssl/respondChallenge',
            method: 'POST',
            data: {
              accessToken: wx.getStorageSync('user').accesstoken,
              orderId: that.data.id,
              url: url
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
                    title: '提交成功'
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
  reason(e) {
    var id = e.currentTarget.dataset.reason
    wx.showModal({
      title: '不通过原因',
      content: id,
      showCancel: false
    })
  },
  stop(e) {
    var url = e.currentTarget.dataset.url, that = this;
    wx.showModal({
      title: '提示',
      content: '停用后无法恢复，确定停用？',
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
            url: 'https://api.zhangls2512.cn/ssl/deactivateAuthorization',
            method: 'POST',
            data: {
              accessToken: wx.getStorageSync('user').accesstoken,
              orderId: that.data.id,
              url: url
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
                    title: '停用成功'
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
  }
})