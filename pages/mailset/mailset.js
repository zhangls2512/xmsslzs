Page({
  data: {
    xs: false,
    theme: '',
    sqztbg: false,
    zsdq: false
  },
  onShow() {
    var that = this
    that.setData({
      xs: false,
      theme: wx.getAppBaseInfo().theme,
      sqztbg: false,
      zsdq: false
    })
    if (wx.getStorageSync('user').zt == true) {
      that.setData({
        xs: true
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
        url: 'https://api.dqmybkj.com/sslgetuserset',
        method: 'POST',
        data: {
          email: wx.getStorageSync('user').email,
          password: wx.getStorageSync('user').password
        },
        useHighPerformanceMode: true,
        enableHttp2: true,
        enableProfile: false,
        enableQuic: true,
        success(res) {
          wx.hideLoading()
          if (res.statusCode == 200) {
            if (res.data.code == 0) {
              that.setData({
                sqztbg: res.data.data.mailsqztbg,
                zsdq: res.data.data.mailzsdq
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
  onUnload() {
    var t = this.data
    var app = getApp()
    if (app.globalData.network == 'none') {
      wx.showToast({
        title: '无网络',
        icon: 'error'
      })
      return
    }
    wx.showLoading({
      title: '保存中',
      mask: true
    })
    wx.request({
      url: 'https://api.dqmybkj.com/sslgxuserset',
      method: 'POST',
      data: {
        email: wx.getStorageSync('user').email,
        password: wx.getStorageSync('user').password,
        mailsqztbg: t.sqztbg,
        mailzsdq: t.zsdq
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
              title: '保存成功'
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
  },
  sqztbg(e) {
    this.setData({
      sqztbg: e.detail.value
    })
  },
  zsdq(e) {
    this.setData({
      zsdq: e.detail.value
    })
  }
})