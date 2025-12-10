<template>
	<view class="app">
		<!-- 顶部 -->
		<view class="header">
			<view class="header-top">
				<view class="location" @tap="toSelectArea()">
					<view class="location-icon"></view>
					<text>{{selectCommunityName }}</text>
					<view class="location-arrow"></view>
				</view>
				<view class="header-actions">
					<!-- 预留位置，可添加订单、消息等图标 -->
				</view>
			</view>
			<view class="search-wrap">
				<view class="search-bar"  @tap="toSearch()">
					<view class="search-icon"></view>
					<input class="search-input" placeholder="搜索商品" disabled="true" />
					<button class="search-btn" @tap="toSearch()">搜索</button>
				</view>
			</view>
		</view>

		<!-- 顶部分类图标 -->
		<view class="nav-panel">
			<view class="nav-grid">
				<view v-for="(item, index) in categoryList" :key="index" class="nav-item" @tap="_urlJump(item)">
					<view v-if="!item.hktIcon || item.hktIcon === ''" 
						class="nav-icon category-image-bg" 
						:style="{background: getCategoryBgColor(index)}">
					</view>
					<image v-else :src="item.hktIcon" class="nav-icon" @error="_loadDefaultImg(item)"></image>
					<view class="nav-title">{{item.hktName}}</view>
				</view>
			</view>
		</view>

		<!-- 一起拼团 1分抢 -->
		<view class="section" v-if="groupGoodsList && groupGoodsList.length > 0">
			<view class="section-header">
				<text class="section-title-main">一起拼团</text>
				<text class="section-title-highlight">1分抢</text>
				<text class="section-sub">平台补贴 到店立减</text>
				<text class="section-more" @tap="toGroupGoodsList">更多</text>
			</view>
			<scroll-view class="flash-list" scroll-x="true" show-scrollbar="false" enable-flex="true">
				<view v-for="(item, index) in groupGoodsList" :key="index" class="flash-item" @tap="toGroupGoods(item)">
					<view class="flash-tag" v-if="item.userCount">{{item.userCount}}人团</view>
					<view class="flash-img">
						<image :src="item.coverPhoto || noPic" mode="aspectFit" @error="_loadDefaultGroupImg(item)"></image>
					</view>
					<view class="flash-btn">抢</view>
					<view class="flash-info">
						<view class="flash-price-row">
							<text class="flash-price-symbol">￥</text>
							<text class="flash-price">{{item.groupPrice || 0}}</text>
							<text class="flash-old-price" v-if="item.price">￥{{item.price}}</text>
						</view>
						<view class="flash-desc">{{item.prodName || item.prodDesc || '拼团商品'}}</view>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 特价秒杀横滑 -->
		<view class="card-section" v-if="seckillGoodsList && seckillGoodsList.length > 0">
			<view class="card-section-header">
				<view class="card-section-title">特价秒杀</view>
				<view class="card-section-tag">{{curSecHours.name}}专场</view>
			</view>
			<scroll-view class="card-list" scroll-x="true" show-scrollbar="false" enable-flex="true">
				<view v-for="(item, index) in seckillGoodsList" :key="index" class="card-small" @tap="toSeckillGoods(item)">
					<view class="card-small-img">
						<image :src="item.coverPhoto || noPic" mode="aspectFit" @error="_loadDefaultSeckillImg(item)"></image>
					</view>
					<view class="card-small-body">
						<view class="card-small-title">{{item.prodName || '秒杀商品'}}</view>
						<view class="card-small-sub">
							<text class="price-symbol">￥</text><text class="price-main">{{item.killPrice || 0}}</text>
							<text class="price-old" v-if="item.price">￥{{item.price}}</text>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 商品 Feed 列表 -->
		<view class="feed-section" v-if="productList && productList.length > 0">
			<!-- 标签栏 -->
			<view class="goods-cell-title">
				<view 
					v-for="(category, catIndex) in productList" 
					:key="catIndex"
					class="goods-item-title" 
					:class="{ 'selected-title': selectedCategoryIndex === catIndex }"
					@tap="selectCategory(catIndex)">
					<h4 class="h4">{{category.categoryName || '推荐商品'}}</h4>
					<view class="goods-item-subtitle">{{category.categoryDesc }}</view>
				</view>
			</view>
			<!-- 商品列表 -->
			<view class="feed" v-if="currentCategoryProducts && currentCategoryProducts.length > 0">
				<view class="feed-row" v-for="(row, rowIndex) in getProductRows(currentCategoryProducts)" :key="rowIndex">
					<view v-for="(item, itemIndex) in row" :key="itemIndex" class="feed-card" @tap="toGoodsDetail(item)">
						<view class="feed-img">
							<image :src="item.coverPhoto || noPic" mode="aspectFit" @error="_loadDefaultProductImg(item)"></image>
						</view>
						<view class="feed-body">
							<view class="feed-title">{{item.prodName || '商品名称'}}</view>
							<view class="feed-sub" v-if="item.deliveryTime || item.shopName">{{item.deliveryTime || item.shopName}}</view>
							<view class="feed-price-row">
								<text class="price-symbol">￥</text><text class="price-main">{{item.price || 0}}</text>
								<text class="price-old" v-if="item.originalPrice && item.originalPrice > item.price">￥{{item.originalPrice}}</text>
								<text class="price-desc" v-if="item.sales">月销 {{item.sales}}</text>
							</view>
							<view class="feed-meta-row" v-if="item.shopName || item.rating">
								<text class="feed-shop" v-if="item.shopName">{{item.shopName}}</text>
								<view class="feed-meta-dot" v-if="item.shopName && item.rating"></view>
								<text v-if="item.rating">好评 {{item.rating}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getMallIndexCategoryList
	} from '../../api/mall/mallApi.js'
	import {
		sliceArray
	} from '../../lib/java110/utils/ArrayUtil.js';
	import param from '../../constant/param.js';
	import {
		queryGroupGoods,
		queryProductSeckill,
		queryMainCategory,
		queryPhoneMainCategoryProduct
	} from '../../api/goods/goodsApi.js';
	import conf from '../../conf/config.js';
	import {
		getCommunityId,
		getCurCommunity,
		getMallCommunityId,
		getMallCommunityName
	} from '../../api/community/communityApi.js';
	import {
		getJson,
		saveJson
	} from '../../lib/java110/utils/StorageUtil.js';

	export default {
		data() {
			return {
				selectCommunityName: "",
				selectCommunityId: '',
				COMMUNITY_STORAGE_KEY: 'HC_MALL_SELECTED_COMMUNITY', // 小区缓存键
				categoryList: [],
				groupGoodsList: [],
				seckillGoodsList: [],
				productList: [],
				selectedCategoryIndex: 0,
				shopId: param.SHOP_ID_GLOBAL,
				noPic: conf.commonBaseUrl + 'h5/static/noPic.png',
				curSecHours: {},
				secHours: [{
					name: '08:00',
					hours: 8,
				}, {
					name: '10:00',
					hours: 10,
				}, {
					name: '12:00',
					hours: 12,
				}, {
					name: '14:00',
					hours: 14,
				}, {
					name: '15:00',
					hours: 15,
				}, {
					name: '16:00',
					hours: 16,
				}, {
					name: '20:00',
					hours: 20,
				}, {
					name: '22:00',
					hours: 22,
				}],
				// 预设的背景颜色数组，用于没有图片时显示
				categoryBgColors: [
					'linear-gradient(135deg, #ff6b6b, #fa2e1b)',
					'linear-gradient(135deg, #ff5252, #fa2e1b)',
					'linear-gradient(135deg, #7dd5ff, #36a7ff)',
					'linear-gradient(135deg, #ff4757, #fa2e1b)',
					'linear-gradient(135deg, #ff6b6b, #fa2e1b)',
					'linear-gradient(135deg, #ff5252, #fa2e1b)',
					'linear-gradient(135deg, #ff7ae0, #ff49b4)',
					'linear-gradient(135deg, #ff6b6b, #fa2e1b)',
					'linear-gradient(135deg, #ff9ec5, #ff657a)',
					'linear-gradient(135deg, #ff5252, #fa2e1b)',
					'linear-gradient(135deg, #66b6ff, #3388ff)',
					'linear-gradient(135deg, #35d6ff, #1d9dff)',
					'linear-gradient(135deg, #5ec8ff, #297fff)',
					'linear-gradient(135deg, #ff6b6b, #fa2e1b)',
					'linear-gradient(135deg, #ff5252, #fa2e1b)'
				]
			}
		},
		onLoad(options) {
			// #ifdef MP
			uni.setNavigationBarColor({
				frontColor: '#ffffff',
				backgroundColor: '#fa2e1b',
			})
			// #endif
			this._loadCommunityInfo();
			this._getCategoryList();
			this._getGroupGoodsList();
			this.computeCurHours();
			this._getSeckillGoodsList();
			this._getRecommendProduct();
		},
			onShow() {
				// 页面显示时检查小区是否变化
				// 使用 getMallCommunityName 快速获取小区名称
				this.selectCommunityName = getMallCommunityName() || "雪峰商贸城";
				this._loadCommunityInfo();
			},
		methods: {
			// 加载小区信息（从缓存读取）
			_loadCommunityInfo() {
				let _that = this;
				// 优先从 _selectCommunity 读取（选择小区页面存储的）
				let community = uni.getStorageSync("_selectCommunity");
				if (community && community.communityId) {
					this.selectCommunityId = community.communityId;
					this.selectCommunityName = community.name || "雪峰商贸城";
					// 保存到自定义缓存键
					saveJson(this.COMMUNITY_STORAGE_KEY, {
						communityId: community.communityId,
						communityName: community.name
					});
					// 重新加载数据
					this._getGroupGoodsList();
					this._getSeckillGoodsList();
					this._getRecommendProduct();
					return;
				}
				
				// 使用 getCurCommunity 获取当前小区信息
				getCurCommunity().then(function(communityInfo) {
					if (communityInfo && communityInfo.communityId) {
						_that.selectCommunityId = communityInfo.communityId;
						_that.selectCommunityName = communityInfo.communityName || "雪峰商贸城";
						// 保存到自定义缓存键
						saveJson(_that.COMMUNITY_STORAGE_KEY, {
							communityId: communityInfo.communityId,
							communityName: communityInfo.communityName
						});
					}
				}).catch(function(err) {
					console.error('获取小区信息失败', err);
					// 如果获取失败，尝试使用 getMallCommunityName
					_that.selectCommunityName = getMallCommunityName() || "雪峰商贸城";
					_that.selectCommunityId = getMallCommunityId() || '';
				});
			},
			// 获取当前小区ID（用于查询）
			_getCurrentCommunityId() {
				if (this.selectCommunityId && this.selectCommunityId !== '9999') {
					return this.selectCommunityId;
				}
				// 兼容旧逻辑
				let communityId = getCommunityId();
				if (communityId == '9999') {
					return '';
				}
				return communityId || '';
			},
			_getCategoryList() {
				let _that = this;
				let params = {
					page: 1,
					row: 100,
					isShow: "Y",
					shopId: param.SHOP_ID_GLOBAL,
					typeCd: param.MENU_TYPE.SHOP
				}
				getMallIndexCategoryList(params)
					.then(function(result) {
						let categoryData = result.data || [];
						// 将数据扁平化，不再分组
						_that.categoryList = categoryData;
					})
					.catch(function(err) {
						console.error('获取菜单列表失败', err);
					});
			},
			_urlJump: function(_menu) {
				if (!_menu) return;
				
				if (_menu.skipType == 2) {
					// 站外
					let url = encodeURIComponent(_menu.url);
					this.vc.navigateTo({
						url: '/pages/hcWebView/hcWebView?url=' + url
					});
				} else if (_menu.skipType == 1 ) {
					// 站内
					this.vc.navigateToMall({
						url: _menu.url
					});
				} else if (_menu.skipType == '3') {
					// 商城商品列表
					let _url = "/pages/goods/goodsList?hktId=" + _menu.hktId;
					this.vc.navigateToMall({
						url: _url
					});
				} else if (_menu.skipType == 'S') {
					// 商城页面
					this.vc.navigateToMall({
						url: _menu.url
					});
				}else if (_menu.skipType == '5') {
					
					this.vc.navigateToMall({
						url: _menu.url
					});
				}  else {
					return;
				}
			},
			_loadDefaultImg: function(item) {
				// 图片加载失败时，清空图片路径，让组件显示背景颜色
				if (item) {
					item.hktIcon = "";
				}
			},
			// 根据索引获取背景颜色
			getCategoryBgColor: function(index) {
				return this.categoryBgColors[index % this.categoryBgColors.length];
			},
			//搜索跳转
			toSearch(e) {
				this.vc.navigateToMall({
					url: '/pages/goods/HM-search?searchType=3'
				});
			},
			//切换小区
			toSelectArea(e) {
				this.vc.navigateTo({
					url: `/pages/mall/selectcommunity`
				}, true);
			},
			// 获取拼团商品列表
			_getGroupGoodsList() {
				let _that = this;
				let communityId = this._getCurrentCommunityId();
				queryGroupGoods({
					page: 1,
					row: 10,
					shopId: '',
					communityId: communityId
				}).then(function(data) {
					_that.groupGoodsList = data || [];
				}).catch(function(err) {
					console.error('获取拼团商品失败', err);
					_that.groupGoodsList = [];
				});
			},
			// 跳转到拼团商品详情
			toGroupGoods(item) {
				if (!item) return;
				this.vc.navigateToMall({
					url: '/pages/goods/groupGoods?productId=' + item.productId + 
						"&groupId=" + (item.groupId || '') + 
						"&shopId=" + (item.shopId || this.shopId)
				});
			},
			// 跳转到拼团商品列表
			toGroupGoodsList() {
				this.vc.navigateToMall({
					url: '/pages/goods/groupGoodsList?shopId=' 
				});
			},
			// 拼团商品图片加载失败
			_loadDefaultGroupImg(item) {
				if (item) {
					item.coverPhoto = this.noPic;
				}
			},
			// 计算当前秒杀时段
			computeCurHours() {
				let _date = new Date();
				let _curHours = _date.getHours();
				this.curSecHours = this.secHours[0];
				let _break = false;
				this.secHours.forEach(_hours => {
					if (_break) {
						return;
					}
					if (_hours.hours >= _curHours) {
						this.curSecHours = _hours;
						_break = true;
					}
				});
			},
			// 获取秒杀商品列表
			_getSeckillGoodsList() {
				let _that = this;
				if (!this.curSecHours || !this.curSecHours.hours) {
					return;
				}
				let communityId = this._getCurrentCommunityId();
				queryProductSeckill({
					page: 1,
					row: 10,
					killHours: this.curSecHours.hours,
					shopId: '',
					communityId: communityId,
					validData: 'Y'
				}).then(function(data) {
					_that.seckillGoodsList = data || [];
				}).catch(function(err) {
					console.error('获取秒杀商品失败', err);
					_that.seckillGoodsList = [];
				});
			},
			// 跳转到秒杀商品详情
			toSeckillGoods(item) {
				if (!item) return;
				this.vc.navigateToMall({
					url: '/pages/goods/seckillGoods?productId=' + item.productId + 
						"&shopId=" + (item.shopId || this.shopId) + 
						"&killId=" + (item.killId || '')
				});
			},
			// 秒杀商品图片加载失败
			_loadDefaultSeckillImg(item) {
				if (item) {
					item.coverPhoto = this.noPic;
				}
			},
			// 获取推荐商品列表（只获取分类列表，不查询商品）
			_getRecommendProduct() {
				let _that = this;
				let communityId = this._getCurrentCommunityId();
				
				// 只获取专区目录列表
				let categoryParams = {
					page: 1,
					row: 100,
					communityId: communityId,
					categoryType: ''
				};
				
				queryMainCategory(categoryParams)
					.then(function(categories) {
						if (!categories || categories.length === 0) {
							_that.productList = [];
							return;
						}
						
						// 只初始化分类列表，不查询商品
						_that.productList = categories.map(function(category) {
							return {
								categoryId: category.mainCategoryId || category.categoryId || category.id,
								categoryName: category.categoryName || category.name,
								categoryDesc: category.categoryDesc || category.desc || '',
								mainCategoryProducts: [] // 初始为空，点击后再加载
							};
						});
						
						// 默认选中第一个分类并加载其商品
						if (_that.productList.length > 0) {
							_that.selectedCategoryIndex = 0;
							_that._loadCategoryProducts(0);
						}
					})
					.catch(function(err) {
						console.error('获取专区目录失败', err);
						_that.productList = [];
					});
			},
			// 加载指定分类的商品（每次点击都重新请求）
			_loadCategoryProducts(categoryIndex) {
				let _that = this;
				let category = this.productList[categoryIndex];
				if (!category) {
					// 如果分类不存在，直接返回
					return;
				}
				
				let communityId = this._getCurrentCommunityId();
				
				let mainCategoryId = category.categoryId;
				
				// 每次点击都重新请求后端
				queryPhoneMainCategoryProduct({
					page: 1,
					row: 20,
					communityId: communityId,
					mainCategoryId: mainCategoryId
				}).then(function(result) {
					let products = [];
					
					// 处理返回的数据格式
					if (Array.isArray(result)) {
						products = result;
					} else if (result && result.data) {
						if (Array.isArray(result.data)) {
							products = result.data;
						} else {
							products = result.data.mainCategoryProducts || result.data.products || [];
						}
					} else if (result && result.mainCategoryProducts) {
						products = result.mainCategoryProducts || [];
					}
					
					// 更新分类的商品列表
					_that.$set(category, 'mainCategoryProducts', products);
				}).catch(function(err) {
					console.error('获取专区商品失败', err);
					_that.$set(category, 'mainCategoryProducts', []);
				});
			},
			// 跳转到商品详情
			toGoodsDetail(item) {
				if (!item) return;
				this.vc.navigateToMall({
					url: '/pages/goods/goods?productId=' + item.productId + 
						"&shopId=" + (item.shopId || this.shopId)
				});
			},
			// 商品图片加载失败
			_loadDefaultProductImg(item) {
				if (item) {
					item.coverPhoto = this.noPic;
				}
			},
			// 将商品列表按每行2个分组
			getProductRows(products) {
				if (!products || products.length === 0) {
					return [];
				}
				let rows = [];
				for (let i = 0; i < products.length; i += 2) {
					rows.push(products.slice(i, i + 2));
				}
				return rows;
			},
			// 选择分类标签
			selectCategory(index) {
				this.selectedCategoryIndex = index;
				// 如果该分类的商品还未加载，则加载
				this._loadCategoryProducts(index);
			},
			// 获取默认副标题
			getDefaultSubtitle(index) {
				const defaultSubtitles = ['精品推荐', '便宜好货', '国际自营', '冬季热卖', '限时特惠', '新品上市', '热销榜单', '精选好物'];
				return defaultSubtitles[index % defaultSubtitles.length] || '推荐商品';
			}
		},
		computed: {
			// 当前选中分类的商品列表
			currentCategoryProducts() {
				if (!this.productList || this.productList.length === 0) {
					return [];
				}
				const selectedCategory = this.productList[this.selectedCategoryIndex];
				if (!selectedCategory) {
					return [];
				}
				return selectedCategory.mainCategoryProducts || [];
			}
		}
	}
</script>

<style lang="css">
	@import "./mall.css";
</style>
