Page({
  data: {
    theme: '',
    type: 'info',
    title: '请登录账号',
    desc: ''
  },
  onShow() {
    var that = this
    that.setData({
      theme: wx.getAppBaseInfo().theme,
      type: 'info',
      title: '请登录账号',
      desc: ''
    })
    if (wx.getStorageSync('user').zt == true) {
      that.setData({
        type: 'warn',
        title: '重要提醒',
        desc: '注销账号是不可恢复的操作，你应自行备份账号相关的信息和数据。操作之前，请确认与账号相关的所有服务均已进行妥善处理。注销账号，你将无法再使用本账号以及找回你使用本账号所产生、添加或绑定的任何内容或信息。'
      })
    }
  },
  zx() {
    wx.showModal({
      title: '提示',
      content: '注销成功后无法恢复，确定注销？',
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
            title: '注销中',
            mask: true
          })
          wx.request({
            url: 'https://api.dqmybkj.com/sslzx',
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
                  wx.showToast({
                    title: '注销成功'
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
      }
    })
  }
})