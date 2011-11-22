window.TowerDefense = (function($){
	//var gameInterval;
	var td = {};
	
	td.score = 30;
	td.scoreChanged = true; //start at true - will be changed when store is built
	td.current_step = 0;
	td.gameSpeed = 800;
	td.missedBadGuys = 0;
	td.player = new Player();
	td.wave = 0;
	
	td.init = function(levelData){
		log('init called with ', levelData);
		td.current_level = levelData;
		td.BuildMap();
		//td.Start();
		
		for(var i=1; i < 6 ;i++){
			$('#missed-bgs-'+i).css('visibility','hidden');
		}
		
		$('#start-dialog').show();
		$('#start-game-button').click(function(){
			td.Start();
			$('#start-dialog').hide();
		});
		
		$('#next-wave-button').hide();
		$('#weapon-detail-container').hide();
		$("#level-complete-dialog").hide();
		$("#game-over-dialog").hide();
	};
	
	td.Start = function(){
		
		td.gameInterval = setInterval(td.GameLoop, td.gameSpeed);
		
		$('.map-cell').each(function(){
			$(this).droppable({
				drop: td.handleDropEvent
			});
		});
		
		td.UpdateScore();

		
		$('#next-wave-button').click(function(){
			td.wave++;
			td.Start();
		});
		$('#next-wave-button').hide();
	}
	
	td.BuildMap = function(){
		$("#map").append("<div>");
		for(var i=0; i< 7 ; i++){
			for (var j=0; j < 15; j++) {
				if(td.current_level.map_path.indexOf(i+'_'+j)>-1){
					$("#map").append('<div id="'+i+'_'+j+'" class="map-path"></div>');
				}else{
					$("#map").append('<div id="'+i+'_'+j+'" class="map-cell"></div>');					
				}
			};
		}
		$("#map").append("</div>");	
	};
	
	td.GameLoop = function(){
		//log('GameLoop running');
		td.ShowBadGuysOnMap();
		
		td.ShowWeaponsOnMap();
		
		td.CheckForHits();
				
		// check to see if the wave is over
		if(td.IsWaveOver()){
			log('wave over');
			clearInterval(td.gameInterval);
			if(td.current_level.waves.length == td.wave+1){
				$('#next-wave-button').hide();
				td.LevelComplete();
			}else{
				$('#next-wave-button').show();
			}
			return;
		}
		
		td.UpdateScore();
		td.UpdateAvailableWeapons();
	}
	
	td.ShowBadGuysOnMap = function(){
		var bad_guys = td.current_level.waves[td.wave].bad_guys;
		var map_path = td.current_level.map_path;
		var weapons = td.player.weapons;
		
		// show bad guys
		for(var i=0;i<bad_guys.length;i++){
			//remove old pos
			$('#'+map_path[bad_guys[i].current_position]).html('');
			
			if(bad_guys[i].hp>0){
				bad_guys[i].current_position++;
				//add at new pos
				$('#'+map_path[bad_guys[i].current_position]).append("<div class='"+bad_guys[i].style+"'></div>");
				bad_guys[i].currentCell = map_path[bad_guys[i].current_position];
			}
			
			if((bad_guys[i].current_position >= map_path.length) && (bad_guys[i].hp > 0) && bad_guys[i].madeit == 0){
				bad_guys[i].madeit = 1;
				td.missedBadGuys++;
				td.UpdateMissedBadGuys();
			}
		}
	}
	
	td.CheckForHits = function(){
		
		var bad_guys = td.current_level.waves[td.wave].bad_guys;
		var map_path = td.current_level.map_path;
		var weapons = td.player.weapons;
		
		//check for hits
		var killed_guys = [];
		
		for(var i=0;i<bad_guys.length;i++){
			for(var w=0;w<weapons.length;w++){
				if(td.IsHit(bad_guys[i].currentCell,weapons[w].position,weapons[w].range)){
					weapons[w].hits++;
					bad_guys[i].hp = bad_guys[i].hp - weapons[w].damage; //take away hit points
					log(weapons[w].name + ' did ' + weapons[w].damage + 'points of damage leaving '+bad_guys[i].hp+' hp');
					//check to see if this bad guy is dead
					if(bad_guys[i].hp<=0){	
						$('#'+map_path[bad_guys[i].current_position]).html('');
						//increase the score
						td.score += bad_guys[i].value;
						td.scoreChanged = true;
						td.UpdateScore();
						
						//remove the bad guy
						killed_guys.push(i);
					}
				}
			}
		}
		//remove killed_guys from bad_guys
		for (var k=0; k < killed_guys.length; k++) {
			bad_guys.splice(killed_guys[k],1);
		}
	}
	
	td.ShowWeaponsOnMap = function(){
		//show weapons
		var weapons = td.player.weapons;
		//log(weapons.length);
		for(var w=0;w<weapons.length;w++){
			//log(weapons[w].position);
			$('#'+weapons[w].position).html("<div class='"+weapons[w].style+"' weapon_id='"+w+"' >"+weapons[w].hits+"</div>");
			$('#'+weapons[w].position).live("click",function(){
				$(this).find('div').each(function(){
					td.ShowWeaponDetails($(this).attr('weapon_id'));
					
				});
			})
		}
	}
	
	td.ShowWeaponDetails = function(weapon){
		var weapons = td.player.weapons;
		log(weapons[weapon]);
		
	}
	
	td.LevelComplete = function(){
		log('levelComplete');
		$("#level-complete-dialog").show();
	}
	
	td.IsWaveOver = function(){
		var result = true;
		
		var bad_guys = td.current_level.waves[td.wave].bad_guys;
		var map_path = td.current_level.map_path;
		var weapons = td.player.weapons;
		
		if(bad_guys.length>0){
			//check to see if any bad guys still have Hit Points
			for(var i=0;i<bad_guys.length;i++){
				if(bad_guys[i].hp>0 && bad_guys[i].current_position < map_path.length){
					result = false;
				}
			}		
		
			//check to see if the last one made it to the end
			if(bad_guys[bad_guys.length-1].current_position==map_path.length){
				result = true;
			}
		}else{
			result = true;
		}
		return result;
	}
	
	td.UpdateScore = function(){
		$('#score').html("You Have $"+td.score);
	}
	
	td.IsHit = function(badguy_pos, weapon_pos, range){
		//log('comparing: '+badguy_pos+' with '+badguy_pos+' range='+range);
		//setup the comparison
		//only care about range for weapon_pos
		bgRow = parseInt(String(badguy_pos).split('_')[0]);
		bgCol = parseInt(String(badguy_pos).split('_')[1]);
		wRow = parseInt(String(weapon_pos).split('_')[0]);
		wCol = parseInt(String(weapon_pos).split('_')[1]);

		weaponRowRange = td.GetRangeArray(wRow,range);
		weaponColRange = td.GetRangeArray(wCol,range);

		//log(weaponRowRange);
		//log(weaponColRange);

		var result = false;
		
		if(bgCol==wCol){ //same column, check row range
			//log('looking for '+bgRow+' in '+weaponRowRange);
			//log(ArrayIncludes(weaponRowRange, bgRow));
			if(td.ArrayIncludes(weaponRowRange, bgRow)){
				log('hit');
				result = true;
			}
		}
		if(bgRow==wRow){ //same row, check col range
			//log('looking for '+bgCol+' in '+weaponColRange);
			//log(ArrayIncludes(weaponColRange,bgCol));
			if(td.ArrayIncludes(weaponColRange,bgCol)){
				log('hit');
				result = true;
			}
		}
		
		return result;
	};
	
	td.GameOver = function(){
		clearInterval(td.gameInterval); // kill the game loop
		$("#game-over-dialog").show();
	}
	
	td.UpdateMissedBadGuys = function(){
		$('#missed-bgs-'+td.missedBadGuys).css('visibility','visible');
		if(td.missedBadGuys>5){
			td.GameOver();
		}
	}
	
	td.UpdateAvailableWeapons = function(){
		var available_weapons = td.current_level.available_weapons;
		if(td.scoreChanged){
			//clear out the store so we can rebuild
			$('#weapon-store').html('');	
			for (var i=0; i < available_weapons.length; i++) {
	
				$('#weapon-store').append('<div id="weapon-for-sale'+i+'" damage="'+available_weapons[i].damage+'" class="'+available_weapons[i].style+'">$'+available_weapons[i].cost+'</div>');	
			
				if(available_weapons[i].cost > td.score){ //make sure you have enough money
					$('#weapon-for-sale'+i).fadeTo('slow',0.2);
					$('#weapon-for-sale'+i).die();
				}else{
					$('#weapon-for-sale'+i).fadeTo('slow',1);
					//setup the draggable events
					$('#weapon-for-sale'+i).liveDraggable({
						containment: '#map',
						    cursor: 'move',
						    snap: '#map',
							helper: 'clone'
					});
					$('#weapon-for-sale'+i).bind("touchstart touchmove", td.moveMe);
				}
			};
		
		td.scoreChanged = false; //reset the flag
		}
	};
	
	td.GetRangeArray = function(start, range){
		var result = new Array();
		start = parseInt(start);
		range = parseInt(range);
		
		var max = start+range;
		var min = start-range;
		//log('range = ' + min + ' - ' + max);
		for(var i=min;i<=max;i++){
			//log('adding '+i);
			result.push(i);
		}
		//log(result);
		
		return result;
	};
	
	td.ArrayIncludes = function(arr,obj) {
	    return (arr.indexOf(obj) != -1);
	};
	
	td.moveMe = function(e) {
		log('moveMe called');
	  e.preventDefault();
	  var orig = e.originalEvent;
	  $(this).css({
	    top: orig.changedTouches[0].pageY,
	    left: orig.changedTouches[0].pageX
	  });
	};
	
	td.handleDropEvent = function( event, ui ) {
		var draggable = ui.draggable;

		//add to your weapons list
		td.player.weapons.push(
		{
		"name":"w1",
		"position":event.target.id,
		"range":"1",
		"hits":0,
		"max-hits":50,
		"style":ui.draggable.attr('class'),
		"damage":ui.draggable.attr('damage')
		});

		td.ShowWeaponsOnMap();

		//deduct the money from your score
		td.score = td.score - ui.draggable.text().replace('$','');
		td.scoreChanged = true;
	};
	
	return td;
}(jQuery));

function Player(){
	this.weapons = [];
	this.score = 0;
}

var Level1 = {'map_path' : 
['6_0','6_1','6_2','6_3','6_4','5_4','4_4','3_4','2_4','1_4','1_5','1_6','2_6','2_7','3_7','4_7','4_8','5_8','5_9','5_10','4_10','4_11','4_12','4_13','5_13','5_14'],
'waves' : [
{'bad_guys' : [{
	"name":"ant1",
	"style":"ant1",
	"current_position":0,
	"hp":2,
	"value":10,
	"madeit":0
	},
	{
	"name":"ant2",
	"style":"ant1",
	"current_position":-5,
	"hp":2,
	"value":10,
	"madeit":0
	},
	{
	"name":"ant3",
	"style":"ant1",
	"current_position":-10,
	"hp":5,
	"value":10,
	"madeit":0
	},
	{
	"name":"ant4",
	"style":"ant2",
	"current_position":-12,
	"hp":7,
	"value":10,
	"madeit":0
	}]
},
{
	'bad_guys' : [{
		"name":"ant1",
		"style":"ant1",
		"current_position":0,
		"hp":2,
		"value":10,
		"madeit":0
		},
		{
		"name":"ant2",
		"style":"ant1",
		"current_position":-5,
		"hp":2,
		"value":10,
		"madeit":0
		},
		{
		"name":"ant3",
		"style":"ant1",
		"current_position":-10,
		"hp":5,
		"value":10,
		"madeit":0
		},
		{
		"name":"ant4",
		"style":"ant2",
		"current_position":-12,
		"hp":7,
		"value":10,
		"madeit":0
		}]
}]
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
}


