Page({
  data: {
    lb: [],
    qx: false,
    theme: '',
    id: ''
  },
  onLoad(e) {
    if (e.id) {
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
    if (!that.data.id) {
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
      wx.cloud.callFunction({
        name: 'getSslOrderAuthorization',
        data: {
          accessToken: wx.getStorageSync('user').accesstoken,
          id: that.data.id
        },
        success(res) {
          wx.hideLoading()
          if (res.result.errCode == 0) {
            that.setData({
              lb: res.result.authorization.map(item => ({
                ...item,
                expires: that.time(item.expires)
              }))
            })
          } else {
            wx.showModal({
              title: '接口调用失败',
              content: '错误码：' + res.result.errCode + '；错误信息：' + res.result.errMsg + '；修复方法：' + res.result.errFix,
              confirmText: '确定',
              showCancel: false
            })
          }
        }
      })
    }
  },
  time(time) {
    const date = new Date(time)
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0') + ' ' + String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0') + ':' + String(date.getSeconds()).padStart(2, '0')
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
        confirmText: '确定',
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
      confirmText: '确定',
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
          wx.cloud.callFunction({
            name: 'respondSslChallenge',
            data: {
              accessToken: wx.getStorageSync('user').accesstoken,
              orderId: that.data.id,
              url: url
            },
            success(res) {
              wx.hideLoading()
              if (res.result.errCode == 0) {
                wx.showToast({
                  title: '提交成功'
                })
                setTimeout(() => {
                  that.onShow()
                }, 1500)
              } else {
                wx.showModal({
                  title: '接口调用失败',
                  content: '错误码：' + res.result.errCode + '；错误信息：' + res.result.errMsg + '；修复方法：' + res.result.errFix,
                  confirmText: '确定',
                  showCancel: false
                })
              }
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
      confirmText: '确定',
      showCancel: false
    })
  },
  stop(e) {
    var url = e.currentTarget.dataset.url, that = this;
    wx.showModal({
      title: '提示',
      content: '停用成功后无法恢复，确定停用？',
      confirmText: '确定',
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
          wx.cloud.callFunction({
            name: 'deactivateSslAuthorization',
            data: {
              accessToken: wx.getStorageSync('user').accesstoken,
              orderId: that.data.id,
              url: url
            },
            success(res) {
              wx.hideLoading()
              if (res.result.errCode == 0) {
                wx.showToast({
                  title: '停用成功'
                })
                setTimeout(() => {
                  that.onShow()
                }, 1500)
              } else {
                wx.showModal({
                  title: '接口调用失败',
                  content: '错误码：' + res.result.errCode + '；错误信息：' + res.result.errMsg + '；修复方法：' + res.result.errFix,
                  confirmText: '确定',
                  showCancel: false
                })
              }
            }
          })
        }
      }
    })
  }
})