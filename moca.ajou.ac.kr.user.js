// ==UserScript==
// @name        moca.ajou.ac.kr
// @namespace   Violentmonkey Scripts
// @match       https://moca.ajou.ac.kr/member/rl/content/info/view.do*
// @grant       none
// @version     1.0
// @author      -
// @description 3/28/2024, 9:10:56 PM
// ==/UserScript==

cPlyr.setEvent = function(opt, type) {
	var supposedCurrentTime = 0;
	var canplay = false;
	var opts = Object.assign({}, cPlyr.defaultEventOpts, opt);

	cPlyr.player.on('ended', function(e) {
		if(opts.endCallback) {
			opts.endCallback({vodInfo : cPlyr.player});
		}
	});

	cPlyr.player.on((type == 'YOUTUBE' ? 'ready' : 'canplay'), function() {
    cPlyr.player.volume = 0.5;
		if(!canplay) {
			if(type!='YOUTUBE') { cPlyr.player.stop(); };
			if(opts.progTime > 0 && opts.lastPlay) {
				cPlyr.player.currentTime = opts.progTime;
				supposedCurrentTime = opts.progTime;
			}
			if(opts.autoPlay) {
				cPlyr.player.muted = true;
				cPlyr.player.play();
				//cPlyr.player.volume = cPlyr.player.volume;
				//cPlyr.player.muted = false;
			}
		}
		canplay = true;
	});

	cPlyr.player.on('timeupdate', function() {
		if(opts.previewTime) {
			if(opts.previewTime <= Math.round(cPlyr.player.currentTime)) {
				opts.previewCallback(cPlyr.player);
				return;
			}
		}
		if (!cPlyr.player.seeking) {
			if(supposedCurrentTime == Math.round(cPlyr.player.currentTime)) {
				return;
			}
			supposedCurrentTime = Math.round(cPlyr.player.currentTime);
			if(opts.callbackType=='live') {
				opts.progTime = Math.round(cPlyr.player.currentTime);
				if(opts.playCallback && opts.progTime % opts.playCallbackIntervalTime == 0) {
					opts.playCallback({vodInfo : cPlyr.player, progTime : opts.progTime})
				}
			} else {
				if(cPlyr.player.currentTime > opts.progTime) {
					opts.progTime = Math.round(cPlyr.player.currentTime);
					if(opts.playCallback && opts.progTime % opts.playCallbackIntervalTime == 0) {
						opts.playCallback({vodInfo : cPlyr.player, progTime : opts.progTime})
					}
				}
			}
		}
	});

	cPlyr.player.on('seeking', function() {
		if(!opts.seek) {
			if(opts.previewTime) {
				if (Math.abs(cPlyr.player.currentTime - supposedCurrentTime) > 0.01 && opts.previewTime < cPlyr.player.currentTime) {
					cPlyr.player.currentTime = opts.progTime;
				}
			} else if(opts.progSeek && Math.abs(cPlyr.player.currentTime - supposedCurrentTime) > 0.01) {
				if (Math.abs(cPlyr.player.currentTime - supposedCurrentTime) > 0.01 && opts.progTime < cPlyr.player.currentTime) {
					cPlyr.player.currentTime = opts.progTime;
				}
			} else if (Math.abs(cPlyr.player.currentTime - supposedCurrentTime) > 0.01) {
				cPlyr.player.currentTime = supposedCurrentTime;
			}
		}
	});

	cPlyr.player.on('seeked', function() {
		if(opts.seekCallback && cPlyr.player.currentTime != 0) {
			cPlyr.eventSettingValue.seeked.c1 += 1;
			if(cPlyr.eventSettingValue.seeked.mk) {
				cPlyr.eventSettingValue.seeked.mk = false;
				customOneAct(function(){
					opts.seekCallback({vodInfo : cPlyr.player});
				});
			}
		}
	});

	cPlyr.player.on('error', function(e) {
		//alert("동영상을 플레이 할 수 없습니다.");
	});
};
