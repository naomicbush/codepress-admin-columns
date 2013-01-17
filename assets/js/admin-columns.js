(function($){

	/*
	 *  Exists
	 *
	 *  @since 			1.5
	 *  @description	returns true or false on a element's existance
	 */

	$.fn.exists = function()
	{
		return $(this).length>0;
	};

	/*
	 *	Fires when the dom is ready
	 *
	 */
	$(document).ready(function()
	{
		if ( ! $('#cpac').exists )
			return false;

		cpac_sortable();
		cpac_box_events();
		cpac_menu();
		cpac_add_custom_column();
		cpac_clear_input_defaults();
		cpac_addon_activation();
		cpac_width_range();
		cpac_pointer();
		cpac_help();
		cpac_sidebar_scroll();
		cpac_change_label();
		cpac_custom_image_size();
		cpac_export_multiselect();
		cpac_import();
	});

	/*
	 * Sortable
	 *
	 * @since 1.5
	 */
	function cpac_sortable()
	{
		$('.cpac-columns').sortable({
			handle: 'td.column_sort',
			placeholder: 'cpac-placeholder',
			forcePlaceholderSize: true
		});
	}

	/*
	 * Open Form
	 *
	 * @since 1.5
	 */
	function open_form( e ) {
		var box = $(e).closest('.cpac-column');

		$('.column-form', box).slideToggle(150, function() {
			box.toggleClass('opened');
		});
	}

	/*
	 * Open and close box
	 *
	 * @since 1.5
	 */
	function cpac_box_events()
	{
		// fold in/out
		$('.column_edit').unbind('click').click( function(){
			open_form( this );
		});

		$('.column_label a').unbind('click').click( function(){
			open_form( this );
		});

		// remove custom field box
		$('#cpac .cpac-delete-custom-field-box').unbind('click').click(function(e){

			var el = $(this).closest('div.cpac-column');

			el.addClass('deleting').animate({
				opacity : 0,
				height: 0
			}, 350, function() {
				el.remove();
			});

			e.preventDefault();
		});

		// set state
		$('.column-meta td').not('.column_edit, .column_sort').unbind('click').click( function(e) {

			// make sure the TD itself is clicked and not a child element
			if ( this != e.target )
				return;

			var box 	= $(this).closest('.cpac-column');
			var state	= $('.cpac-state', box);
			var value 	= state.attr('value');

			// toggle on
			if ( value != 'on') {
				box.addClass('active');
				state.attr('value', 'on');
			}

			// toggle off
			else {
				box.removeClass('active');
				state.attr('value', '');
			}
		});
	}

	/*
	 * Menu
	 *
	 * @since 1.5
	 */
	function cpac_menu()
	{
		// click
		$('#cpac .cpac-menu a').click( function(e, el) {

			var id = $(this).attr('href');

			if ( id ) {

				var type = id.replace('#cpac-box-','');

				// remove current
				$('.cpac-menu a').removeClass('current');
				$('.columns-container').hide();

				// set current
				$(this).addClass('current');
				$('.columns-container[data-type="' + type + '"]').show();
			}

			e.preventDefault();
		});
	}

	/*
	 *	add custom columns
	 *
	 */
	function cpac_add_custom_column()
	{
		$('.add-customfield-column').click(function(e){
			e.preventDefault();

			var list 		= $(this).closest('.cpac-boxes').find('.cpac-columns');
			var metafields 	= $('.cpac-box-metafield', list);

			// get unique ID number...
			var ids = [];
			metafields.each(function(k,v) {
				var classes = $(v).attr('class').split(' ');

				$.each(classes, function(kc,vc){
					if ( vc.indexOf('cpac-box-column-meta-') === 0 ) {
						var id = vc.replace('cpac-box-column-meta-','');
						if ( id )
							ids.push(id);
					}
				});
			});

			// ...and sort them
			ids.sort(sortNumber);

			if ( !ids )
				return;

			function sortNumber(a,b) {
				return b - a;
			}

			// ID's
			var id 		= parseFloat(ids[0]);
			var new_id 	= id + 1;

			// Clone
			var clone = $( '.cpac-box-column-meta-' + id, list ).clone();

			// Toggle class
			$(clone).removeClass('cpac-box-column-meta-' + id );
			$(clone).addClass('cpac-box-column-meta-' + new_id );

			// Replace inputs ID's
			var inputs = $(clone).find('input, select');
			$(inputs).each(function(ik, iv){
				$(iv).attr('name', $(iv).attr('name').replace(id, new_id) );
				$(iv).attr('id', $(iv).attr('id').replace(id, new_id) );
			});

			// Replace label ID's
			var labels = $(clone).find('label');
			$(labels).each(function(ik, iv){
				var attr_for = $(iv).attr('for');
				if ( attr_for ) {
					$(iv).attr('for', attr_for.replace(id, new_id) );
				}
			});

			// remove description
			clone.find('.remove-description').remove();

			// change label text
			clone.find('td.column_label a, tr.column_label input.text').text(cpac_i18n.customfield);
			clone.find('tr.column_label input.text').val(cpac_i18n.customfield);

			// add remove button
			if ( clone.find('.cpac-delete-custom-field-box').length == 0 ) {
				var remove = '<p><a href="javascript:;" class="cpac-delete-custom-field-box button">' + cpac_i18n.remove + '</a>';
				clone.find('tr.column_action td.input').append(remove);
			}

			// add cloned box to the list
			list.append(clone);

			// retrigger events
			cpac_box_events();
			cpac_change_label();
			cpac_width_range();
			cpac_custom_image_size();

			// open
			open_form( clone );

			// focus on clone
			$('html,body').animate({ scrollTop: clone.offset().top }, 'slow');
		});
	}

	/*
	 *	Clear Input Defaults
	 *
	 */
	function cpac_clear_input_defaults()
	{
		$.fn.cleardefault = function() {
			return this.focus(function() {
				if( this.value == this.defaultValue ) {
					this.value = "";
				}
			}).blur(function() {
				if( !this.value.length ) {
					this.value = this.defaultValue;
				}
			});
		};
		$("#cpac-box-plugin_settings .addons input").cleardefault();
	}

	/*
	 *	Width range
	 *
	 */
	function cpac_width_range()
	{
		if ( $('.input-width-range').length == false )
			return;

		// loop through all width-range-sliders
		$('.input-width-range').each( function(){

			var input 				= $(this).closest('td').find('.input-width');
			var descr 				= $(this).closest('td').find('.width-decription');
			var input_default 		= $(input)[0].defaultValue;
			var translation_default = descr.attr('title');

			// add slider
			$(this).slider({
				range: 	'min',
				value: 	1,
				min: 	0,
				max: 	100,
				value:  input_default,
				slide: function( event, ui ) {

					// set default
					var descr_value = ui.value > 0 ? ui.value + '%' : translation_default;

					// set input value
					$(input).val( ui.value );

					// set description
					$(descr).text( descr_value );
				}
			});
		});
	}

	/*
	 *	Addon actviate/deactivate
	 *
	 */
	function cpac_addon_activation()
	{
		$('.addons .activation_code a.button').click(function(e) {
			e.preventDefault();

			// get input values
			var row			 = $(this).closest('tr');
			var type		 = $(row).attr('id').replace('activation-','');
			var parent_class = $(this).parent('div');
			var msg 		 = $(row).find('.activation-error-msg');

			// reset
			$(msg).empty();

			// Activate
			if ( parent_class.hasClass('activate') ) {

				// get input values
				var input 		= $('.activate input', row);
				var button 		= $('.activate .button', row);
				var key 		= input.val();
				var default_val = $(input)[0].defaultValue;

				// make sure the input value has changed
				if ( key == default_val ) {
					$(msg).text(cpac_i18n.fill_in).hide().fadeIn();
					return false;
				}

				// set loading icon
				button.addClass('loading');

				// update key
				$.ajax({
					url 		: ajaxurl,
					type 		: 'POST',
					dataType 	: 'json',
					data : {
						action  : 'cpac_addon_activation',
						type	: 'sortable',
						key		: key
					},
					success: function(data) {
						if ( data != null ) {
							$('div.activate', row).hide(); // hide activation button
							$('div.deactivate', row).show(); // show deactivation button
							$('div.deactivate span.masked_key', row).text(data); // display the returned masked key
						} else {
							$(msg).text(cpac_i18n.unrecognised).hide().fadeIn();
						}
					},
					error: function(xhr, ajaxOptions, thrownError) {
						//console.log(xhr);
						//console.log(ajaxOptions);
						//console.log(thrownError);
						$(msg).text(cpac_i18n.unrecognised).hide().fadeIn();
					},
					complete: function() {
						button.removeClass('loading');
					}
				});
			}

			// Deactivate
			if ( parent_class.hasClass('deactivate') ) {

				var button = $('.deactivate .button', row);
				var input  = $('.activate input', row);

				// set loading icon
				button.addClass('loading');

				// update key
				$.ajax({
					url 		: ajaxurl,
					type 		: 'POST',
					dataType 	: 'json',
					data : {
						action  : 'cpac_addon_activation',
						type	: 'sortable',
						key		: 'remove'
					},
					success: function(data) {
						$('div.activate', row).show(); // show activation button
						$('div.deactivate', row).hide(); // hide deactivation button
						$('div.deactivate span.masked_key', row).empty(); // remove masked key
						input.val('');
					},
					error: function(xhr, ajaxOptions, thrownError) {
						//console.log(xhr);
						//console.log(ajaxOptions);
						//console.log(thrownError);
					},
					complete: function() {
						button.removeClass('loading');
					}
				});
			}
		});
	}
		
	/*
	 * Help
	 *
	 * usage: <a href="javascript:;" class="help" data-help="tab-2"></a>
	 */
	function cpac_help()
	{
		$('#cpac a.help').click( function(e) {
			e.preventDefault();

			var panel = $('#contextual-help-wrap');

			panel.parent().show();
			$('a[href="#tab-panel-cpac-' + $(this).attr('data-help') + '"]', panel).trigger('click');
			panel.slideDown( 'fast', function() {
				panel.focus();
			});
		});
	}

	/*
	 * WP Pointer
	 *
	 * credits to ACF ( Elliot Condon )
	 */
	function cpac_pointer()
	{
		$('.cpac-pointer').each(function(){

			// vars
			var el 	 = $(this),
				html = el.attr('rel'),
				pos  = el.attr('data-pointer-position');

			var position = {
				my: 'left bottom',
				at: 'left top',
				edge: 'bottom',
			};

			if ( 'bottom' == pos ) {
				position = {
					my: 'left top',
					at: 'left bottom',
					edge: 'top',
				};
			}

			// create pointer
			el.pointer({
		        content: $('#' + html).html(),
		        position: position,
		        close: function() {
		        	el.removeClass('open');
		        }
		    });

			// click
		    el.click( function() {
			    if( el.hasClass('open') ) {
				    el.removeClass('open');
			    }
			    else {
				    el.addClass('open');
			    }
		    });

		    // show on hover
		    el.hover( function() {
			    $(this).pointer('open');
		    }, function() {
		    	if( ! el.hasClass('open') ) {
			    	$(this).pointer('close');
		    	}

		    });
		});
	}


	/*
	 * Sidebar Fixed Scroll
	 *
	 * @since 1.5
	 */
	function cpac_sidebar_scroll()
	{
		var msie6 = $.browser == 'msie' && $.browser.version < 7;

		if (!msie6 && $('.columns-right-inside').length != 0 ) {
			
			// top position of the sidebar on loading
			var top = $('.columns-right-inside:visible').offset().top - parseFloat( $('.columns-right-inside:visible').css('margin-top').replace(/auto/, 0) ) - 70;

			$(window).scroll(function (event) {
				// y position of the scroll
				var y 	= $(this).scrollTop();
				
				// top position of div#cpac is calculated everytime incase of an opened help screen
				var offset = $('#cpac').offset().top - parseFloat( $('#cpac').css('margin-top').replace(/auto/, 0) );
				
				// whether that's below
				if (y >= top + offset ) {
					// if so, ad the fixed class
					$('.columns-right-inside:visible').addClass('fixed');
				} else {
					// otherwise remove it
					$('.columns-right-inside:visible').removeClass('fixed');
				}
			});
		}
	}

	/*
	 * Change Label
	 *
	 * @since 1.5
	 */
	function cpac_change_label()
	{
		var fields = jQuery('.column_label .input input');

		// on change
		fields.keyup(function() {
			updatePreview( $(this) );
		});
		fields.change(function() {
			updatePreview( $(this) );
		});

		// set preview
		function updatePreview( el ) {
			var value = $(el).val();
			var label = $(el).closest('.cpac-column').find('td.column_label > a');

			label.text( value );
		};
	}
	
	/*
	 * Custom Image Size
	 *
	 * @since 1.5
	 */
	function cpac_custom_image_size()
	{
		// display custom image size
		$('.column_image_size label.custom-size').click(function(){
			
			var parent = $(this).closest('.input');
			
			if ( $(this).hasClass('image-size-custom') ) {
				$('.custom-size-w', parent).removeClass('hidden');
				$('.custom-size-h', parent).removeClass('hidden');
			}
			
			else {
				$('.custom-size-w', parent).addClass('hidden');
				$('.custom-size-h', parent).addClass('hidden');
			}			
		});
		
		// select image custom field type
		$('.column_field_type .input select option').click( function(){
			var image_size = $(this).closest('table').find('.column_image_size').show();
			
			if( 'image' == $(this).attr('value') ) {
				image_size.show();
			}
			else {
				image_size.hide();
			}
		})
	}
	
	
	/*
	 * Export Multiselect
	 *
	 * @since 1.5
	 */
	function cpac_export_multiselect()
	{
		if( $('#cpac_export_types').length == 0 )
			return;
			
		var export_types = $('#cpac_export_types');
		
		// init
		export_types.multiSelect();
		
		// click events
		$('#export-select-all').click( function(e){
			export_types.multiSelect('select_all');			
			e.preventDefault();
		});	
	}
	
	/*
	 * Custom Image Size
	 *
	 * @since 1.5
	 */
	function cpac_import()
	{
		var container = $('#cpac_import_input');
		
		$('#upload', container).change(function () {
			if ( $(this).val() )
				$('#import-submit', container).addClass('button-primary');
			else
				$('#import-submit', container).removeClass('button-primary');
		});
	}

})(jQuery);