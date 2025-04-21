Page({
	icp() {
		this.pageRouter.navigateTo({
			url: '../lj/lj?id=' + encodeURIComponent('https://beian.miit.gov.cn/#/Integrated/recordQuery')
		})
	},
	ga() {
		this.pageRouter.navigateTo({
			url: '../lj/lj?id=' + encodeURIComponent('https://beian.mps.gov.cn/#/query/appletSearch')
		})
	},
	tscj() {
		this.pageRouter.navigateTo({
			url: '../tscj/tscj'
		})
	},
	xmbaxk(e) {
		var t = e.currentTarget.dataset.id
		this.pageRouter.navigateTo({
			url: '../lj/lj?id=' + encodeURIComponent('https://www.zhangls2512.cn/product/baxk/jqcx?baxknumber=' + t)
		})
	}
})