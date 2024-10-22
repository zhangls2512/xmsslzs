Page({
  data: {
    xs: false,
    theme: '',
    ma: '',
    mb: '',
    mc: ''
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
  tj() {
    var t = this.data, that = this;
    if (t.ma == '') {
      wx.showToast({
        title: '请填写原密码',
        icon: 'error'
      })
      return
    }
    if (t.mb == '') {
      wx.showToast({
        title: '请填写新密码',
        icon: 'error'
      })
      return
    }
    if (t.ma == t.mb) {
      wx.showToast({
        title: '新密码不能与原密码相同',
        icon: 'none'
      })
      return
    }
    if (t.mc == '') {
      wx.showToast({
        title: '请再次填写新密码',
        icon: 'none'
      })
      return
    }
    if (t.mb != t.mc) {
      wx.showToast({
        title: '两次输入的新密码不一致',
        icon: 'none'
      })
      return
    }
    if (wx.getStorageSync('qxsetting').scfwq != true) {
      wx.showModal({
        title: '提示',
        content: '“上传数据并将其存储在服务器”权限未开启，无法使用此功能。如需使用此功能，请点击“确定”进入权限管理页面开启“上传数据并将其存储在服务器”权限。',
        success(res) {
          if (res.confirm) {
            that.router.navigateTo({
              url: '../qxgl/qxgl'
            })
          }
        }
      })
      return
    }
    if (wx.getStorageSync('qxsetting').scfwqd != true) {
      wx.showModal({
        title: '提示',
        content: '“上传数据并将其存储在服务器”权限的“修改密码”场景未开启，无法使用此功能。如需使用此功能，请点击“确定”进入权限管理页面开启“上传数据并将其存储在服务器”权限的“修改密码”场景。',
        success(res) {
          if (res.confirm) {
            that.router.navigateTo({
              url: '../qxgl/qxgl'
            })
          }
        }
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
    const sm2 = require('sm-crypto').sm2
    const sm3 = require('sm-crypto').sm3
    let oldpasswordhash = sm3(t.ma)
    let newpasswordhash = sm3(t.mb)
    let oldpinjieopen = 'sm2' + '\0' + oldpasswordhash + '\0' + Date.now()
    let newpinjieopen = 'sm2' + '\0' + newpasswordhash + '\0' + Date.now()
    let publicKey = '04af5e16abb9b0fec1e423a53a94400b42eb8036176da1434aebdc5ff54afaaa0ef1b34f893e149d35f9df144fe71283411ab1caa0caddd4dd15439d9b0b010db1'
    let oldpinjieclose = sm2.doEncrypt(oldpinjieopen, publicKey)
    let newpinjieclose = sm2.doEncrypt(newpinjieopen, publicKey)
    wx.showLoading({
      title: '修改中',
      mask: true
    })
    wx.request({
      url: 'https://api.dqmybkj.com/sslxgmm',
      method: 'POST',
      data: {
        email: wx.getStorageSync('user').email,
        oldpassword: oldpinjieclose,
        newpassword: newpinjieclose
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
  },
  tz() {
    this.router.navigateTo({
      url: '../zccz/zccz'
    })
  }
})