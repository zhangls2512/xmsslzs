Page({
  data: {
    xs: false,
    theme: '',
    email: '',
    id: '',
    yzm: ''
  },
  onShow() {
    var that = this
    that.setData({
      xs: false,
      theme: wx.getAppBaseInfo().theme
    })
    if (wx.getStorageSync('user').zt == true) {
      that.setData({
        xs: true
      })
    }
  },
  fs() {
    var t = this.data, that = this;
    if (t.email == '') {
      wx.showToast({
        title: '请填写邮箱',
        icon: 'error'
      })
      return
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
      title: '发送中',
      mask: true
    })
    wx.request({
      url: 'https://api.dqmybkj.com/sslfsyzm',
      method: 'POST',
      data: {
        email: t.email
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
              id: res.data.id
            })
            wx.showToast({
              title: '发送成功'
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
  tj() {
    var t = this.data
    if (t.email == '') {
      wx.showToast({
        title: '请填写邮箱',
        icon: 'error'
      })
      return
    }
    if (t.id == '') {
      wx.showToast({
        title: '请发送验证码',
        icon: 'error'
      })
      return
    }
    if (t.yzm == '') {
      wx.showToast({
        title: '请填写验证码',
        icon: 'error'
      })
      return
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
      title: '修改中',
      mask: true
    })
    wx.request({
      url: 'https://api.dqmybkj.com/sslxgmail',
      method: 'POST',
      data: {
        email: wx.getStorageSync('user').email,
        password: require('../../password').token(),
        newemail: t.email,
        id: t.id,
        yzm: t.yzm
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
              title: '修改成功，请重新登录',
              icon: 'none'
            })
            wx.removeStorage({
              key: 'user'
            })
            setTimeout(() => {
              wx.navigateBack({
                delta: 2,
                fail() {
                  wx.showToast({
                    title: '错误',
                    icon: 'error'
                  })
                }
              })
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
})