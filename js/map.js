"use strict";

/**
 * Draggable Map.
 * Click a pin to raise modal dialog with pin details.
 * Click map key link to `scroll` map to pin and show details.
 * Singleton Map object;
 * @author lokidokicoki@gmail.com
 * @version 1.0
 */
function Map () {
	// cache `this` in self
	var self = null;

	// settings for animation speed and easing type, can be overridden in `init`
	var settings = {animSpeed:5000, easing:'linear', map:'worldmap', links:'links', pinText:true};

	// cache dimensions of container
	var containerDims = [0,0];

	// cache dimensions of container
	var detailsDims = [0,0,0,0]; //w,h,x,y

	// map pin details
  	// pin = {id: 'pin01', x:2351, y:643, data:'data/01.html', tip:'A Pin'},
	var pins = null;

	// pin offset
	var dx=0;
	var dy=0;

	// current selected pin
	var currentPin = null;

	return {
		/**
		 * copy object data from src to dest.
		 */
		augment : function (src, dest) {
			for (var key in src) {
        		dest[key] = src[key];
    		}
			return dest;
		},

		/**
		 * Initialise map object.
		 * Create pin markers
		 * Create mapkey side bar entries
		 */
		init : function (data, args) {
			self = this;
			if (data === undefined){
				alert('no data array passed to Map.init()');
			}

			pins = data;
			if (args !== undefined){
				settings = self.augment(args, settings);	
			}

			// cache div dimensions, TODO: handle resize events
			containerDims[0] = $('#container').width()/2;
			containerDims[1] = $('#container').height()/2;
			detailsDims[0] = $('#pinDetails').width()/2;
			detailsDims[1] = $('#pinDetails').height()/2;

			// find width & height of pin image.
			//http://stackoverflow.com/questions/5841635/how-to-get-css-width-of-class
			// new div, set class, `measure`, remove, ..., profit!
			var div = $('<div>').addClass('pin').hide();
			$('body').append(div);
			dx = div.width()/2;
			dy = div.height();
			div.remove();
			//console.debug($('#pinDetails').offset());
			$("#pinDetails").show();
			var o = $('#pinDetails').offset();
			detailsDims[2] = o.left;
			detailsDims[3] = o.top;
			$("#pinDetails").hide();

			// make map 'draggable'
			$("#worldmap").draggable();

			//sort pin data alphabetically, found here:
			//http://stackoverflow.com/questions/1129216/sorting-objects-in-an-array-by-a-field-value-in-javascript
			pins.sort(function(a,b) {return (a.tip > b.tip) ? 1 : ((b.tip > a.tip) ? -1 : 0);} );

			//build pins & links
			for (var i = 0, len = pins.length; i < len; i++) {
				var pin = pins[i];
				if (!pin.hide || pin.hide === undefined){
					var link = '<p><span class="link" onclick="map.linkClick(\''+pin.id+'\')">'+pin.tip+'</span></p>';
					var marker = '<div id="'+pin.id+'" class="pin" onclick="map.pinClick(\''+pin.id+'\');">';
					if (settings.pinText) {
						marker += pin.tip;
					}
					marker +='</div>';

					$('#worldmap').append(marker).on('mousedown', function () {$('#tooltip').hide()});
					// put pin in right place, effective origin is center-bottom of pin
					$('#'+pin.id).css('left', pin.x - dx).css('top', pin.y - dy).on('mouseenter', {pin:pin}, self.tip);
					$('#links').append(link);
				}
			}
		},

		/**
		 * Get pin details for this id.
		 * return pin of null if not found
		 */
		getPin : function (id) {
			var pin = null;
			for (var i = 0, len = pins.length; i < len; i++) {
				if (pins[i].id === id){
					pin = pins[i];
					break;
				}
			};
			return pin;
		},

		/**
		 * User has clicked a pin.
		 * Find pin and call `details`
		 */
		pinClick : function (id) {
			var pin = self.getPin(id);			
			if (pin){
				self.details(pin);
			}
		},

		/**
		 * User has clicked a link the RHS bar.
		 * Find find, scroll map to show pin, show details.
		 */
		linkClick : function (id) {
			var pin = self.getPin(id);
			if (pin){
				var x = (-1 * (pin.x - dx - detailsDims[0] - detailsDims[2])).toString() + 'px';
				var y = (-1 * (pin.y - dy*2 - detailsDims[1] - detailsDims[3])).toString() + 'px';
				$('#worldmap').animate(
					{left: x, top: y}, 
					settings.animSpeed, 
					settings.easing,
					self.details(pin)
				);
			}
		},

		/**
		 * Show details for pin.
		 */
		details : function (pin, nocache) {
			if (currentPin) {
				$('#'+currentPin.id).removeClass('selected_pin');
			}
			if (!nocache || nocache === undefined){
				currentPin = pin;
				$('#'+currentPin.id).addClass('selected_pin');
			}

			$('#tooltip').hide();
			// requires a webserver to serve the contents of  'link'
			$('#bio').empty().load(pin.link);
			$('#bioTitle').empty().html(pin.tip);
			//$('#pinDetails').css('left', containerDims[0]-detailsDims[0]).css('top', $('#header').height).fadeIn();
			$('#pinDetails').fadeIn();

		},

		hideDetails : function () {
			if (currentPin) {
				$('#'+currentPin.id).removeClass('selected_pin');
				currentPin = null;
			}
			$('#pinDetails').fadeOut();
		},

		/**
		 * Show tip next to pin on hover.
		 * @param event jquery event
		 */
		tip : function (event) {
			var pin = event.data.pin;
			var frag = pin.tip;// + '<p/><span class="link" onclick="alert(pin.id);map.linkClick(\''+pin.id+'\');">Click for bio</span>';
			// NB: we use inline-table to 'shrink-wrap' the tooltip, 'inline' or 'block' causes text wrapping, not desired!
			$('#tooltip').empty().html(frag).css('left', pin.x-dx+30).css('top', pin.y-dy).css('display', 'inline-table');
		}
	};
};

// construct Map object
var map = Map();