Page({
  data: {
    xs: false,
    theme: '',
    settings: [
      {
        namewz: '自动提交订单',
        name: 'autoSubmitOrder',
        value: false
      },
      {
        namewz: '自动配置DNS',
        name: 'autoSetDns',
        value: false
      }
    ],
    autosubmitchallengeverify: 'afterverify',
    autosubmitchallengeverifywz: '验证通过',
    value: 0,
    array: ['验证通过', '直接', '关闭']
  },
  onShow() {
    var that = this
    that.setData({
      xs: false,
      theme: wx.getAppBaseInfo().theme,
      notices: [
        {
          namewz: '自动提交订单',
          name: 'autoSubmitOrder',
          value: false
        },
        {
          namewz: '自动配置DNS',
          name: 'autoSetDns',
          value: false
        }
      ],
      autosubmitchallengeverify: 'afterverify',
      autosubmitchallengeverifywz: '验证通过',
      value: 0
    })
    if (wx.getStorageSync('user').accesstoken) {
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
        url: 'https://api.zhangls2512.cn/product/getUserInfo',
        method: 'POST',
        data: {
          accessToken: wx.getStorageSync('user').accesstoken,
          product: 'ssl'
        },
        enableHttp2: true,
        enableQuic: true,
        useHighPerformanceMode: true,
        enableProfile: false,
        success(res) {
          wx.hideLoading()
          if (res.statusCode == 200) {
            if (res.data.errCode == 0) {
              const valuemap = {
                afterverify: '验证通过',
                direct: '直接',
                close: '关闭'
              }
              const namearray = ['afterverify', 'direct', 'close']
              that.setData({
                settings: that.data.settings.map(item => ({
                  ...item,
                  value: res.data.data.setting[item.name]
                })),
                autosubmitchallengeverify: res.data.data.setting.autoSubmitChallengeVerify,
                autosubmitchallengeverifywz: valuemap[res.data.data.setting.autoSubmitChallengeVerify],
                value: namearray.indexOf(res.data.data.setting.autoSubmitChallengeVerify)
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
  change(e) {
    var name = e.currentTarget.dataset.name, value = e.detail.value;
    var app = getApp()
    if (app.globalData.network == 'none') {
      wx.showToast({
        title: '无网络',
        icon: 'error'
      })
      return
    }
    wx.showLoading({
      title: '设置中',
      mask: true
    })
    wx.request({
      url: 'https://api.zhangls2512.cn/ssl/updateUserSetting',
      method: 'POST',
      data: {
        accessToken: wx.getStorageSync('user').accesstoken,
        settingName: name,
        settingValue: value
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
              title: '设置成功'
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
  },
  picker(e) {
    var t = e.detail.value
    if (t == 0) {
      this.setData({
        autosubmitchallengeverify: 'afterverify',
        autosubmitchallengeverifywz: '验证通过'
      })
    }
    if (t == 1) {
      this.setData({
        autosubmitchallengeverify: 'direct',
        autosubmitchallengeverifywz: '直接'
      })
    }
    if (t == 2) {
      this.setData({
        autosubmitchallengeverify: 'close',
        autosubmitchallengeverifywz: '关闭'
      })
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
      title: '设置中',
      mask: true
    })
    wx.request({
      url: 'https://api.zhangls2512.cn/ssl/updateUserSetting',
      method: 'POST',
      data: {
        accessToken: wx.getStorageSync('user').accesstoken,
        settingName: 'autoSubmitChallengeVerify',
        settingValue: this.data.autosubmitchallengeverify
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
              title: '设置成功'
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
  },
  more() {
    this.pageRouter.navigateTo({
      url: '../lj/lj?id=' + encodeURIComponent('https://www.zhangls2512.cn/product/ssl/setting')
    })
  }
})