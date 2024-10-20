const sm2 = require('sm-crypto').sm2
module.exports = {
	token: function () {
		const password = wx.getStorageSync('user').password
		let pinjieopen = 'sm2' + '\0' + password + '\0' + Date.now()
		let publicKey = '04af5e16abb9b0fec1e423a53a94400b42eb8036176da1434aebdc5ff54afaaa0ef1b34f893e149d35f9df144fe71283411ab1caa0caddd4dd15439d9b0b010db1'
		let pinjieclose = sm2.doEncrypt(pinjieopen, publicKey)
		return pinjieclose
	}
}