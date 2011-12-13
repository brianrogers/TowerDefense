/*jshint  browser:  true,
          eqeqeq:   true,
          immed:    false,
          newcap:   false,
          nomen:    false,
          onevar:   false,
          plusplus: false,
          undef:    true,
          loopfunc: true,
          white:    false */
/*global  window, jQuery, $, log, webkit_drop, webkit_draggable, GameElements */

window.TowerDefenseLevelBuilder = (function($){
	var lb = {};
	lb.new_level = {"waves":[{"bad_guys":[]}],"available_weapons":[]};
	lb.touchEnabled = false;
	lb.selected_wave = 0;
	
	lb.init = function(){
		//check for touch
        if($('html').hasClass('no-touch')){
            //laptop without touch
            lb.touchEnabled = false;
        }else if($('html').hasClass('touch')){
            //mobile touch device
            lb.touchEnabled = true;
        }
		log('init called');
		
		lb.current_wave = 0;
		
		lb.RefreshAvailableBadGuys();
		
		if(lb.touchEnabled){
            webkit_drop.add('#bad-guy-order', 
					{ 
						onDrop : function(elem, e){
							lb.handleTouchDropEvent(elem,e);
						}
					}
				);
        }else{
            $('#bad-guy-order').droppable({
                drop: lb.handleDropEvent
            });
        }
		
		$('#new-wave-button').click(function(){
			lb.new_level.waves.push({"bad_guys":[]});
			$('#wave-selector').html('');
			for(var i=0;i<lb.new_level.waves.length;i++){
				$('#wave-selector').append('<option value="wave_'+i+'">Wave '+(i+1)+'</option>');	
			}
			
		});
		
		$('#wave-selector').bind("change",function(){
			//log('wave-selector clicked');
			lb.current_wave = $('#wave-selector option:selected').val().replace('wave_','');
			//log(lb.current_wave);
			$('#bad-guy-order-header').html('Bad Guys For Wave '+(parseInt(lb.current_wave,10)+1));
			lb.RefreshBadGuyOrder();
			
		});
		
		$('#clear-bad-guy-order').click(function(){
			//clear the current wave
			lb.new_level.waves[lb.current_wave].bad_guys = [];
			lb.RefreshBadGuyOrder();
		});
		
	};
	
	lb.RefreshAvailableBadGuys = function(){
		for(var i=0;i<GameElements.bad_guys.length;i++){
			$('#bad-guys').append('<div id="bad-guy'+i+'"><img src="images/'+GameElements.bad_guys[i].image+'" class="'+GameElements.bad_guys[i].style+'"></img></div>');
			//setup the draggable events
            if(!lb.touchEnabled){
                //jqueryui draggable stuffs for laptop
                $('#bad-guy'+i).liveDraggable({
                    containment: 'bad-guy-order',
                        cursor: 'move',
                        snap: 'bad-guy-order',
                        helper: 'clone'
                });
            }else{
                //do something special for ipad/iphone
                var weapon_draggable = new webkit_draggable('bad-guy'+i, {revert : false});
            }
		}
	};
	
	lb.RefreshBadGuyOrder = function(){
		$('#bad-guy-order').html('');
		for(var i=0;i<lb.new_level.waves[lb.current_wave].bad_guys.length;i++){
			$('#bad-guy-order').append('<div id="bad-guy-order-'+i+'"><img src="images/'+lb.new_level.waves[lb.current_wave].bad_guys[i].image+'" class="'+lb.new_level.waves[lb.current_wave].bad_guys[i].style+'"></img></div>');
		}
		
		$('#json-data').text(JSON.stringify(lb.new_level));
	};
	
    lb.handleDropEvent = function( event, ui ) {
        var draggable = ui.draggable;
		//log('handling drop event');
		//log(ui.draggable.attr('id').replace('bad-guy',''));
        //add to your weapons list
		var bad_guy_index = ui.draggable.attr('id').replace('bad-guy','');
		var bad_guy_to_add = GameElements.bad_guys[bad_guy_index];
		//log('current_wave - '+lb.current_wave);
        lb.new_level.waves[lb.current_wave].bad_guys.push(bad_guy_to_add);

		lb.RefreshBadGuyOrder();
        
    };
    
    lb.handleTouchDropEvent = function(htmlElement, event){
        //log($(htmlElement).position().left + ' - ' + $(htmlElement).position().top);

		log('handling drop event');
		//log($(htmlElement).attr('id').replace('bad-guy',''));
        //add to your weapons list
		var bad_guy_index = $(htmlElement).attr('id').replace('bad-guy','');
		var bad_guy_to_add = GameElements.bad_guys[bad_guy_index];
		//log('current_wave - '+lb.current_wave);
        lb.new_level.waves[lb.current_wave].bad_guys.push(bad_guy_to_add);

		lb.RefreshBadGuyOrder();
		lb.RefreshAvailableBadGuys();
		
    };

	return lb;
	
})(jQuery);


var GameElements = {
	'bad_guys' : [
		{
		"name":"black-ant-small",
		"style":"ant1",
		"image":"black-ant-small.png",
		"current_position":0,
		"hp":2,
		"value":5,
		"madeit":0
		},
		{
		"name":"black-ant-2small",
		"style":"ant1",
		"image":"black-ant-2small.png",
		"current_position":0,
		"hp":2,
		"value":5,
		"madeit":0
		},
		{
		"name":"black-ant-big",
		"style":"ant1",
		"image":"black-ant-big.png",
		"current_position":0,
		"hp":2,
		"value":5,
		"madeit":0
		},
		{
		"name":"red-ant",
		"style":"ant2",
		"image":"red-ant-big.png",
		"current_position":0,
		"hp":10,
		"value":10,
		"madeit":0
		}
	]
	,'available_weapons' : [{
		"name":"w1",
		"position":"",
		"range":"1",
		"hits":0,
		"max-hits":50,
		"style":"weapon1",
		"cost":10,
		"damage":1
	},
	{
		"name":"w2",
		"position":"",
		"range":"1",
		"hits":0,
		"max-hits":80,
		"style":"weapon2",
		"cost":20,
		"damage":2
	},
	{
		"name":"w3",
		"position":"",
		"range":"2",
		"hits":0,
		"max-hits":80,
		"style":"weapon3",
		"cost":30,
		"damage":5
	}]
};