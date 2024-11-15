Page({
    data: {
        xs: false,
        theme: '',
        suanfa: '',
        array: ['RSA（2048位）', 'RSA（3072位）', 'RSA（4096位）', 'ECDSA（P-256）', 'ECDSA（P-384）'],
        sf: '请选择',
        usex2: false,
        id: '',
        value: 0
    },
    onLoad(t) {
        var that = this
        if (t.id !== undefined) {
            that.setData({
                id: t.id
            })
            if (wx.getStorageSync('user').zt == true) {
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
                    url: 'https://api.dqmybkj.com/sslgetsqinfo',
                    method: 'POST',
                    data: {
                        email: wx.getStorageSync('user').email,
                        password: require('../../password').token(),
                        id: t.id
                    },
                    useHighPerformanceMode: true,
                    enableHttp2: true,
                    enableProfile: false,
                    enableQuic: true,
                    success(res) {
                        wx.hideLoading()
                        if (res.statusCode == 200) {
                            if (res.data.code == 0) {
                                var t = res.data.data.suanfa
                                var q = res.data.data.rootcer
                                if (t == 'rsa2048') {
                                    that.setData({
                                        suanfa: 'rsa2048',
                                        sf: 'RSA（2048位）',
                                        value: 0
                                    })
                                }
                                if (t == 'rsa3072') {
                                    that.setData({
                                        suanfa: 'rsa3072',
                                        sf: 'RSA（3072位）',
                                        value: 1
                                    })
                                }
                                if (t == 'rsa4096') {
                                    that.setData({
                                        suanfa: 'rsa4096',
                                        sf: 'RSA（4096位）',
                                        value: 2
                                    })
                                }
                                if (t == 'ecdsap256') {
                                    that.setData({
                                        suanfa: 'ecdsap256',
                                        sf: 'ECDSA（P-256）',
                                        value: 3
                                    })
                                }
                                if (t == 'ecdsap384') {
                                    that.setData({
                                        suanfa: 'ecdsap384',
                                        sf: 'ECDSA（P-384）',
                                        value: 4
                                    })
                                }
                                if (q == 'ISRG Root X1') {
                                    that.setData({
                                        usex2: false
                                    })
                                }
                                if (q == 'ISRG Root X2') {
                                    that.setData({
                                        usex2: true
                                    })
                                }
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
    },
    onShow() {
        var that = this
        that.setData({
            xs: false,
            theme: wx.getAppBaseInfo().theme
        })
        if (wx.getStorageSync('user').zt == true && that.data.id != '') {
            that.setData({
                xs: true
            })
        }
    },
    picker(e) {
        var t = e.detail.value
        if (t == 0) {
            this.setData({
                suanfa: 'rsa2048',
                sf: 'RSA（2048位）'
            })
        }
        if (t == 1) {
            this.setData({
                suanfa: 'rsa3072',
                sf: 'RSA（3072位）'
            })
        }
        if (t == 2) {
            this.setData({
                suanfa: 'rsa4096',
                sf: 'RSA（4096位）'
            })
        }
        if (t == 3) {
            this.setData({
                suanfa: 'ecdsap256',
                sf: 'ECDSA（P-256）'
            })
        }
        if (t == 4) {
            this.setData({
                suanfa: 'ecdsap384',
                sf: 'ECDSA（P-384）'
            })
        }
    },
    xg() {
        var t = this.data, that = this;
        if (t.suanfa == '') {
            wx.showToast({
                title: '请选择加密算法',
                icon: 'error'
            })
            return
        }
        let usex2a = t.usex2
        const array = ['ecdsap256', 'ecdsap384']
        if (array.includes(t.suanfa) == false) {
            usex2a = false
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
        if (wx.getStorageSync('qxsetting').scfwqh != true) {
            wx.showModal({
                title: '提示',
                content: '“上传数据并将其存储在服务器”权限的“修改申请”场景未开启，无法使用此功能。如需使用此功能，请点击“确定”进入权限管理页面开启“上传数据并将其存储在服务器”权限的“修改申请”场景。',
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
        wx.showLoading({
            title: '修改中',
            mask: true
        })
        wx.request({
            url: 'https://api.dqmybkj.com/sslxgsq',
            method: 'POST',
            data: {
                email: wx.getStorageSync('user').email,
                password: require('../../password').token(),
                id: t.id,
                suanfa: t.suanfa,
                usex2: usex2a
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
                            title: '修改成功'
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
    kg(e) {
        var a = e.detail.value
        this.setData({
            usex2: a
        })
    }
})