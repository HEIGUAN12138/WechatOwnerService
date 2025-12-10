import {debug} from './LogUtil.js'
const W_APP_ID = "wAppId";//微信公众号ID
const OWNER_INFO = "ownerInfo";
const USER_INFO = "userInfo"; // 用户信息
const CURRENT_COMMUNITY_INFO = "currentCommunityInfo"; // 小区信息
const LOGIN_FLAG = 'loginFlag'; //登录标识
const TOKEN = "token"; // token 标识
const OWNER_KEY = "owner_key"; // 业主临时key
const CURRENT_OPEN_ID = "openId";

/**
 * @param {Object} _key 存储键
 * @return {Object} _value 查询到值
 */
export function getStorageSync(_key){
	debug('StorageUtil','getStorageSync',_key);
	
	let _value = uni.getStorageSync(_key);
	
	debug('StorageUtil','getStorageSync',_value);
	
	return _value;
}

/**
 * @description 将数据缓存至 磁盘中
 * @param {Object} _key 存储键
 * @param {Object} _value 存储值
 */
export function setStorageSync(_key,_value){
	debug('StorageUtil','setStorageSync',_key);
	
	uni.setStorageSync(_key,_value);
	
	debug('StorageUtil','setStorageSync',_value);
}

/**
 * 保存业主信息
 * @param {Object} _owner 业主信息
 */
export function saveOwnerStorage(_owner){
	uni.setStorageSync(OWNER_INFO,_owner);
	uni.setStorageSync(USER_INFO, JSON.stringify(_owner));
	let _currentCommunityInfo = {
		communityId: _owner.communityId,
		communityName: _owner.communityName
	};
	uni.setStorageSync(CURRENT_COMMUNITY_INFO, _currentCommunityInfo);
}

/**
 * 保存用户登录状态
 * @param {Object} _userId 用户ID
 */
export function saveUserLoginInfo(_userId,_token,_key){
	let date = new Date();
	let year = date.getFullYear(); //获取当前年份
	let mon = date.getMonth(); //获取当前月份
	let da = date.getDate(); //获取当前日
	let h = date.getHours() + 1; //获取小时
	let m = date.getMinutes(); //获取分钟
	let s = date.getSeconds(); //获取秒
	let afterOneHourDate = new Date(year, mon, da, h, m, s); //30s之后的时间
	wx.setStorageSync(LOGIN_FLAG, {
		sessionKey: _userId,
		expireTime: afterOneHourDate.getTime()
	});
	wx.setStorageSync(TOKEN, _token);
	//保存临时 钥匙
	if(_key){
		wx.setStorageSync(OWNER_KEY, _key);
	}
}

export function removeUserLoginInfo(){
	wx.removeStorageSync(LOGIN_FLAG);
	wx.removeStorageSync(TOKEN);
	wx.removeStorageSync(OWNER_KEY);
}

/**
 * 获取用户信息
 * 
 * add by wuxw 2019-12-28
 */
export function getUserInfo() {
	let _userInfo = wx.getStorageSync(USER_INFO);
	return _userInfo;
};

export function getToken(){
	return wx.getStorageSync(TOKEN)
}

export function getLoginFlag(){
	let loginFlag = wx.getStorageSync(LOGIN_FLAG);
	return loginFlag;
}

export function getOwnerKey(){
	let ownerKey = wx.getStorageSync(OWNER_KEY);
	return ownerKey;
}

/**
 * 获取wAppId
 */
export function getWAppId(){
	return uni.getStorageSync(W_APP_ID)
}

/**
 * 保存wAppId
 * @param {Object} _wAppId wAppId
 */
export function saveWAppId(_wAppId){
	uni.setStorageSync(W_APP_ID, _wAppId)
}

export function saveOpenId(_openId){
	uni.setStorageSync(CURRENT_OPEN_ID, _openId);
}

/**
 * 获取JSON格式的存储数据
 * @param {String} _key 存储键
 * @return {Object} JSON解析后的对象，如果不存在则返回null
 */
export function getJson(_key){
	debug('StorageUtil','getJson',_key);
	
	let _value = uni.getStorageSync(_key);
	
	debug('StorageUtil','getJson',_value);
	
	if(!_value){
		return null;
	}
	
	// 如果已经是对象，直接返回
	if(typeof _value === 'object'){
		return _value;
	}
	
	// 如果是字符串，尝试解析JSON
	if(typeof _value === 'string'){
		try {
			return JSON.parse(_value);
		} catch(e) {
			console.error('JSON解析失败', e);
			return null;
		}
	}
	
	return _value;
}

/**
 * 保存JSON格式的数据到存储
 * @param {String} _key 存储键
 * @param {Object} _value 要存储的对象
 */
export function saveJson(_key,_value){
	debug('StorageUtil','saveJson',_key);
	
	// 如果已经是字符串，直接存储
	if(typeof _value === 'string'){
		uni.setStorageSync(_key, _value);
	} else {
		// 否则序列化为JSON字符串
		uni.setStorageSync(_key, JSON.stringify(_value));
	}
	
	debug('StorageUtil','saveJson',JSON.stringify(_value));
}