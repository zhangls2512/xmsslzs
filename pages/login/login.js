Page({
  data: {
    theme: '',
    email: '',
    type: 'password',
    typewz: '密码',
    types: ['密码', 'MFA', '邮箱验证码'],
    code: '',
    yzmzt: false,
    ua: '',
    timeoutid: -1
  },
  onShow() {
    var that = this
    that.setData({
      theme: wx.getAppBaseInfo().theme
    })
    wx.getRendererUserAgent({
      success(res) {
        that.setData({
          ua: res.userAgent
        })
      }
    })
  },
  onUnload() {
    if (this.data.timeoutid != -1) {
      clearTimeout(this.data.timeoutid)
    }
  },
  picker(e) {
    var t = e.detail.value
    if (t == 0) {
      this.setData({
        type: 'password',
        typewz: '密码'
      })
    }
    if (t == 1) {
      this.setData({
        type: 'mfa',
        typewz: 'MFA'
      })
    }
    if (t == 2) {
      this.setData({
        type: 'emailcode',
        typewz: '邮箱验证码'
      })
    }
  },
  hqyzm() {
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
            const timeoutid = setTimeout(() => {
              that.setData({
                yzmzt: false
              })
            }, 60000)
            this.setData({
              timeoutid: timeoutid
            })
          } else {
            wx.showModal({
              title: '接口调用失败',
              content: '错误码：' + res.data.errCode + '；错误信息：' + res.data.errMsg + '；修复方法：' + res.data.errFix,
              confirmText: '确定',
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
  dl() {
    var t = this.data, that = this;
    if (t.email == '') {
      wx.showToast({
        title: '请填写邮箱',
        icon: 'error'
      })
      return
    }
    if (t.type == 'password' && t.code.length < 8) {
      wx.showToast({
        title: '请填写有效的密码',
        icon: 'none'
      })
      return
    }
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
      title: '登录中',
      mask: true
    })
    wx.cloud.callFunction({
      name: 'getAccessToken',
      data: {
        email: t.email,
        verifyType: t.type,
        verifyCode: t.code,
        userAgent: t.ua
      },
      success(res) {
        wx.hideLoading()
        if (res.result.errCode == 0) {
          wx.showToast({
            title: '登录成功'
          })
          wx.setStorage({
            key: 'user',
            data: {
              accesstoken: res.result.accessToken,
              enddate: res.result.endDate,
              email: t.email
            }
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
            content: '错误码：' + res.result.errCode + '；错误信息：' + res.result.errMsg + '；修复方法：' + res.result.errFix,
            confirmText: '确定',
            showCancel: false
          })
        }
      }
    })
  },
  wxdl() {
    var that = this
    var app = getApp()
    if (app.globalData.network == 'none') {
      wx.showToast({
        title: '无网络',
        icon: 'error'
      })
      return
    }
    wx.showLoading({
      title: '登录中',
      mask: true
    })
    wx.login({
      success(wxres) {
        wx.cloud.callFunction({
          name: 'getAccessToken',
          data: {
            verifyType: 'sslwxxcx',
            verifyCode: wxres.code,
            userAgent: that.data.ua
          },
          success(res) {
            if (res.result.errCode == 0) {
              wx.request({
                url: 'https://api.zhangls2512.cn/account/getAccountInfo',
                method: 'POST',
                data: {
                  accessToken: res.result.accessToken
                },
                enableHttp2: true,
                enableQuic: true,
                useHighPerformanceMode: true,
                enableProfile: false,
                success(userres) {
                  wx.hideLoading()
                  if (userres.statusCode == 200) {
                    if (userres.data.errCode == 0) {
                      wx.showToast({
                        title: '登录成功'
                      })
                      wx.setStorage({
                        key: 'user',
                        data: {
                          accesstoken: res.result.accessToken,
                          enddate: res.result.endDate,
                          email: userres.data.data.email
                        }
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
                        content: '错误码：' + userres.data.errCode + '；错误信息：' + userres.data.errMsg + '；修复方法：' + userres.data.errFix,
                        confirmText: '确定',
                        showCancel: false
                      })
                    }
                  } else {
                    wx.showToast({
                      title: '请求失败，错误码：' + userres.statusCode,
                      icon: 'none'
                    })
                  }
                }
              })
            } else {
              wx.hideLoading()
              wx.showModal({
                title: '接口调用失败',
                content: '错误码：' + res.result.errCode + '；错误信息：' + res.result.errMsg + '；修复方法：' + res.result.errFix,
                confirmText: '确定',
                showCancel: false
              })
            }
          }
        })
      },
      fail(res) {
        wx.hideLoading()
        wx.showToast({
          title: '登录失败，错误信息：' + res.errMsg,
          icon: 'none'
        })
      }
    })
  },
  zc() {
    this.pageRouter.navigateTo({
      url: '../lj/lj?id=' + encodeURIComponent('https://www.zhangls2512.cn/product/account/register')
    })
  }
})