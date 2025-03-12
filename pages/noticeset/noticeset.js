Page({
  data: {
    xs: false,
    theme: '',
    notices: [
      {
        name: '订单额度变更',
        emailname: 'ssl_email_limitchange',
        webhookname: 'ssl_webhook_limitchange',
        emailzt: false,
        webhookzt: false
      },
      {
        name: '订单额度耗尽',
        emailname: 'ssl_email_limitempty',
        webhookname: 'ssl_webhook_limitempty',
        emailzt: false,
        webhookzt: false
      },
      {
        name: '自动新增订单结果',
        emailname: 'ssl_email_autoneworderresult',
        webhookname: 'ssl_webhook_autoneworderresult',
        emailzt: false,
        webhookzt: false
      },
      {
        name: '自动提交订单结果',
        emailname: 'ssl_email_autosubmitorderresult',
        webhookname: 'ssl_webhook_autosubmitorderresult',
        emailzt: false,
        webhookzt: false
      },
      {
        name: '订单状态变更',
        emailname: 'ssl_email_orderstatuschange',
        webhookname: 'ssl_webhook_orderstatuschange',
        emailzt: false,
        webhookzt: false
      },
      {
        name: 'DNS自动配置任务状态变更',
        emailname: 'ssl_email_autodnstaskstatuschange',
        webhookname: 'ssl_webhook_autodnstaskstatuschange',
        emailzt: false,
        webhookzt: false
      },
      {
        name: '订单即将过期',
        emailname: 'ssl_email_ordernearexpire',
        webhookname: 'ssl_webhook_ordernearexpire',
        emailzt: false,
        webhookzt: false
      },
      {
        name: '证书即将过期',
        emailname: 'ssl_email_certificatenearexpire',
        webhookname: 'ssl_webhook_certificatenearexpire',
        emailzt: false,
        webhookzt: false
      }
    ]
  },
  onShow() {
    var that = this
    that.setData({
      xs: false,
      theme: wx.getAppBaseInfo().theme,
      notices: [
        {
          name: '订单额度变更',
          emailname: 'ssl_email_limitchange',
          webhookname: 'ssl_webhook_limitchange',
          emailzt: false,
          webhookzt: false
        },
        {
          name: '订单额度耗尽',
          emailname: 'ssl_email_limitempty',
          webhookname: 'ssl_webhook_limitempty',
          emailzt: false,
          webhookzt: false
        },
        {
          name: '自动新增订单结果',
          emailname: 'ssl_email_autoneworderresult',
          webhookname: 'ssl_webhook_autoneworderresult',
          emailzt: false,
          webhookzt: false
        },
        {
          name: '自动提交订单结果',
          emailname: 'ssl_email_autosubmitorderresult',
          webhookname: 'ssl_webhook_autosubmitorderresult',
          emailzt: false,
          webhookzt: false
        },
        {
          name: '订单状态变更',
          emailname: 'ssl_email_orderstatuschange',
          webhookname: 'ssl_webhook_orderstatuschange',
          emailzt: false,
          webhookzt: false
        },
        {
          name: 'DNS自动配置任务状态变更',
          emailname: 'ssl_email_autodnstaskstatuschange',
          webhookname: 'ssl_webhook_autodnstaskstatuschange',
          emailzt: false,
          webhookzt: false
        },
        {
          name: '订单即将过期',
          emailname: 'ssl_email_ordernearexpire',
          webhookname: 'ssl_webhook_ordernearexpire',
          emailzt: false,
          webhookzt: false
        },
        {
          name: '证书即将过期',
          emailname: 'ssl_email_certificatenearexpire',
          webhookname: 'ssl_webhook_certificatenearexpire',
          emailzt: false,
          webhookzt: false
        }
      ]
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
              that.setData({
                notices: that.data.notices.map(item => ({
                  ...item,
                  emailzt: res.data.data.noticeSetting.includes(item.emailname),
                  webhookzt: res.data.data.noticeSetting.includes(item.webhookname)
                }))
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
    var name = e.currentTarget.dataset.name
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
      url: 'https://api.zhangls2512.cn/product/updateNoticeSetting',
      method: 'POST',
      data: {
        accessToken: wx.getStorageSync('user').accesstoken,
        noticeName: name
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
      url: '../lj/lj?id=' + encodeURIComponent('https://www.zhangls2512.cn/product/ssl/notice')
    })
  }
})