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
  sx() {
    this.onShow()
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
        url: 'https://api.dqmybkj.com/sslgetdns',
        method: 'POST',
        data: {
          email: wx.getStorageSync('user').email,
          password: require('../../password').token(),
          id: that.data.id
        },
        useHighPerformanceMode: true,
        enableHttp2: true,
        enableProfile: false,
        enableQuic: true,
        success(res) {
          wx.hideLoading()
          if (res.statusCode == 200) {
            if (res.data.code == 0) {
              const moment = require('moment-timezone')
              var array = res.data.data.map(item => ({
                ...item,
                enddate: moment(item.enddate).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')
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
  reason(e) {
    var id = e.currentTarget.dataset.id
    wx.showModal({
      title: '验证失败原因',
      content: id,
      showCancel: false
    })
  },
  tj(e) {
    var id = e.currentTarget.dataset.id, that = this;
    wx.showModal({
      title: '提示',
      content: '仅有一次验证机会，确定提交验证？',
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
            url: 'https://api.dqmybkj.com/sslyz',
            method: 'POST',
            data: {
              email: wx.getStorageSync('user').email,
              password: require('../../password').token(),
              id: that.data.id,
              index: id
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
                    title: '提交验证成功'
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
  fz(e) {
    var id = e.currentTarget.dataset.id
    wx.setClipboardData({
      data: id
    })
  }
})