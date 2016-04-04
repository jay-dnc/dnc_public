var QueueRunnerIsSleeping = 1;
var CallBacks = new Array();
var ActionWndReady = 0;
var SuspendMapUpdate=0;

function AddActionToVirtQueue(ActionRunner) {
	CallBacks.push(ActionRunner);
	if (QueueRunnerIsSleeping)
		ProcessActionQueue();
}

function ProcessActionQueue() {
	if (CallBacks.length == 0) {
		QueueRunnerIsSleeping = 1;
		return;
	}
	if (ActionWndReady) {
		window.actions_frame.document.location = '/blackframes/quick_action/on/1/?'+CallBacks[0].url+'&rand='+Math.random();
		ActionWndReady = 0;
		RequestProcessing(true, CallBacks.length);
	}
	QueueRunnerIsSleeping = 0;
	setTimeout("ProcessActionQueue()", 1);
}

function ActionComplete(){
	var Action = CallBacks.shift();
	if (Action)
		Action.Finish(false);
	ActionWndReady = 1;
	RequestProcessing(false, CallBacks.length);
}

function ActionFailed(){
	var Action = CallBacks.shift();
	if (Action && Action.runOnFail)
		Action.Finish(true);
	ActionWndReady = 1;
	RequestProcessing(false, CallBacks.length);
}

//=======================================
function MoveUnitToFleetQuick(Unit, FleetTo, DoneFunc, args){
	if (FleetTo == 'skip')
		return;
	if(args)
		args.i2 = FleetTo;
	var UnitMoveRunner={
		url:'planetid='+args.x+':'+args.y+'&action=move_unit_to_fleet&unit_id='+Unit+'&fleet_id='+FleetTo,
		dd:DoneFunc,
		args:args,
		Finish:function(failed) {
			if (failed) {
				alert('Moving unit failed.');
				return;
			}
			var fromGarrison = this.args.i1 == 0;
			var toGarrison = this.args.i2 == 0;
			var toAllien = args.i2.match(/^allien_/) ? true : false;
			var needData = (fromGarrison || toGarrison) && !toAllien ? 2 : 1;
			this.dd(fromGarrison ? this.args.x+'_'+this.args.y : this.args.i1, 0, fromGarrison, true, needData, fromGarrison == toGarrison);
			if(!toAllien)
				this.dd(toGarrison ? this.args.x+'_'+this.args.y : this.args.i2, 0, toGarrison, false, needData, false);
		},
		runOnFail:true
	};
	AddActionToVirtQueue(UnitMoveRunner);
}

function JumpFleetToQuick(FleetID, MaxDist, FleetSpeed, IsHome, FromX, FromY, DoneFunc, coords, no_confirm){
	JumpFleetToQuickWithReturn(FleetID, MaxDist, FleetSpeed, IsHome, FromX, FromY, DoneFunc, coords, no_confirm);
}

function JumpFleetToQuickWithReturn(FleetID, MaxDist, FleetSpeed, IsHome, FromX, FromY, DoneFunc, coords, no_confirm){
	var Destination = coords || prompt(GetLangMSG(141),XY);
	if (!Destination)
		return false;
	re=/(\d+)\D(\d+)/;
	if (!Destination.match(re)){
		alert(GetLangMSG(142))
		return false;
	}
	Coords = re.exec(Destination)
	Destination=Coords[1]+':'+Coords[2]
	len = distance(Coords[1], Coords[2], FromX, FromY)
	if (!len){
		alert(GetLangMSG(143)+' '+Destination)
		return false;
	}

	if (!IsHome){
		if (!UserPlanets['a'+Coords[1]+'_'+Coords[2]] && !UserPlanets['a'+FromX+'_'+FromY]){
			alert(GetLangMSG(164))
			return false;
		}
	}
	if (len > MaxDist){
		alert(GetLangMSG(153))
		return false;
	}
	var tta=Math.ceil(len / FleetSpeed)
	if (!no_confirm && !(confirm(GetLangMSG(159) + ' ' + tta + GetLangMSG(160)))){
		return false;
	}
	var FleetMoveRunner={
		url:'action=move_fleet&fleet_id='+FleetID+'&move_to='+Destination,
		fleet:FleetID,
		dd:DoneFunc,
		Finish: function(){
			if(!LiveMap || !Paid) UpdateMapData();
			this.dd(this.fleet, 1, false, false);
		}
	};
	AddActionToVirtQueue(FleetMoveRunner);
	return true;
}

function CancelJumpQuick(FleetID, DoneFunc)
{
	var CancelJumpRunner={
		url:'action=cancel_jump&fleet_id='+FleetID,
		fleet:FleetID,
		dd:DoneFunc,
		Finish: function(){
			if(!LiveMap || !Paid) UpdateMapData();
			this.dd(this.fleet, 2, false, false);
		}
	};
	AddActionToVirtQueue(CancelJumpRunner);
}

function DisbandUnitQuick(FleetID,UnitID,DoneFunc,args, no_confirm){
	if(!no_confirm && !(confirm(GetLangMSG(126)))){
		return;
	}
	var UnitDelRunner={
		url:'action=demolish_building&unit_id='+UnitID,
		dd:DoneFunc,
		fleet:FleetID,
		args:args,
		Finish: function(failed){
			var isGarrison = this.fleet==0;
			this.dd(isGarrison ? this.args.x+'_'+this.args.y : this.fleet, 0, isGarrison, isGarrison);
		},
		runOnFail:true
	};
	AddActionToVirtQueue(UnitDelRunner);
}

function UnpackUnitQuick(FleetID,UnitID,IsUn,DoneFunc,args, no_confirm){
	if(!no_confirm && !(confirm(GetLangMSG(584)))){
		return;
	}
	var UnitUnpackRunner={
		url:'action=unpack_container&building_id='+UnitID,
		IsUn:IsUn,
		reloadHarr:FleetID == 0?1:0,
		dd:DoneFunc,
		args:args,
		Finish:function(){
			if(this.args) {
				if (this.IsUn){
					window.units_frame.AllUnnitsLoaded=0;
					window.units_frame.location.reload(true);
				} else
					UpdateResData();
				this.dd(this.args.x+'_'+this.args.y, 0, true, true, this.IsUn?2:1)
			}
		}
	};
	AddActionToVirtQueue(UnitUnpackRunner);
}

function HideFleetQuick(FleetID, Hide, Cancel, DoneFunc){
	var mode = 'hide_fleet';
	if(!Hide){
		mode = 'un'+mode;
	}
	if(Cancel){
		mode = 'cancel' + mode;
	}
	var FleetHiderRunner={
		url:'action=hidefleet&mode='+mode+'&fleet_id='+FleetID,
		fleet:FleetID,
		hide:Hide,
		cancel:Cancel,
		dd:DoneFunc,
		Finish:function() {
			var Fleets = window.flets_frame.FleetById;
			var Fleet = Fleets[this.fleet];
			if (Fleet){
				if(this.hide) {
					UpdateResData();
					if(this.cancel)
						Fleet.fa = {};
					else
						Fleet.fa.a1 = 1;
				} else {
					if(this.cancel)
						Fleet.fa = {};
					else
						Fleet.fa.a2 = 1;
				}
			}
			this.dd(this.fleet, 0, false, false)
		}
	};
	AddActionToVirtQueue(FleetHiderRunner);
}

function FleetScriptModeQuick(FleetID, TurnOn, DoneFunc){
	var FleetScriptModeRunner={
		url:'action=enable_fleet_script&mode='+(TurnOn ? '1' : '0')+'&fleet='+FleetID,
		fleet:FleetID,
		turnOn:TurnOn,
		dd:DoneFunc,
		Finish:function(){
			var Fleets = window.flets_frame.FleetById;
			var Fleet = Fleets[this.fleet];
			if (Fleet) {
				Fleet.sa = this.turnOn;
			}
			this.dd(this.fleet, 0, false, true)
		}
	};
	AddActionToVirtQueue(FleetScriptModeRunner);
}

function UnshareFleetQuick(FleetID, DoneFunc){
	if(!(confirm(GetLangMSG(1119)))){
		return;
	}
	var FleetUnsRunner={
		url:'action=unshare_me&fleet_id='+FleetID,
		dd:DoneFunc,
		fleet:FleetID,
		Finish: function(){
			var Fleets = window.flets_frame.FleetById;
			var OutgoingFleetsByXY = window.flets_frame.OutgoingFleetsByXY;
			var FleetsByXY = window.flets_frame.FleetsByXY;
			
			var Fleet = Fleets[this.fleet];
			if(Fleet) {
				// remove from cache
				delete FleetsByXY[Fleet.x + ':' + Fleet.y];
				if (Fleet.fx) {
					delete OutgoingFleetsByXY[Fleet.fx + ':' + Fleet.fy];
				}
				delete Fleets[this.fleet];
			}
			this.dd(this.fleet, 5, false, true);
		}
	};
	AddActionToVirtQueue(FleetUnsRunner);
}

function UpdateResData() {
	if (parent.ResData) {
		var iframe = document.getElementById('ResDataUpdater');
		if(iframe.contentDocument)
			iframe.contentDocument.location.reload();
		else
			iframe.contentWindow.document.location.reload();
	} else {
		setTimeout ("UpdateResData()", 100);
	}
}

function UpdateMapData(){
	if(SuspendMapUpdate<2){
		if(!SuspendMapUpdate){
			var iframe=document.getElementById('skymap_frame');
			if(iframe){
				if(iframe.contentDocument) iframe.contentDocument.location.reload();
				else iframe.contentWindow.document.location.reload();
			}
		}else SuspendMapUpdate=2;
	}
}

function UpdateNewsData(){
	if(!SuspendMapUpdate){
		var iframe=document.getElementById('planet_news');
		if(iframe){
			if(iframe.contentDocument) iframe.contentDocument.location.reload();
			else iframe.contentWindow.document.location.reload();
		}
	}else SuspendMapUpdate=3;
}

function RefreshMapPlanet(x, y) {
	if(!LiveMap || !Paid) {
		UpdateMapData();
		return;
	}
	
	// reload region data for planet and redraw planet
	var iframe = document.getElementById('skymap_frame');
	if(iframe && iframe.contentWindow.RefreshMapPlanet) {
		iframe.contentWindow.RefreshMapPlanet(x, y);
	}
	
}

function PerformActionQuick(UnitID,ActionID,DoneFunc,mc,sc,cc,Cancel,FleetID,X,Y,map) {
	var UpdateRes = mc || sc || cc;
	var Runner={
		url:'action='+(Cancel?'cancel':'store')+'_action&unit_id='+UnitID+'&action_id='+ActionID,
		dd:DoneFunc,
		NeedUpRes:UpdateRes,
		NeedUpMap:map,
		fleet:FleetID,
		x:X,
		y:Y,
		Finish: function(){
			if(this.NeedUpRes) UpdateResData();
			if(this.NeedUpMap) RefreshMapPlanet(this.x, this.y);
			if(ActionID == 1) UpdateNewsData();
			this.dd(this.fleet==0 ? this.x+'_'+this.y : this.fleet, ActionID==1 ? 4 : 0, this.fleet==0, true);
		}
	};
	AddActionToVirtQueue(Runner);
}

function CustomizeQuick(UnitID, xy, DoneFunc, args) {
	var Runner={
		url:'planetid='+xy+'&action=customise_container&amp;container='+UnitID,
		dd:DoneFunc,
		unit:UnitID,
		args:args,
		Finish: function(failed){
			if(!failed) {
				var Garrisons = window.flets_frame.GarrisonByXY;
				var G = Garrisons[this.args.x + ':' + this.args.y];
				if (G){
					for(var u = 0; u < G.un.length; u++){
						if(G.un[u] == this.unit){
							G.un.splice(u, 1);
							G.tb--;
						}
					}
				}
			}
			this.dd(this.args.x+'_'+this.args.y, 0, true, true);
		},
		runOnFail:true
	};
	AddActionToVirtQueue(Runner);
}
function CancelCargoLoadQuick(UnitID,DoneFunc,args) {
	var Runner={
		url:'action=cancel_cargo_load&amp;building_id='+UnitID,
		dd:DoneFunc,
		args:args,
		Finish: function(){
			this.dd(this.args.x+'_'+this.args.y, 0, true, true);
		}
	};
	AddActionToVirtQueue(Runner);
}

function ChangeBehaviourQuick(FleetID,Form,DoneFunc) {
	var newBehavStr='';
	var newBehavUrl='';
	for(var i= -1; i < 5; i++) {
		newBehavStr+=Form['behavtrgt_'+i].value;
		newBehavUrl+='&amp;behavtrgt_'+i+'='+Form['behavtrgt_'+i].value;
	}
	var Runner={
		url:'action=change_behaviour&amp;fleet_id='+FleetID+newBehavUrl,
		dd:DoneFunc,
		fleet:FleetID,
		form:Form,
		behav:newBehavStr,
		Finish: function(){
			var Fleets = window.flets_frame.FleetById;
			var Fleet = Fleets[this.fleet];
			if (Fleet){
				Fleet.b = this.behav;
			}
			this.dd(this.fleet, 0, false, true);
		}
	};
	AddActionToVirtQueue(Runner);
}

function CreateFleetQuick(DoneFunc, args) {
	var Name = prompt(GetLangMSG(134), 'Fleet');
	if(!Name)
		return;
	var XY = args.x+':'+args.y;
	var Runner={
		url:'action=create_new_fleet&amp;planetid='+XY+'&amp;new_fleet_name='+parent.encodeURIComponent(Name),
		dd:DoneFunc,
		args:args,
		Finish: function(){
			this.dd(0, 3, false, false);
		}
	};
	AddActionToVirtQueue(Runner);
}

function RenamePlanetQuick(x, y, name, DoneFunc)
{
	var RenamePlanetRunner={
		url:'action=change_planet_name&planetid='+x+':'+y+'&newname='+parent.encodeURIComponent(name),
		x:x,
		y:y,
		name:name,
		dd:DoneFunc,
		Finish: function(){
			this.dd(this.x, this.y, this.name);
		}
	};
	AddActionToVirtQueue(RenamePlanetRunner);
}

function ChangePlanetIconQuick(x, y, comment, icon, DoneFunc)
{
	var ChangePlanetIconRunner={
		url:'action=store_planet_mark&planetid='+x+':'+y+'&icon='+parent.encodeURIComponent(icon) + '&coment='+parent.encodeURIComponent(comment),
		x:x,
		y:y,
		icon:icon,
		dd:DoneFunc,
		Finish: function(){
			this.dd(this.x, this.y, this.icon);
		}
	};
	AddActionToVirtQueue(ChangePlanetIconRunner);
}

//---------------------------------------------------------------------------------------------------------------------
//	Communicator
function CommunicatorActionQuick(Action,ActiveBox,DoneFunc) {
//	Usage:	CommunicatorActionQuick(Action,ActiveBox,SwitchBox)
//	Actions: communicator_killmsgs, communicator_copytoarchive, communicator_movetoarchive

	var CheckedMsgs = GetCheckedItems();
	if(AllChecked() && Action == 'communicator_killmsgs' && ActiveBox != 101) {
		var Runner={
			url:'action='+Action+'_all&amp;box='+ActiveBox,
			dd:DoneFunc,
			args:{need_reload:new Array(104)},
			ActiveBox:ActiveBox,
			Finish: function(){
				//	killmsgs only!
				if(this.ActiveBox != 104) {
					if(! AllMessages['m104'])
						AllMessages['m104'] = new Array();
					AllMessages['m104'] = AllMessages['m104'].concat(AllMessages['m'+this.ActiveBox]);
					this.args.need_reload.push(this.ActiveBox);
				}
				UnreadMessagesCount['m'+this.ActiveBox] = 0;
				AllMessages['m'+this.ActiveBox] = new Array();
				document.getElementById('checked_counter').innerHTML = '';
				this.dd(this.args);
			}
		};
		AddActionToVirtQueue(Runner);
	}else{
		var MsgsInRequest = 40;
		while(CheckedMsgs.length) {
			var CheckedMsgsPart = CheckedMsgs.splice(0,MsgsInRequest);
			var Runner={
				url:'action='+Action+'&amp;box='+ActiveBox+'&amp;items='+CheckedMsgsPart.join('-'),
				dd: CheckedMsgs.length ? 0 : DoneFunc, //	call DoneFunc only after last request
				args:{need_reload:new Array()},
				CheckedMsgsPart: CheckedMsgsPart,
				Action: Action,
				ActiveBox: ActiveBox,
				Finish: function(){
					for(key1 in this.CheckedMsgsPart){
						var msgId=this.CheckedMsgsPart[key1];
						for(key in AllMessages['m'+this.ActiveBox]) if(AllMessages['m'+this.ActiveBox][key].i==msgId){
							if(this.Action=='communicator_killmsgs'){
								var removed=AllMessages['m'+this.ActiveBox].splice(key,1)[0];
								if(removed.r==0) UnreadMessagesCount['m'+this.ActiveBox]--;
								if(this.ActiveBox!=104){
									if(AllMessages['m104']) AllMessages['m104'].push(removed);
									if(removed.r==0){
										UnreadMessagesCount['m104']++;
										this.args.need_reload.push(104);
									}
								}
							}else if(this.Action=='communicator_copytoarchive'){
								//We will reload it completely
								if(AllMessages['m'+this.ActiveBox][key].r==0){
									UnreadMessagesCount['m103']++;
									this.args.need_reload.push(103);
								}
							}else if(this.Action=='communicator_movetoarchive'){
								var removed=AllMessages['m'+this.ActiveBox].splice(key,1)[0];
								if(AllMessages['m103']) AllMessages['m103'].push(removed);
								if(removed.r==0){
									UnreadMessagesCount['m'+this.ActiveBox]--;
									UnreadMessagesCount['m103']++;
									this.args.need_reload.push(103);
								}
							}else if(this.Action=='communicator_unread'){
								AllMessages['m'+this.ActiveBox][key].r=0;
								UnreadMessagesCount['m'+this.ActiveBox]++;
							}
							this.args.need_reload.push(this.ActiveBox);
							break;
						}
					}
					if(this.dd) {
						document.getElementById('checked_counter').innerHTML = '';
						this.dd(this.args);
					}
				}
			};
			AddActionToVirtQueue(Runner);
		}
	}
}

function CommFinisher(args) {
	if(!args)
		return;
	if(args.need_reload)
		for(var i in args.need_reload)
			ReloadBox(args.need_reload[i]);
	SwitchBox(ActiveBox);
}

function PauseMap(img){
	if(SuspendMapUpdate>0){
		if(img) img.style.backgroundColor='';
		var NeedUpdate=SuspendMapUpdate>1 ? SuspendMapUpdate-1 : 0;
		SuspendMapUpdate=0;
		if(NeedUpdate>0){
			UpdateMapData();
			if(NeedUpdate>1) UpdateNewsData();
		}
	}else{
		if(img) img.style.backgroundColor='#FFF';
		SuspendMapUpdate=1;
	}
}
