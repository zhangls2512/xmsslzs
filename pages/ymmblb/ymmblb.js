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
    if (wx.getStorageSync('user').zt == true) {
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
        url: 'https://api.dqmybkj.com/sslgetymmblb',
        method: 'POST',
        data: {
          email: wx.getStorageSync('user').email,
          password: require('../../password').token()
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
              that.setData({
                lb: res.data.data
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
  dl() {
    this.pageRouter.navigateTo({
      url: '../login/login'
    })
  },
  tg() {
    this.pageRouter.navigateTo({
      url: '../zgymmb/zgymmb'
    })
  },
  xg(e) {
    var id = e.currentTarget.dataset.id
    this.pageRouter.navigateTo({
      url: '../zgymmb/zgymmb?id=' + id
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
            url: 'https://api.dqmybkj.com/sslscymmb',
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