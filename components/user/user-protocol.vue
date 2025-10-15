<template>
	<view>
		<view class="padding flex justify-start">
			<checkbox-group @change="_changeReadme">
				<checkbox style="transform: scale(0.7)" :checked="readme" value="readme"></checkbox>
			</checkbox-group>
			<view class="read-me">
				<text class="margin-left-xs">我已阅读并同意</text>
				<text class="user-read" @click="_readMe('protocol')">《用户协议》</text>
				<text >和</text>
				<text class="user-read" @click="_readMe('secure')">《隐私政策》</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name:"user-protocol",
		data() {
			return {
				readme:false,
			};
		},
		methods:{
			_readMe:function(_type){
				uni.navigateTo({
					url:'/pages/login/registerProtocol?type='+_type
				})
			},
			_changeReadme:function(e){
				if(e.detail.value && e.detail.value.length>0){
					this.readme = true;
				}else{
					this.readme =false;
				}
				this.$emit('readme',this.readme)
			},
		}
	}
</script>

<style>
	.read-me{
		line-height: 64upx;
	}
	
	.user-read{
		margin-left: 10upx;
		color: darkgreen;
	}
</style>