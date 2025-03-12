Page({
  data: {
    qx: false,
    theme: '',
    wz: '',
    email: '',
    type: 'mfa',
    typewz: 'MFA',
    types: ['MFA', '邮箱验证码'],
    code: '',
    yzmzt: false
  },
  onShow() {
    var that = this
    that.setData({
      qx: false,
      theme: wx.getAppBaseInfo().theme
    })
    if (wx.getStorageSync('user').accesstoken) {
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
        url: 'https://api.zhangls2512.cn/account/getExternalAccount',
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
              if (!res.data.data.some(item => item.platform == 'sslwxxcx')) {
                that.setData({
                  qx: true,
                  wz: '绑定',
                  email: wx.getStorageSync('user').email
                })
              } else {
                that.setData({
                  qx: true,
                  wz: '解绑',
                  email: wx.getStorageSync('user').email
                })
              }
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
  picker(e) {
    var t = e.detail.value
    if (t == 0) {
      this.setData({
        type: 'mfa',
        typewz: 'MFA'
      })
    }
    if (t == 1) {
      this.setData({
        type: 'emailcode',
        typewz: '邮箱验证码'
      })
    }
  },
  hqyzm() {
    var t = this.data, that = this;
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
      url: 'https://api.zhangls2512.cn/account/sendEmailCode',
      method: 'POST',
      data: {
        email: t.email
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
              title: '发送成功'
            })
            that.setData({
              yzmzt: true
            })
            setTimeout(() => {
              that.setData({
                yzmzt: false
              })
            }, 60000)
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
      }
    })
  },
  bd() {
    var t = this.data, that = this;
    if (t.type == 'mfa' && t.code.length != 6) {
      wx.showToast({
        title: '请填写有效的MFA',
        icon: 'none'
      })
      return
    }
    if (t.type == 'emailcode' && t.code.length != 8) {
      wx.showToast({
        title: '请填写有效的邮箱验证码',
        icon: 'none'
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
      title: '绑定中',
      mask: true
    })
    wx.login({
      success(res) {
        wx.request({
          url: 'https://api.zhangls2512.cn/account/bindExternalAccount',
          method: 'POST',
          data: {
            email: t.email,
            verifyType: t.type,
            verifyCode: t.code,
            platform: 'sslwxxcx',
            code: res.code
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
                  title: '绑定成功'
                })
                setTimeout(() => {
                  that.router.navigateBack({
                    delta: 1,
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
          }
        })
      },
      fail(res) {
        wx.hideLoading()
        wx.showToast({
          title: '微信登录失败，错误信息：' + res.errMsg,
          icon: 'none'
        })
      }
    })
  },
  jb() {
    var t = this.data, that = this;
    wx.showModal({
      title: '提示',
      content: '解绑后需重新绑定才可微信一键登录账号，确定解绑？',
      success(res) {
        if (res.confirm) {
          if (t.type == 'mfa' && t.code.length != 6) {
            wx.showToast({
              title: '请填写有效的MFA',
              icon: 'none'
            })
            return
          }
          if (t.type == 'emailcode' && t.code.length != 8) {
            wx.showToast({
              title: '请填写有效的邮箱验证码',
              icon: 'none'
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
            title: '解绑中',
            mask: true
          })
          wx.request({
            url: 'https://api.zhangls2512.cn/account/unbindExternalAccount',
            method: 'POST',
            data: {
              email: t.email,
              verifyType: t.type,
              verifyCode: t.code,
              platform: 'sslwxxcx'
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
                    title: '解绑成功'
                  })
                  setTimeout(() => {
                    that.router.navigateBack({
                      delta: 1,
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
            }
          })
        }
      }
    })
  }
})