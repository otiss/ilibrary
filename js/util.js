(function() {
	var Tween = {
			Linear : function(t, b, c, d) {
				return c * t / d + b;
			},
			Quad : {
				easeIn : function(t, b, c, d) {
					return c * (t /= d) * t + b;
				},
				easeOut : function(t, b, c, d) {
					return -c * (t /= d) * (t - 2) + b;
				},
				easeInOut : function(t, b, c, d) {
					if ((t /= d / 2) < 1)
						return c / 2 * t * t + b;
					return -c / 2 * ((--t) * (t - 2) - 1) + b;
				}
			},
			Cubic : {
				easeIn : function(t, b, c, d) {
					return c * (t /= d) * t * t + b;
				},
				easeOut : function(t, b, c, d) {
					return c * (( t = t / d - 1) * t * t + 1) + b;
				},
				easeInOut : function(t, b, c, d) {
					if ((t /= d / 2) < 1)
						return c / 2 * t * t * t + b;
					return c / 2 * ((t -= 2) * t * t + 2) + b;
				}
			},
			Quart : {
				easeIn : function(t, b, c, d) {
					return c * (t /= d) * t * t * t + b;
				},
				easeOut : function(t, b, c, d) {
					return -c * (( t = t / d - 1) * t * t * t - 1) + b;
				},
				easeInOut : function(t, b, c, d) {
					if ((t /= d / 2) < 1)
						return c / 2 * t * t * t * t + b;
					return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
				}
			}
		};
	if (!document.querySelector) {
		return;
	}
	HTMLElement.prototype.addClass = function(cls) {
		if (!this) {
			return;
		}
		if (!this.hasClass(cls)) {
			this.className += " "+cls;
		}
		return this;
	};
	HTMLElement.prototype.hasClass = function(cls) {
		if (!this) {
			return;
		}
		return this.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
	};
	HTMLElement.prototype.removeClass = function(cls) {
		if (!this) {
			return;
		}
		if (this.hasClass(cls)) {
			var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
			this.className = this.className.replace(reg, ' ');
		}
		return this;
	};
	HTMLElement.prototype.html = function(html) {
		if (!this) {
			return;
		}
		this.innerHTML = html;
		return this;
	};
	var $ = function(str) {
		var elm = document.querySelector(str);
		if (!elm) {
			return {};
		}
		return elm;
	};
	var $layer,
		$noti,
		util = {
			show_layer: function() {
				if (!$layer) {
					$layer = $('#layer-view');
				}
				$layer.removeClass('hide');
			},
			hide_layer: function() {
				if (!$layer) {
					$layer = $('#layer-view');
				}
				$layer.addClass('hide');
			},
			noti: {
				_data_handler_timeout: null,
				show: function(words, timeout) {
					if (!words || /^\s$/.test(words)) {
						return;
					}
					if (!$noti) {
						$noti = $('#tip-noti');
					}
					clearTimeout(this._data_handler_timeout);
					util.show_layer();
					$noti.html(words).removeClass('hide');
					if (timeout) {
						var that = this;
						this._data_handler_timeout = setTimeout(function() {
							that.hide();
						}, timeout);
					}
				},
				hide: function() {
					if (!$noti) {
						$noti = $('#tip-noti');
					}
					util.hide_layer();
					$noti.addClass('hide').html('');
					clearTimeout(this._data_handler_timeout);
				},
				clear: function() {
					util.hide_layer();
					clearTimeout(this._data_handler_timeout);
				}
			}
	};
	window.UTIL = util;
})();
