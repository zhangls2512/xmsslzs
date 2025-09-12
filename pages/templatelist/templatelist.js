Page({
  data: {
    lb: [],
    qx: false,
    theme: ''
  },
  onShow() {
    var that = this
    that.setData({
      lb: [],
      qx: false,
      theme: wx.getAppBaseInfo().theme
    })
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
        url: 'https://api.zhangls2512.cn/ssl/getTemplateList',
        method: 'POST',
        data: {
          accessToken: wx.getStorageSync('user').accesstoken
        },
        enableHttp2: true,
        enableQuic: true,
        useHighPerformanceMode: true,
        enableProfile: false,
        success(res) {
          wx.hideLoading()
          if (res.statusCode == 200) {
            if (res.data.errCode == 0) {
              if (res.data.data.length == 0) {
                wx.showToast({
                  title: '无数据',
                  icon: 'error'
                })
                return
              }
              that.setData({
                lb: res.data.data
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
  dl() {
    this.pageRouter.navigateTo({
      url: '../login/login'
    })
  },
  add() {
    this.pageRouter.navigateTo({
      url: '../zgtemplate/zgtemplate'
    })
  },
  xg(e) {
    var id = e.currentTarget.dataset.id
    this.pageRouter.navigateTo({
      url: '../zgtemplate/zgtemplate?id=' + id
    })
  },
  sc(e) {
    var id = e.currentTarget.dataset.id, that = this;
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
            url: 'https://api.zhangls2512.cn/ssl/deleteTemplate',
            method: 'POST',
            data: {
              accessToken: wx.getStorageSync('user').accesstoken,
              id: id
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
  }
})