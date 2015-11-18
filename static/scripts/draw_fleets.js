var DiplomacyLetters={0:'W',1:'N',2:'A',3:'V',4:'L'};
var Seed=0;
var Out=new Array();
var FleetGroups=new Array();
var ReloadWhenManyPatches=95;
var A;
var C;
var F;
var FT;
var H;
var HT;
var TbyID = new Array(), TbyXY = new Array(); //alien traders by id and by coords
var Customs;
var TransferData = {};
var RedrawOnUpdate = new Array();
var NewFleetId;

function IsContainer(UnitType){ return UnitType==23 ? 3 : UnitType==24 ? 2 : UnitType==29 ? 1 : 0;}

// Drawing itself
function DrawFleetSubGroup(SubItems,Name){
	Seed++;
	Name=EscapeName(Name);
	Out[Out.length]='<table width="100%" cellpadding="1" cellspacing="0" border="0"><tr><td width="1%" valign="middle" class="unit_img">'+
		'<a href="javascript:ExpandFleetsGroup('+FleetGroups.length+','+Seed+')"><img src="'+StaticSiteName+'/img/expand.gif" alt="" width="15" height="18" border="0" id="msg_expander_'+Seed+'"/></a>'+
		'</td><td width="97%" class="unit_img">'+
		'<strong><a href="javascript:ExpandFleetsGroup('+FleetGroups.length+','+Seed+')" class="nounder">'+Name+':</a></strong> '+SubItems.length+
		'</td></tr><tr><td colspan="2"><img src="'+StaticSiteName+'/img/z.gif" alt="" width="1" height="1"/><br/>'+
		'<div class="fleetwrapperbody" id="news_body_row_'+Seed+'"><div id="fleetsgroup_'+FleetGroups.length+'"></div></div></td></tr></table>';
	FleetGroups[FleetGroups.length]={i:SubItems,n:Name};
}

function DrawFleetGroup(SubItems,Name){
	Name=EscapeName(Name);
	for (var i=0;i<SubItems.length;i++){
		switch (SubItems[i].t) {
			case 0: DrawFleetSubGroup(SubItems[i].d,SubItems[i].n); break;
			case 2: DrawFleet(SubItems[i].d,Name); break;
		}
	}
}

//var ReplayDrawing='';
function ExpandFleetsGroup(GroupID,OldID){
	var SubItems=FleetGroups[GroupID]
	if (SubItems){
		FleetGroups[GroupID]=0;
		Out.length=0;
//		ReplayDrawing='ExpandFleetsGroup('+GroupID+','+OldID+')';
		DrawFleetGroup(SubItems.i,SubItems.n);
//		ReplayDrawing='';
		document.getElementById('fleetsgroup_'+GroupID).innerHTML=Out.join('');
	}
	ExpandNewsItem(OldID);
}

function DrawFleet(D,Name){
	if(!D) return;
	var BlockID = D.i==0?D.x+'_'+D.y:D.i;
	Out[Out.length]='<table width="100%" cellpadding="1" cellspacing="0" border="0" id="'+(D.i == 0 ? 'garrison_'+D.x+'_'+D.y : 'fleet_'+D.i)+'"'+
					(D.i == 0 ? '' : 'class="fleet_on_'+D.x+'_'+D.y+'"')+'><tr>';
	var JSlink = On == 'planet'?'ExpandNewsItem(\''+BlockID+'\')':'ExpandFleetItem(\''+BlockID+'\','+D.x+','+D.y+')';
	var OverAttr= On == 'planet'?'':' onmouseover="BlinkItem('+D.x+','+D.y+')"';
	Out[Out.length]='<td width="1%" valign="top" class="unit_img" height="1"><a href="javascript:'+JSlink+'"><img src="'+StaticSiteName+'/img/expand.gif" alt="" width="15" height="18" border="0" id="msg_expander_'+BlockID+'" hspace="0" vspace="0"/></a></td>';
	Out[Out.length]='<td width="99%" class="unit_img" valign="middle"';
	if (XY == D.x+':'+D.y){
		Out[Out.length]=' style="background-color: #303030; border-right: 3px solid #DAE5FF;"';
	}
	Out[Out.length]='>';
	var MarkClass=D.rn == -1?'allien_fleet_nn':D.l?'dlbl_'+D.l:'allien_fleet_'+D.rn;

	Out[Out.length]='<a'+OverAttr+' href="javascript:'+JSlink+'" class="'+(D.ta > 0?'super_gray':'super_white')+'">';
	if (D.oi){
		Out[Out.length]='<b class="'+MarkClass+'">{</b>';
	}
	FleetName=D.i == 0?D.n:
						Name && Name == D.sn?D.pn:
						D.sn?D.sn:D.n;
	FleetName=EscapeName(FleetName);
	if (Name && Name == D.sn){
		Out[Out.length]='•'+FleetName;
	} else {
		Out[Out.length]='<strong>'+FleetName+'</strong>';
	}

	Out[Out.length]=' ('+D.s+', '+ D.cb + (D.i != 0 && D.cc != 0 ? '/'+D.cc:'') + ', '+D.tb + (D.i != 0 && D.tc != 0 ? '/'+D.tc:'')+')';
	if (D.m){
		Out[Out.length]=' <small><span class="'+(D.o > 0?'ok">(S)':'hot1"><b>(S)</b>')+'</span></small>';
	} else if (D.sa > 0){
		Out[Out.length]=' <small> (s)</small>';
	}
	if (D.h > 0){
		Out[Out.length]=' <small class="silver">h'+(D.t?'<span class="hot1">'+D.t+'</span>':'')+'</small>';
	}
	if (HasActions(D)){
		Out[Out.length]=' <small class="silver o">+</b>';
	}
	if (D.oi){
		Out[Out.length]='<b class="'+MarkClass+'">}</b> <small><a href="javascript:parent.UnshareFleetQuick('+D.i+',FleetChanged,FindFleetInTree,FT)">['+GetLangMSG(1118)+']</a></small>';
	}
	if (D.wc > 0){
		Out[Out.length]=' <small class="e"> {'+D.wc+'}</small>';
	}
	Out[Out.length]='</a>';
	if (D.ta > 0){
		Out[Out.length]=' '+D.ta;
	}
	Out[Out.length]='</td></tr><tr><td colspan="2"><img src="'+StaticSiteName+'/img/z.gif" alt="" width="1" height="1"/><br/><div id="news_body_row_'+BlockID+'" class="fleetbody" style="display:none">'; // display:none - opera hack
	DrawFleetManager(D);
	Out[Out.length]='</div></td></tr></table>';
}

function DrawFleetManager(D){
	if (D.oi){
		Out[Out.length]='<div class="hot">'+GetLangMSG(816)+': <a href="javascript:HelpWnd(\''+WorldHost(D.oi)+'/frames/playerinfo/on/'+D.oi+'/\')" target="_top">'+D.on+'</a></div>';
	}

	if (D.ta > 0){
		Out[Out.length]='<div class="hot">';
		var Tmes=GetLangMSG(138);
		if (D.it > 0){
			Tmes=GetLangMSG(136);
		}
		Out[Out.length]=Tmes;
		PrintPlanet(D.fx,D.fy,D.fpln);
		Out[Out.length]=GetLangMSG(139);
		PrintPlanet(D.x,D.y,D.pn);
		Out[Out.length]=GetLangMSG(235)+':&nbsp;<strong>'+D.ta+'</strong>';
		if (!D.it){
			Out[Out.length]='<div align="right"><a href="javascript:parent.CancelJumpQuick('+D.i+',RedrawFleetOnLoad)">['+GetLangMSG(140)+']</a></div>';
		}
		if (D.m){
			Out[Out.length]='<br/>';
			ScriptMsg(D);
		}
		if ((parent.Paid || D.sa) && !D.oi){
			Out[Out.length]='<div align="right">';
			if (parent.Paid){
				Out[Out.length]='<a href="javascript:HelpWnd(\'/blackframes/script_editor/on/'+D.i+'/\')">[';
				Out[Out.length]=D.hs?GetLangMSG(602):GetLangMSG(604);
				Out[Out.length]=']</a><br/>';
			}
			if (D.hs && D.sa){
				Out[Out.length]='<a href="javascript:parent.FleetScriptModeQuick('+D.i+',false,FleetChanged)">['+GetLangMSG(603)+']</a>';
			} else if (D.hs && parent.Paid){
				Out[Out.length]='<a href="javascript:parent.FleetScriptModeQuick('+D.i+',true,FleetChanged)">['+GetLangMSG(605)+']</a>';
			}
			Out[Out.length]='</div>';
		}
		Out[Out.length]='</div>';
	} else if (D.i == 0 && On == 'army'){
		Out[Out.length]='<div class="hot">'+GetLangMSG(236)+':';
		PrintPlanet(D.x,D.y,D.pn);
		Out[Out.length]='</div>';
	} else if (D.i && D.un.length){
		if (On != 'planet'){
			Out[Out.length]='<div class="hot">'+GetLangMSG(236)+':';
			PrintPlanet(D.x,D.y,D.pn);
			Out[Out.length]='</div>';
		}
		Out[Out.length]='<table border="0" cellpadding="2" cellspacing="0" width="100%" class="fleetstate"><tr><td><small>';
		Out[Out.length]=GetLangMSG(165)+': '+(Math.floor(D.sp*100)/100)+'<br>'+GetLangMSG(166)+': '+(Math.floor(D.r*100)/100);
		if (D.st){
			Out[Out.length]='<br>'+GetLangMSG(430)+': '+D.st.toFixed(2);
		}
		Out[Out.length]='</small></td><td align="right">';
		if (D.fa.length || HasActions(D) || D.fa.a2 || D.fa.a1){
			Out[Out.length]='&nbsp;';
		} else {
			var IsAtHome=D.oi || D.hm?1:0;
			Out[Out.length]='<input type="button" value="'+GetLangMSG(137)+'…" onclick="parent.JumpFleetToQuick('+D.i+','+D.r+','+D.sp+','+IsAtHome+','+D.x+','+D.y+',RedrawFleetOnLoad)" class="longbutn">';
		}
		Out[Out.length]='</td></tr>';
		if (D.st){
			Out[Out.length]='<tr><td colspan="2">';
			HideFleetLink(D);
			Out[Out.length]='</td></tr>';
		}
		Out[Out.length]='<tr><td colspan="2">';
		FleetBehaviour(D);
		Out[Out.length]='</td></tr></table>';
	}

	if (D.un.length){
		if (parent.Paid && D.i==0){
			Out[Out.length]='<form action="/'+URL+'" name="fleet_from_selected_form'+D.i+'" id="fleet_from_selected_form'+D.x+'_'+D.y+'" onsubmit="return CreateFleetFromChoosen(\''+D.x+'_'+D.y+'\')">';
			Out[Out.length]='<input type="hidden" name="planetid" value="'+XY+'">';
			Out[Out.length]='<input type="hidden" name="action" value="create_fleet_from_choosen">';
			Out[Out.length]='<input type="hidden" name="new_fleet_name" value="Fleet"/>';
			Out[Out.length]='<input type="hidden" name="fleetx" value="'+D.x+'"/>';
			Out[Out.length]='<input type="hidden" name="fleety" value="'+D.y+'"/>';
			if (On == 'planet'){
				Out[Out.length]='<input type="hidden" name="page_planet" value="1"/>';
			}
		}
		Out[Out.length]='<table border="0" cellpadding="0" cellspacing="0" width="100%">';
		DrawUnitsList(D);
		if (parent.Paid && D.i==0){
			Out[Out.length]='<tr><td align="right" style="padding-top:0.6em;"><input type="submit" value="'+GetLangMSG(653)+'…" class="longbutn" disabled="disabled" id="flet_units_btn'+D.x+'_'+D.y+'" style="color:gray;"/></td></tr></table></form>';
		} else {
			Out[Out.length]='</table>';
		}
	} else {
		Out[Out.length]='('+GetLangMSG(96)+')<br/>';
	}
}
function HideFleetLink(D){
	if (D.st){
		var HideMode=true;
		var Cancel=false;
		var ActTitle=433;
		if (D.h){
			HideMode=false;
			if (D.fa.a2){
				Cancel=true;
				ActTitle=434;
			} else {
				ActTitle=431;
			}
		} else if (D.fa.a1){
			Cancel=true;
			ActTitle=432;
		}
		Out[Out.length]='<small>';
		if (Money > D.sc || D.h || D.fa.a1){
			Out[Out.length]='<a href="javascript:parent.HideFleetQuick('+D.i+','+HideMode+','+Cancel+',FleetChanged)">';
			Out[Out.length]=GetLangMSG(ActTitle)+'</a> ';
			if (!D.h && !D.fa.a1){
				Out[Out.length]='('+D.sc+'<span class="c">C</span> + '+D.ss+'<span class="c">C</span> '+GetLangMSG(435)+')';
			} else if (D.h && !D.fa.a2){
				Out[Out.length]='('+D.ss+'<span class="c">C</span> '+GetLangMSG(435)+')';
			}
		} else {
			Out[Out.length]=GetLangMSG(ActTitle)+' '+GetLangMSG(104)+' ';
			PriceVal(D.sc,'C',Money,'',0)
			Out[Out.length]='<span class="deficite">'+D.sc+'<span class="c">C</span>';
		}
		Out[Out.length]='</small>';
	}
}
function PrintPlanet(X,Y,Name){
	Out[Out.length]=' <a href="/planet/?planetid='+X+':'+Y+'" target="_top" onmouseover="BlinkItem('+X+','+Y+')">'+EscapeName(Name)+'</a>';
	if (parent.Paid){
		if(parent.LiveMap){
			Out[Out.length]=' <a href="javascript:window.parent.frames[\'skymap_frame\'].ScrollMapTo('+X+','+Y+')" onmouseover="BlinkItem('+X+','+Y+')">[»»««]</a>';
		} else {
			Out[Out.length]=' <a href="/army/?planetid='+X+':'+Y+'" target="_top" onmouseover="BlinkItem('+X+','+Y+')">[»»««]</a>';
		}
	}
}
function PriceVal(Cost,Nature,Avail,Postfix,Upkeep){
//		<xsl:param name="cost"/>
//		<xsl:param name="nature"/>
//		<xsl:param name="avail_resource"/>
//		<xsl:param name="postfix" select="', '"/>
	if (!Cost){
		return;
	}
	if (Cost > Avail){
		Out[Out.length]='<span class="deficite">';
	}
	Out[Out.length]=Cost.toFixed(0)+(Upkeep?'+'+Upkeep.toFixed(0):'');
	Out[Out.length]='<span class="'+Nature+'">'+Nature+'</span>';
	if (Cost > Avail){
		Out[Out.length]='</span>';
	}
	Out[Out.length]=Postfix;
}

function FleetBehaviour(D){
	if (D.m){
		Out[Out.length]='<small>';
		ScriptMsg(D);
		Out[Out.length]='</small>';
	}
	if (parent.Paid && !D.oi){
		Out[Out.length]='<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr><td><a href="javascript:ExpandNewsItem(\''+D.i+'bh\')" class="fleet_behav">'+GetLangMSG(228)+'…</a></td>';
		Out[Out.length]='<td align="right"><small><a href="javascript:HelpWnd(\'/blackframes/rename_fleet/on/'+D.i+'/\')">'+GetLangMSG(683)+'…</a></small></td></tr></table>';
	} else {
		Out[Out.length]='<a href="javascript:ExpandNewsItem(\''+D.i+'bh\')" class="fleet_behav">'+GetLangMSG(228)+'…</a>';
	}
	Out[Out.length]='<div id="news_body_row_'+D.i+'bh" class="fleetbehav"><form action="/'+URL+'" onsubmit="parent.ChangeBehaviourQuick('+D.i+',this,FleetChanged);return false;">';
	Out[Out.length]='<input type="hidden" name="planetid" value="'+XY+'"/>';
	Out[Out.length]='<input type="hidden" name="action" value="change_behaviour"/>';
	Out[Out.length]='<input type="hidden" name="fleet_id" value="'+D.i+'"/>';
	Out[Out.length]='<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr>';
	var Behaves=D.b.match(/(\d)(\d)(\d)(\d)(\d)(\d)/);
	if (!Behaves || Behaves.length < 7){
		Behaves=new Array(0,3,1,3,4,4,4);
	}
	DrawBehave(D,Behaves[1],0);
	Out[Out.length]='<td class="fleet_behav"><img src="'+StaticSiteName+'/img/z.gif" alt="" width="5" height="5" border="0"/></td>';
	DrawBehave(D,Behaves[2],1);
	Out[Out.length]='</tr><tr>';
	DrawBehave(D,Behaves[3],2);
	Out[Out.length]='<td class="fleet_behav"><img src="'+StaticSiteName+'/img/z.gif" alt="" width="5" height="5" border="0"/></td>';
	DrawBehave(D,Behaves[4],3);
	Out[Out.length]='</tr><tr>';
	DrawBehave(D,Behaves[5],4);
	Out[Out.length]='<td class="fleet_behav"><img src="'+StaticSiteName+'/img/z.gif" alt="" width="5" height="5" border="0"/></td>';
	DrawBehave(D,Behaves[6],5);
	Out[Out.length]='</tr><tr><td colspan="5" align="right"><input type="submit" value="'+GetLangMSG(229)+'" class="longbutn"/></td>';
	Out[Out.length]='</tr></table></form>';
	if ((parent.Paid || D.sa) && !D.oi){
		Out[Out.length]='<small>';
		if (parent.Paid){
			Out[Out.length]='<a href="javascript:HelpWnd(\'/blackframes/script_editor/on/'+D.i+'/\')">[';
			if (D.hs){
				Out[Out.length]=GetLangMSG(602);
			} else {
				Out[Out.length]=GetLangMSG(604);
			}
			Out[Out.length]='…]</a><br/>';
		}
		if (D.hs && D.sa){
			Out[Out.length]='<a href="javascript:parent.FleetScriptModeQuick('+D.i+',false,FleetChanged)">['+GetLangMSG(603)+']</a>';
		} else if (D.hs && parent.Paid){
			Out[Out.length]='<a href="javascript:parent.FleetScriptModeQuick('+D.i+',true,FleetChanged)">['+GetLangMSG(605)+']</a>';
		}
		Out[Out.length]='<br></small>';
	}
	Out[Out.length]='<br/></div>';
}


function DrawBehave(D,B,i){
	Out[Out.length]='<td class="fleet_behav">'+GetLangMSG(217+i)+'</td><td class="fleet_behav" align="right"><select name="behavtrgt_'+(i-1)+'" class="fleet_behav">';
	if (D.h){
		DrawOpt(B,5);
	}
	DrawOpt(B,3);
	DrawOpt(B,2);
	DrawOpt(B,1);
	DrawOpt(B,4);
	Out[Out.length]='</select></td>';
}
function DrawOpt(B,i){
	Out[Out.length]='<option value="'+i+'"'+(B==i?'selected':'')+'>'+GetLangMSG(222 + i)+'</option>';
}

function PushUnit(B) {
	this.units[this.units.length]=B.i;
	this.totalM+=B.sm;
	this.totalS+=B.ss;
	if (B.um)
		this.totalM+=B.um;
	if (B.us)
		this.totalS+=B.us;
}
function UnitGroup(m,e,gid) {
	this.Movable=m;
	this.Expendable=e;
	this.gid=gid;
	this.totalM=0;
	this.totalS=0;
	this.units=new Array();
	this.PushUnit = PushUnit;
}

function DrawActions(B,D,cnt,UG){
	if(D.ta)
		return;
	if(!parent.Paid && cnt>1)
		return;
	if(cnt == 1 && C && C['c'+B.i])
		return;
	for (var j=1;j<B.ac.length;j++){
		if (cnt > 1 && B.ac[j] < 10000) {
			Out[Out.length]='<a href="javascript:MassAction('+"'"+UG.gid+"'"+','+B.ac[j]+',RedrawFleetOnLoad,'+A['a'+B.ac[j]].r1+','+A['a'+B.ac[j]].r2+','+A['a'+B.ac[j]].m+',1,'+D.i+','+D.x+','+D.y+',StrMassApplyToAll)">';
			Out[Out.length]='['+A['a'+B.ac[j]].t1+']</a><br/>';
			Out[Out.length]='<a href="javascript:MassAction('+"'"+UG.gid+"'"+','+B.ac[j]+',RedrawFleetOnLoad,'+A['a'+B.ac[j]].r1+','+A['a'+B.ac[j]].r2+','+A['a'+B.ac[j]].m+',0,'+D.i+','+D.x+','+D.y+',StrMassApplyToAll)">';
			Out[Out.length]='['+A['a'+B.ac[j]].t2+']</a><br/>';
		} else if (Actions['u'+B.i+'_'+B.ac[j]]){
			Out[Out.length]='<a href="javascript:parent.PerformActionQuick('+B.i+','+Actions['u'+B.i+'_'+B.ac[j]]+',RedrawFleetOnLoad,'+A['a'+B.ac[j]].r1+','+A['a'+B.ac[j]].r2+','+A['a'+B.ac[j]].m+',1,'+D.i+','+D.x+','+D.y+(A['a'+B.ac[j]].mu ? ',1' : '')+')">';
			Out[Out.length]='['+A['a'+B.ac[j]].t1+']</a>';
		} else if (((A['a'+B.ac[j]].x == 0 || !Actions['p'+D.x+'_'+D.y+'_'+B.ac[j]]) && ActionAllowed(D,A['a'+B.ac[j]].p,B.ac[j])) && B.ac[j] < 10000){
			var CanPerform;
			if (D.oi)
				CanPerform = 1;
			if ((Money >= A['a'+B.ac[j]].m || A['a'+B.ac[j]].m == 0) &&
					(res1 >= A['a'+B.ac[j]].r1 || A['a'+B.ac[j]].r1 == 0) &&
					(res2 >= A['a'+B.ac[j]].r2 || A['a'+B.ac[j]].r2 == 0))
				CanPerform = 1;
			if (CanPerform)
				Out[Out.length]='<a href="javascript:parent.PerformActionQuick('+B.i+','+B.ac[j]+',RedrawFleetOnLoad,'+A['a'+B.ac[j]].r1+','+A['a'+B.ac[j]].r2+','+A['a'+B.ac[j]].m+',0,'+D.i+','+D.x+','+D.y+(A['a'+B.ac[j]].mu ? ',1' : '')+')">';
			Out[Out.length]='['+A['a'+B.ac[j]].t2+']'+(CanPerform ? '</a><br>' : '<br>');
			if(CanPerform && !D.oi) {
				if (A['a'+B.ac[j]].m){
					PriceVal(A['a'+B.ac[j]].m,'C',Money,A['a'+B.ac[j]].r1 || A['a'+B.ac[j]].r2?', ':'',0);
				}
				if (A['a'+B.ac[j]].r1){
					PriceVal(A['a'+B.ac[j]].r1,res1n,res1,A['a'+B.ac[j]].r2?', ':'',0);
				}
				if (A['a'+B.ac[j]].r2){
					PriceVal(A['a'+B.ac[j]].r2,res2n,res2,'',0);
				}
			}
			if(!CanPerform)
				Out[Out.length]='['+GetLangMSG(104)+']<br>';
		}
	}
}
function DrawHPandUpkeep(B,D,cnt,Expendable,UG) {
	Out[Out.length]='<tr>';
	if (!D.h && !D.ta && parent.Paid > 0 && (D.i==0 || UG.units.length > 1)){
		var id = cnt>1 ? UG.gid : B.i;
		Out[Out.length]='<td class="costs"><small><input type="checkbox" value="'+id+'" name="nf_check_'+id+'" id="nf_check_'+id+'" class="checkbox" onclick="';
		if (cnt > 1)
			Out[Out.length]="SwitchSelection('"+UG.gid+"');";
		if (D.i==0)
			Out[Out.length]='document.getElementById(\'flet_units_btn'+D.x+'_'+D.y+'\').disabled=0;document.getElementById(\'flet_units_btn'+D.x+'_'+D.y+'\').style.color=\'White\';';
		Out[Out.length]='"style="width:1em;height:1em;"/></small></td><td class="costs"><small>';
	} else
		Out[Out.length]='<td class="costs" colspan="2"><small>';

	if (cnt==1 && C && C['c'+B.i]) {
		Out[Out.length]='<a href="javascript:parent.CancelCargoLoadQuick('+B.i+',RedrawFleetOnLoad,'+'{x:'+D.x+',y:'+D.y+'})">';
		Out[Out.length]=GetLangMSG(587)+' '+GetAllienFleetNameByID(C['c'+B.i])+'</a>';
	} else if (D.oi) {
		Out[Out.length]="&nbsp;";
	} else {
		Out[Out.length]=GetLangMSG(105)+':';
		if (cnt > 1) {
			PriceVal(UG.totalM,res1n,res1,UG.totalS?', ':'',0);
			PriceVal(UG.totalS,res2n,res2,'',0);
		} else {
			PriceVal(B.sm,res1n,res1,B.ss?', ':'',B.um);
			PriceVal(B.ss,res2n,res2,'',B.us);
		}
		if(B.c==24 && cnt==1) Out[Out.length]='<br><span class="hot2"><b>'+GetLangMSG(600)+'</b></span>';
	}
	Out[Out.length]='</small></td><td align="right" valign="top"><small class="bonus_descr">';
	if (cnt == 1 && !isNaN(B.hp) && B.hp < 100){
			Out[Out.length]='<span class="hp">HP:&#160;'+B.hp+'%</span><br>';
	} else if(cnt > 1 && !IsContainer(B.c)) {
		var U=window.parent.frames.units_frame.AllUnitsBase;
		var hpSum = 0;
		for(var i = 0; i < UG.units.length; i++){
			var un = U['i'+UG.units[i]];
			hpSum += isNaN(un.hp) ? 0 : (un.hp < 100) ? un.hp : 100;
		}
		hpSum /= UG.units.length;
		if(hpSum < 100){
			Out[Out.length]='<span class="hp">HP:&#160;'+Math.round(hpSum)+'%</span><br>';
		}
	}

	if(D.oi) {
		Out[Out.length]='</small></td></tr>';
		return
	}
	Out[Out.length]='<small>';
	var args = '{x:'+D.x+',y:'+D.y+',i1:'+D.i+',i2:1}';
	if (cnt == 1) {
		if (C && C['c'+B.i]) {
			Out[Out.length]='&nbsp;';
		} else if (D.i==0 && IsContainer(B.c)==3 && !B.pa){
			Out[Out.length]='<a href="javascript:parent.UnpackUnitQuick('+D.i+','+B.i+','+(B.p == '23_u'?1:0)+',RedrawFleetOnLoad,'+args+')">['+GetLangMSG(585)+']</a>';
		} else if (D.i==0 && IsContainer(B.c)==2 && Customs['c'+D.x+'_'+D.y]){
			Out[Out.length]='<a href="javascript:parent.CustomizeQuick('+B.i+",'"+D.x+':'+D.y+"',FleetChanged,"+args+')">['+GetLangMSG(601)+']</a>';
		} else if (!Expendable || D.ta!=0 || D.h!=0 || UnitUnderAction(B)){
			Out[Out.length]='&nbsp;';
		} else {
			Out[Out.length]='<a href="javascript:parent.DisbandUnitQuick('+D.i+','+B.i+',RedrawFleetOnLoad,'+args+')" class="dbnd">['+GetLangMSG(127)+']</a>';
		}
	} else if (!parent.Paid){
		Out[Out.length]='&nbsp;';
	} else {
		if(D.i==0 && IsContainer(B.c)>1){
			if(IsContainer(B.c)==3) Out[Out.length]='<a href="javascript:MassUnpack('+"'"+UG.gid+"'"+','+D.i+','+(B.p=='23_u'?1:0)+',RedrawFleetOnLoad,'+args+')">['+GetLangMSG(585)+']</a>';
			else if(Customs['c'+D.x+'_'+D.y]) Out[Out.length]='<br /><a href="javascript:MassCustomize('+"'"+UG.gid+"'"+',FleetChanged,'+args+')">['+GetLangMSG(601)+']</a>';
			Out[Out.length]='<br /><a href="javascript:MassCancelLoad('+"'"+UG.gid+"'"+',RedrawFleetOnLoad,'+args+')">['+GetLangMSG(1130)+']</a>';
		} else if (!Expendable || D.ta!=0 || D.h!=0 || UnitUnderAction(B)){
			Out[Out.length]='&nbsp;';
		} else {
			Out[Out.length]='<a href="javascript:MassDisband('+"'"+UG.gid+"'"+','+D.i+',RedrawFleetOnLoad,'+args+')" class="dbnd">['+GetLangMSG(127)+']</a>';
		}
	}
	Out[Out.length]='</small></small></td></tr>';
}

function DrawTransfers(B,D,Movable,cnt,UG) {
	TransferData[B.i+(UG?'_group':'_single')] = [B, D, Movable, cnt, UG];
	if (cnt>1 && !parent.Paid)
		return;
	if (D.i == 0 && C && C['c'+B.i]){
		Out[Out.length]=GetLangMSG(586)+'…';
		return;
	}
	if (Movable && D.h==0 && (parent.Paid || On == 'planet')){
//	if (Movable && D.h==0){
		var Tgts=GetAvailableTargets(D,B,cnt>1);
		var ForeignHere = TbyXY[D.x+':'+D.y];
		var DrawToGarrison = D.i != 0 && D.hm;
		var DrawToForeign = ForeignHere && D.i == 0 && (IsContainer(B.c)>0 || B.d == 29);
		if (Tgts.length || DrawToGarrison || DrawToForeign){
			var args = '{x:'+D.x+',y:'+D.y+',i1:'+D.i+'}';
			Out[Out.length]='<select size="1" class="fleetmove" onchange="'+
				(cnt == 1
					? 'parent.MoveUnitToFleetQuick('+B.i+',this.value,RedrawFleetOnLoad,'+args+')" id="mv_select_'+B.i+'">'
					: 'MassMove('+"'"+UG.gid+"'"+',this.value,RedrawFleetOnLoad,'+args+')" id="mmv_select_'+UG.gid+'">');
			Out[Out.length]='<option value="skip">'+GetLangMSG(128)+' …</option>';
			for (var j=0;j<Tgts.length;j++){
				if (!Tgts[j]){
					alert('Error: '+j+' '+B.i+' '+Tgts.length+' '+Tgts[j])
				}
				var is_allien = Tgts[j].oi && (D.oi ? D.oi != Tgts[j].oi : 1) ? 'allien_' : '';
				Out[Out.length]='<option value="'+is_allien+Tgts[j].i+'">'+(Tgts[j].i==0?GetLangMSG(135):Tgts[j].n+' ('+Tgts[j].s+', '+Tgts[j].tb+(Tgts[j].tc != 0 ? '/'+Tgts[j].tc:'')+')')+'</option>';
			}
			if(DrawToGarrison) {
				Out[Out.length]='<option value="0">'+GetLangMSG(135)+'</option>';
			}
			if(DrawToForeign) {
				Out[Out.length]='<option value="skip">-----------------------------</option>';
				for (var j=0;j<ForeignHere.length;j++)
					Out[Out.length]='<option value="allien_'+ForeignHere[j].i+
						'" class="allien_fleet_'+(ForeignHere[j].rel == -1 ? 'nn' : ForeignHere[j].rel)+
						'">'+ForeignHere[j].n+'</option>';
			}
			Out[Out.length]='</select>'
		} else {
			Out[Out.length]='&nbsp;';
		}
	} else {
		Out[Out.length]='&nbsp;';
	}
}

var ReloadRequested=0;
function DrawUnitsList(D,onLiveMap){
//	if(!window.parent.frames.units_frame.AllUnitsBase){
//		if(ReplayDrawing!=''){ setTimeout(ReplayDrawing,500); }
//	}
	var imgSize=40;
	var small='';
	var expandexW=15;
	var expandexH=18;
	if(onLiveMap){
		imgSize=20;
		small='_small';
		expandexW=10;
		expandexH=13;
	}

	var MissingUnitAlertShown=0;
	var UnitGroups=new Array();
	var timeout=new Date()-(-2000);
	do{}while(!window.parent.frames.units_frame.AllUnitsBase && (new Date())<timeout);
	var U=window.parent.frames.units_frame.AllUnitsBase;
	for (var i=1;i<D.un.length;i++){
		B=U['i'+D.un[i]];
		if (B) {
			var ug_name='un'+ B.c + 'in' + (D.i || D.x+':'+D.y) + (IsContainer(B.c)>0 ? 'pic' + B.p : '') + ((B.l && !B.pa) ? 'lv' + B.l : '') + (IsContainer(B.c)==1 ? 'part' + B.n : '');
			if (!UnitGroups[ug_name]) {
				var Movable=D.i==0?1:D.cc-D.fc-B.cc<0 || D.tc-D.tb-B.tc<0 || D.ta > 0 || UnitUnderAction(B)?0:1;
				var Expendable=Movable && B.c!=13?1:0;
				UnitGroups[ug_name] = new UnitGroup(Movable,Expendable,ug_name);
			}
			UnitGroups[ug_name].PushUnit(B);
		} else {
			if (MissingUnitAlertShown == 0){
				Out[Out.length]='<tr><td><small>'+GetLangMSG(934)+'.</small></td></tr>';
				if (ReloadRequested==0){
					setTimeout ("window.parent.frames.units_frame.document.location.reload()", 1);
					ReloadRequested==1;
				}
			}
			MissingUnitAlertShown=1;
		}
	}
	for (var i in UnitGroups) {
		var Movable=UnitGroups[i].Movable;
		var Expendable=UnitGroups[i].Expendable;
		var cnt=UnitGroups[i].units.length;//,ucnt=parent.Paid ? 1 : cnt;
//		if(ucnt>1 && !parent.Paid) cnt=1;
//		while(ucnt--){
//			var B=U['i'+UnitGroups[i].units[ucnt]];
			var B=U['i'+UnitGroups[i].units[0]];
			var CommonDescription = (cnt==1 || !IsContainer(B.c)) && B.d;
			Out[Out.length]='<tr><td>';
			Out[Out.length]='<table border="0" cellpadding="1" cellspacing="0" width="100%" height="100%" class="building_img">';
			Out[Out.length]='<tr><td width="1%" '+(CommonDescription ? 'rowspan="2" ' : '')+' class="building_img">';
			Out[Out.length]='<a class="img" href="javascript:HelpWnd(\'/frames/unit_stats/on/'+B.i+'\')">';
			Out[Out.length]='<img src="'+StaticSiteName+'/img/buildings/'+B.p+'.gif" alt="" width="'+imgSize+'" height="'+imgSize+'" border="0"/></a>';
			Out[Out.length]='</td>';
			Out[Out.length]='<td valign="middle" class="building_name" width="98%">';
			if (cnt>1) {
				Out[Out.length]='<a href="javascript:ExpandNewsItem('+"'"+i+"'"+')" class="nounder">'+
				'<img src="'+StaticSiteName+'/img/expand'+small+'.gif" alt="" width="'+expandexW+'" height="'+expandexW+'" border="0" id="msg_expander_'+i+'"/>';
			}
			Out[Out.length]=B.n;
			if (B.l)
				Out[Out.length]='-'+cvts(B.l);
			if (cnt > 1)
				Out[Out.length]=' <small> (x'+cnt+')</small></a>';
			Out[Out.length]='</td><td align="right" valign="middle" width="1%"><small>';
			if (D.i > 0)
				DrawActions(B,D,cnt,UnitGroups[i]);
			Out[Out.length]='<div class="transfer_on_'+D.x+'_'+D.y+'" id="transfer_'+B.i+'_group">';
			DrawTransfers(B,D,Movable,cnt,UnitGroups[i]);
			Out[Out.length]='</div></small></td></tr>';
			if(CommonDescription)	//	width="500%" - hack IE bug with tables
				Out[Out.length]='<tr><td class="building_descr" colspan="2" width="500%"><small>'+B.d+'</small></td></tr>';
			DrawHPandUpkeep(B,D,cnt,Expendable,UnitGroups[i]);
			Out[Out.length]='</table></td></tr>';
			if (cnt<=1)
				continue;
			Out[Out.length]='<tr><td><div class="spoiler" id="news_body_row_'+i+'"><table>';
	
			for(var j=0; j<cnt; j++) {
				var un=U['i'+UnitGroups[i].units[j]];
				Out[Out.length]='<tr>';
				Out[Out.length]='<td valign="middle" class="building_name" width="98%" colspan="2"><a class="img" href="javascript:HelpWnd(\'/frames/unit_stats/on/'+un.i+'\')">'+un.n+'</a></td>';
				Out[Out.length]='<td align="right" valign="middle" width="1%"><small>';
				Out[Out.length]='<div class="transfer_on_'+D.x+'_'+D.y+'" id="transfer_'+B.i+'_single">';
				DrawTransfers(un,D,Movable,1);
				Out[Out.length]='</div></small></td></tr>';
				if(IsContainer(B.c)>0) Out[Out.length]='<tr><td class="building_descr" colspan="3"><small>'+un.d+'</small></td></tr>';
				Out[Out.length]='<tr><td valign="middle" width="1%" class="building_descr" colspan="3"><small>';
	
				var curlen=Out.length;
				DrawActions(un,D,1);
				if (curlen==Out.length)
					Out.pop();
				else
					Out[Out.length]='</small></td></tr>';
	
				DrawHPandUpkeep(un,D,1,Expendable,UnitGroups[i]);
			}
			Out[Out.length]='</table></div></td></tr>';
//		}
	}
}


function ActionAllowed(D,Allowed,ActionID){
	// reserch
	if(ActionID == 1)
		return !D.sr;

	var PlanetStateLetter;
	if (!D.ph){
		PlanetStateLetter='E';
	} else if (!isNaN(D.pr)){
		PlanetStateLetter=DiplomacyLetters[D.pr];
	} else if (D.hm){
		PlanetStateLetter='O';
	} else {
		PlanetStateLetter='U';
	}
	return D.oi || Allowed.search(PlanetStateLetter) != -1;
}

function GetAllienFleetNameByID(ID){
	return TbyID && TbyID['af'+ID] ? TbyID['af'+ID].n : 'Unknown';
}

function GetAvailableTargets(D,B,ignore_action){
	var ItemsFound=new Array();
	if (D.h || D.fa.a1 || D.fa.a2 || UnitUnderAction(B)  /* || (HasActions(D) && !ignore_action) */){
		return ItemsFound;
	}
	CanFitHere(F,B,D,ItemsFound);
//	CanFitHere(H,B,D,ItemsFound);
	return ItemsFound;
}

function CanFitHere(SubItems,B,D,Found){
	if(!SubItems)
		return;
	for (var i=0;i<SubItems.length;i++){
		switch (SubItems[i].t) {
			case 0: CanFitHere(SubItems[i].d,B,D,Found); break;
			case 2: if (SubItems[i].d.i != D.i
						&& SubItems[i].d.x==D.x && SubItems[i].d.y==D.y
						&& ((SubItems[i].d.tc-SubItems[i].d.tb >= 1 || B.t != 2) && (SubItems[i].d.cc-SubItems[i].d.cb >= 1 || B.t != 1) || SubItems[i].d.i == 0)
						&& SubItems[i].d.h == 0 && !SubItems[i].d.fa.a1 && !SubItems[i].d.fa.a2
						&& SubItems[i].d.ta == 0
						&& ((D.oi ? D.oi == SubItems[i].d.oi : 1) || D.i == 0)){ // Need testing
					Found[Found.length]=SubItems[i].d;
				}	break;
		}
	}
}


function ScriptMsg(D){
	Out[Out.length]='<b>Script: </b>';
	if (D.o){
		Out[Out.length]='<span class="ok">'+D.m+'</span>';
	} else {
		Out[Out.length]='<span class="hot1"><b>'+D.m+'</b></span>';
	}
	Out[Out.length]='<br>';
}

function HasActions(D){
	return Actions['f'+D.i]?1:0;
}

function UnitUnderAction(B){
	var re = new RegExp('u'+B.i+'_\\d+$');
	for(var i in Actions){
		if (re.test(i)){
			return 1;
		}
	}
	return 0;
}

function CreateFleetFromChoosen(FleetID){
	NewFleetName=prompt(GetLangMSG(134),'Fleet')
	if (NewFleetName) {
		if (NewFleetName.length > 30){
			alert(GetLangMSG(654));
			return false;
		}

		//	TODO

		document.getElementById('fleet_from_selected_form'+FleetID).new_fleet_name.value=NewFleetName;
		return true;
	} else {
		return false;
	}
}

function FleetChanged(FleetID, moveType, isGarrison, fleetOnly){
	//	moveType: 0 - флот не двигался, 1 - флот отправлен на другую планету, 2 - прыжек отменён, 3 - флот только что создан, 4 - требуется спрятать георазведку
	if(isGarrison && (!parent.Paid || LargeFrame))
		return;

	if(moveType == 3){
		if(!NewFleetId){
			alert('Error: new fleet failed');
			return;
		}
		FleetID = NewFleetId;
	}

	var Fleet = FindFleetInTree(FleetID, isGarrison ? HT : FT, isGarrison);
	var FleetPath;
	if(Fleet) {
		FleetPath = Fleet.fp;
		Fleet = Fleet.f;
	}
	//	Get fleet block
	var oldFleetPos = document.getElementById((isGarrison ? 'garrison_' : 'fleet_') + FleetID);
	var oldFleetRoot = oldFleetPos && oldFleetPos.parentNode;

	var newFleetPos;
	var newFleetRoot;
	if(oldFleetPos || moveType == 3) {
		if(Fleet && Fleet.d) {
			if(moveType==4){// Прячем георазведку
				var U=window.parent.frames.units_frame.AllUnitsBase;
				if(U) for(var i=1;i<Fleet.d.un.length;i++) if((B=U['i'+Fleet.d.un[i]])){
					var j=B.ac.length;
					while(--j>0) if(B.ac[j]==1) B.ac.splice(j,1);
				}
				moveType=0;
			}
			//	Find new fleet pos
			if(!parent.Paid || !moveType || isGarrison || MixedFleets || SkipGrouping) {
				newFleetPos = oldFleetPos;
				newFleetRoot = oldFleetRoot;
			} else {
				//	Пока-что флоты будем рисовать там-же, где они и были.
				newFleetPos = oldFleetPos;
				newFleetRoot = oldFleetRoot;
			}
			if(!newFleetRoot) {
				newFleetPos = null;
				newFleetRoot = document.getElementById(isGarrison ? 'js_harrisons_container' : 'js_fleets_container');
			}

			//	Redraw fleet
			Out.length = 0;
			var BlockID = isGarrison ? Fleet.d.x+'_'+Fleet.d.y : Fleet.d.i;
			var oldFleetBlock = document.getElementById('news_body_row_'+BlockID);
			var ItmPathA = Fleet.d.n.split(isGarrison?': ':':');
			if(parent.Paid){ // || notGrouping
				Fleet.d.sn = ItmPathA[ItmPathA.length - 1];
			}
			DrawFleet(Fleet.d, FleetPath.length > 1 ? FleetPath[1] : '');
			var inc = document.getElementById('incubator');
			if(!inc) {
				inc = document.createElement('div');
				inc.id				= 'incubator';
				inc.style.display	= 'none';
				document.getElementsByTagName('body')[0].appendChild(inc);
			}
			inc.innerHTML = Out.join('');
			var newFleet = inc.firstChild;
			newFleetRoot.insertBefore(newFleet, newFleetPos);
			inc.innerHTML = '';

			if(oldFleetRoot)
				oldFleetRoot.removeChild(oldFleetPos);

			if(moveType != 1 && oldFleetBlock && oldFleetBlock.style.display != 'none'){
				ExpandFleetItem(BlockID, Fleet.d.x, Fleet.d.y);
			}
		}
	}

	if(parent.Paid && parent.LiveMap && Fleet && parent.frames.skymap_frame.RefreshFleetOnMap) {
		parent.frames.skymap_frame.RefreshFleetOnMap(Fleet.d.i, Fleet.d, Fleet.d.x, Fleet.d.y, moveType, fleetOnly);
	}

	//	Redraw transfers for fleets on same planet and garrison
	if(fleetOnly || !Fleet)
		return;
	if(moveType == 1)
		RefreshTransfers(Fleet.d.fx, Fleet.d.fy);
	else
		RefreshTransfers(Fleet.d.x, Fleet.d.y);
}

function RefreshTransfers(X, Y){
	var toRedraw = getElementsByClassName('transfer_on_'+X+'_'+Y, this.document, 'div');
	for(var i = 0; i < toRedraw.length; i++) {
		var transferInfo = toRedraw[i].id.split('_');
		var UnitID = transferInfo[1];
		var type = transferInfo[2];
		Out.length=0;
		var td = TransferData[UnitID+'_'+type];
		DrawTransfers(td[0], td[1], td[2], td[3], td[4]);
		toRedraw[i].innerHTML = Out.join('');
	}
}

function FindFleetInTree(FleetID, Tree, isGarrison){
	for (var i=0;i<Tree.length;i++){
		switch (Tree[i].t) {
			case 0:
				var p = FindFleetInTree(FleetID, Tree[i].d, isGarrison);
				if(p) {
					p.fp.push(Tree[i].n);
					var fullFleetName = p.f.d.n;
					var pathStr = '';
					for(var i = 1; i < p.fp.length; i++)
						pathStr += p.fp[i] + (isGarrison ? ': ' : ':');
					p.f.d.sn = ('^##begin_'+fullFleetName).replace('^##begin_'+pathStr, '');
					return p;
				}
			break;
			case 2:
				if(isGarrison && Tree[i].d.x + '_' + Tree[i].d.y == FleetID || Tree[i].d.i == FleetID)
					return {fp:[''],f:Tree[i]};
			break;
		}
	}
	return null;
}
/*
function InsertFleetIntoTree(Fleet, Tree){
	var FleetPath=Fleet.d.n.slit(':');
	var TargetNode = Tree;
	pathLoop:
	while(FleetPath.length > 1) {
		var NamePart = FleetPath.shift();
		for (var i=0;i<TargetNode.d.length;i++){
			if(TargetNode.d[i].t == 0 && TargetNode.d[i].n == NamePart) {
				TargetNode = TargetNode.d[i];
				continue pathLoop;
			}
		}
		break;
	}
	Fleet.d.sn = FleetPath.join(':');
	TargetNode.d[TargetNode.length] = {t:2,d:Fleet.d}
}

function FindNewFleetPos(FleetID){
	var fleetHtml = document.getElementById('fleet_'+FleetID);
}
*/
function RedrawFleetOnLoad(FleetID, moveType, isGarrison, fleetOnly, needData, delayed){
	if(isGarrison && (!parent.Paid || LargeFrame))
		return;

	needData = needData || 1;
	RedrawOnUpdate.push([needData, FleetID, moveType, isGarrison, fleetOnly]);
	if(!delayed) {
		if(isGarrison) {
			var xy = FleetID.split('_');
			HarrisonsUpdater(xy[0], xy[1]);
		} else
			InsertFleetsUpdater();
	}
}

var UpdateInProgress=false;
function UpdateFleets(from){
	if(UpdateInProgress) {
		setTimeout('UpdateFleets("'+from+'")', 200);
		return;
	}
	UpdateInProgress = true;

	if(!F && from != 'units'){
		ReDraw();
		UpdateInProgress = false;
		return;
	}
	for(var i=0;i<RedrawOnUpdate.length;i++) {
		var args = RedrawOnUpdate[i];
		if(--args[0] <= 0) {
			FleetChanged(args[1], args[2], args[3], args[4]);
			RedrawOnUpdate.splice(i, 1);
			i--;
		}
	}
	UpdateInProgress = false;
}

var AllienFleetsHtml = null;
var AllienIncomingFleetsHtml = null;
var SortedAF;
var XYcache = [];
var prevSortBtn;
function SortAllinenFleets(param){
	var root = document.getElementById('news_body_row_wrp245');
	var insertAfter = document.getElementById('af_controls');
	if(AllienFleetsHtml == null){
		AllienFleetsHtml = {};
		AllienIncomingFleetsHtml = [];
		SortedAF = AF.slice(0);
		var re = /^aft_/;
		for(var node_id in root.childNodes){
			var Node = root.childNodes[node_id];
			if(Node.tagName && Node.tagName.toLowerCase() == 'table'){
				if(re.exec(Node.id))
					AllienFleetsHtml[Node.id] = Node;
				else
					AllienIncomingFleetsHtml[AllienIncomingFleetsHtml.length] = Node;
			}
		}
	}

	if(prevSortBtn){
		prevSortBtn.style.backgroundColor = prevSortBtn.oldBackgroundColor;
		prevSortBtn.value = prevSortBtn.value.replace('▾', '');
	}
	prevSortBtn = document.getElementById('sort_'+param);
	prevSortBtn.oldBackgroundColor = prevSortBtn.style.backgroundColor;
	prevSortBtn.style.backgroundColor = '#003377';
	prevSortBtn.value = prevSortBtn.value + '▾';

	var sortFunc;
	if(param == 'def')
		sortFunc = AFSortDef;
	if(param == 'dist'){
		sortFunc = AFSortDist;
		XYcache = parent.XY.split(':');
	}
	else if(param == 'xy')
		sortFunc = AFSortXY;
	else if(param == 'yx')
		sortFunc = AFSortYX;
	else if(param == 'w')
		sortFunc = AFSortWeight;
	else if(param == 'owner')
		sortFunc = AFSortRel;
	SortedAF.sort(sortFunc);

	while (root.lastChild.id != 'af_controls') {
		root.removeChild(root.lastChild);
	}

	var fleetOwner = null;
	for(var index in SortedAF) {
		var id = SortedAF[index].i;
		if(!id)
			continue;
		var fleetHtml = AllienFleetsHtml['aft_'+id];
		if(param == 'owner'){
			var Fleet = SortedAF[index];
			if(fleetOwner != Fleet.pn) {
				fleetOwner = Fleet.pn;
				
				var div = document.createElement('div');
				div.className = Fleet.rel == -1?'allien_fleet_nn':Fleet.l?'dlbl_'+Fleet.l:'allien_fleet_'+Fleet.rel;
				div.innerHTML = fleetOwner+':';
				root.appendChild(div);
			}
		}
		root.appendChild(fleetHtml);
	}
	for(var i = 0; i < AllienIncomingFleetsHtml.length; i++){
		root.appendChild(AllienIncomingFleetsHtml[i]);
	}
}

function AFSortDef(a, b){
	var relSort = (isNaN(a.rel) ? -1 : a.rel) - (isNaN(b.rel) ? -1 : b.rel);
	return relSort ? relSort : a.y - b.y ? a.y - b.y : a.x - b.x ? a.x - b.x : a.i - b.i;
}

function AFSortDist(a, b){
	var aDist = distance(XYcache[0], XYcache[1], a.x, a.y);
	var bDist = distance(XYcache[0], XYcache[1], b.x, b.y);
	return aDist - bDist ? aDist - bDist : AFSortRel(a,b);
}

function AFSortXY(a, b){
	return a.x - b.x ? a.x - b.x : a.y - b.y ? a.y - b.y :
						AFSortRel(a,b) ? AFSortRel(a,b) : AFSortOwner(a,b) ?
														AFSortOwner(a,b) : AFSortWeight(a,b);
}

function AFSortYX(a, b){
	return a.y - b.y ? a.y - b.y : a.x - b.x ? a.x - b.x :
						AFSortRel(a,b) ? AFSortRel(a,b) : AFSortOwner(a,b) ?
														AFSortOwner(a,b) : AFSortWeight(a,b);
}

function AFSortWeight(a,b){
	return b.w - a.w ? b.w - a.w : AFSortRel(a,b) ? AFSortRel(a,b) : AFSortOwner(a, b);
}

function AFSortOwner(a,b){
	if(! a.p)
		return b.p ? 1 : 0;
	if(! b.p)
		return a.p? -1 : 0;
	return a.pn.localeCompare(b.pn);
}

function AFSortRel(a,b){
	var relSort = (isNaN(a.rel) ? -1 : a.rel == 0 ? -2 : a.rel) - (isNaN(b.rel) ? -1 : b.rel == 0 ? -2 : b.rel);
	return relSort ? relSort : AFSortOwner(a,b) ? AFSortOwner(a,b) : b.w - a.w;
}

var PlanetsMsgsLoaded = {};
function openPlanetLogs(X, Y) {
	if (PlanetsMsgsLoaded[X+'_'+Y]) {
		ScrollToPlanetMsgs(X, Y);
		return;
	}
	var loader = document.getElementById('msgs_loader_container');
	var iframe = document.createElement('iframe');
	iframe.style.display = 'none';
	iframe.name = iframe.id = 'iframe_msgs_loader_pl'+X+'_'+Y;
	loader.appendChild(iframe);
	iframe.src = "/blackframes/load_local_msgs/on/1/?planetid="+X+":"+Y+"&amp;on=army&amp;turn="+parent.TurnN;

	PlanetsMsgsLoaded[X+'_'+Y] = 1;
/*
//	Раскритоковано :)
	var mainSource = document.getElementById('news_body_full_0');
	var planetLogs = getElementsByClassName('plm_'+X+'_'+Y, mainSource, 'table');
	
	for (var i = 0; i < planetLogs.length; i++){
		var log = planetLogs[i];
		localBlock.appendChild(log.cloneNode(true));
	}
*/
}

function FilteredMsgsLoadEnd(iframeName) {
	setTimeout ('_FilteredMsgsLoadEnd(\''+iframeName+'\')', 1);
	return true;
}

function _FilteredMsgsLoadEnd(iframeName) {
	var iframe = window['iframe_'+iframeName];
	var localBlock = document.getElementById('news_body_row_wrp1323');

	var i = 0;
	for (i = 0; i < iframe.document.body.childNodes.length; i++) {
		var node = iframe.document.body.childNodes[i];
		if (!node || !node.tagName || node.tagName.toLowerCase() != 'table') {
			continue;
		}
		var coords = /(\d+)_(\d+)/.exec(node.className);
		var X = coords[1], Y = coords[2];
		var targetBlock = document.getElementById('news_body_row_localmsgs_'+X+'_'+Y);
		if (!targetBlock) {
			var PlanetInfo = window.parent.skymap_frame.GetPlanetData(X, Y);
			var plName = PlanetInfo.n || 'N'+X+':'+Y;
			var inc = document.getElementById('msgs_incubator');
			inc.innerHTML =
				'<table class="spoiler" cellspacing="0" cellpadding="1" border="0" width="100%"><tr><td width="1%" valign="middle">'+
				'<a href="javascript:ExpandNewsItem(\'localmsgs_'+X+'_'+Y+'\')">'+
				'<img id="msg_expander_localmsgs_'+X+'_'+Y+'" height="18" border="0" width="15" alt="" src="'+StaticSiteName+'/img/expand.gif"/></a></td><td width="97%" class="bold">'+
				'<a class="nounder super_white" href="javascript:ExpandNewsItem(\'localmsgs_'+X+'_'+Y+'\')">'+plName+'</a>'+
				' <a onmouseover="BlinkItem('+X+','+Y+')" href="javascript:window.parent.frames[\'skymap_frame\'].ScrollMapTo('+X+','+Y+')" class="nounder" style="font-weight: normal;">('+X+':'+Y+')</a>'+
				'</td></tr>'+
				'<tr><td colspan="2"><img height="1" width="1" alt="" src="'+StaticSiteName+'/img/z.gif"/><br/>'+
				'<div id="news_body_row_localmsgs_'+X+'_'+Y+'" class="fleetwrapperbody">'+
				'</div></td></tr></table>';
			var groupTable = inc.firstChild;
			inc.removeChild(groupTable);
			localBlock.appendChild(groupTable);
			targetBlock = document.getElementById('news_body_row_localmsgs_'+X+'_'+Y);
		}

		if (document.importNode) {
			targetBlock.appendChild(document.importNode(node, true));
		}
		else {
			//	IE patch
			var tempNode = document.createElement('div');
			tempNode.innerHTML = node.outerHTML;
			targetBlock.appendChild(tempNode.firstChild);
		}
	}

	if (i){
		document.getElementById('msgs_loader_container').removeChild(document.getElementById('iframe_msgs_loader_pl'+X+'_'+Y));
		ScrollToPlanetMsgs(X, Y);
	}
}

function ScrollToPlanetMsgs(X, Y) {
	var node = document.getElementById('msg_expander_localmsgs_'+X+'_'+Y);

	var div = document.getElementById('news_body_row_wrp1323');
	if(div.style.display != 'block')
		ExpandNewsItem('wrp1323');

	div = document.getElementById('news_body_row_localmsgs_'+X+'_'+Y);
	if(!div)
		return;
	if(div.style.display != 'block')
		ExpandNewsItem('localmsgs_'+X+'_'+Y);
/*
	var yPos = 0;
	var node2 = node;
    if (node2.offsetParent) {
        yPos = node2.offsetTop;
        while (node2 = node2.offsetParent) {
            yPos += node2.offsetTop
        }
    }
	if(yPos)
		window.scrollTo(0, yPos);
*/
}

// =============================================================================
// Service functions
function GoDrawFleets(aFleetsTree,Element,isHarrison){
	Out.length=0;
	if(isHarrison)
		HT=SortFleets(aFleetsTree, isHarrison);
	else
		FT=SortFleets(aFleetsTree, isHarrison);
//	DrawFleetGroup(FT[0],'');
//	if(!isHarrison)
//		DrawFleetGroup(FT[1],'');
	DrawFleetGroup(isHarrison?HT:FT,'');
	Element.innerHTML=Out.join('');
}

function DrawFleets(){
	if(!window.parent.frames.units_frame.ActionDescrs ||
			!window.parent.frames.flets_frame.FleetsTree ||
			!window.parent.frames.foreighn_fleets_frame.ForeighnFleets ||
			!window.parent.frames.units_frame.Customs){
		setTimeout ("DrawFleets()", 100);
	}else{
		A=window.parent.frames.units_frame.ActionDescrs;
		F=window.parent.frames.flets_frame.FleetsTree;
		AF=window.parent.frames.foreighn_fleets_frame.ForeighnFleets;
		Customs=window.parent.frames.units_frame.Customs;
		if (parent.Paid){
			C=window.parent.frames.harrisons_frame.CargoMoves;
			H=window.parent.frames.harrisons_frame.Harrisons;
			TbyXY=[];
			TbyID=[];
			for (var i = 0; i < AF.length; i++) {
				if (AF[i].ta)
					continue;
				TbyID['af'+AF[i].i] = AF[i];
				var xy = AF[i].x + ':' +AF[i].y;
				if(!TbyXY[xy])
					TbyXY[xy] = new Array();
				TbyXY[xy].push(AF[i]);
			}
		}
		GoDrawFleets(F,document.getElementById('js_fleets_container'),0);
	}
}
function DrawHarrisons(){
	if (!document.getElementById('js_harrisons_container') || !A || !F || !AF || !Customs){
		setTimeout ("DrawHarrisons()", 100);
	} else {
		GoDrawFleets(window.parent.frames.harrisons_frame.Harrisons,document.getElementById('js_harrisons_container'),1);
	}
}
function FakeFunc() {
	return true;
}

function Finisher(args) {
	InsertFleetsUpdater();
	if(args.i1==0 || args.i2==0)
		HarrisonsUpdater(args.x,args.y);
}
function InsertFleetsUpdater(){
	if (window.parent.SnapShotTime
			&& window.parent.AllUnnitsLoaded
			&& (!parent.Paid || window.parent.HarrisonsLoaded)){
		document.getElementById('js_fleets_updater_container').innerHTML =
			'&nbsp;<iframe src="/blackframes/fetch_fresh_fleets/on/'+window.parent.frames.flets_frame.SnapShotTime+
			'/?rand='+Math.random()+'" marginheight="0" marginwidth="0" frameborder="0" height="0" width="0" scrolling="no"></iframe>';
	} else {
		setTimeout ("InsertFleetsUpdater()", 20);
	}
}
function HarrisonsUpdater(x,y){
	if (window.parent.AllUnnitsLoaded
			&& window.parent.HarrisonsLoaded){
		document.getElementById('js_harrisons_updater_container').innerHTML = '&nbsp;<iframe src="/blackframes/fetch_one_harrison/on/'+x+':'+y+
			'/?rand='+Math.random()+'" marginheight="0" marginwidth="0" frameborder="0" height="0" width="0" scrolling="no"></iframe>';
	} else {
		setTimeout ("HarrisonsUpdater("+x+','+y+")", 20);
	}
}

function ReplaceHarrison(NewHar,NewCargo){
	if(!NewHar || !NewHar.d)
		return 0;
	NewHar = NewHar.d;

	Harrisons = window.parent.frames.harrisons_frame.Harrisons;
	for (var i=0;i<Harrisons.length;i++){
		if (Harrisons[i].d.x == NewHar.x && Harrisons[i].d.y==NewHar.y){
//			Harrisons[i].d=NewHar;
			for(var k in Harrisons[i].d)
				delete Harrisons[i].d[k];
			for(var k in NewHar)
				Harrisons[i].d[k] = NewHar[k];
			break;
		}
	}
	for (var i=1;i<NewHar.un.length;i++)
		C['c'+NewHar.un[i]] = NewCargo['c'+NewHar.un[i]];
	return 0;
}

function ApplyPatch(Patch){
	var FleetsTree=window.parent.frames.flets_frame.FleetsTree;
	var OutgoingFleetsByXY = window.parent.frames.flets_frame.OutgoingFleetsByXY;
	var FleetsByXY = window.parent.frames.flets_frame.FleetsByXY;
	for (var i=0;i<Patch.length;i++){
		if (!(ReplaceFleet(FleetsTree,Patch[i].d))){
			//	New fleet
			NewFleetId = Patch[i].d.i;
			FleetsTree.splice(0,0,{t:2,d:Patch[i].d});
			if(FT) FT.splice(0,0,{t:2,d:Patch[i].d});

			// Update xy index
			var FleetsByXY = window.parent.frames.flets_frame.FleetsByXY;
			var xy = Patch[i].d.x+':'+Patch[i].d.y;
			if(!FleetsByXY[xy])
				FleetsByXY[xy] = [];
			FleetsByXY[xy].push(Patch[i].d);

			if(Patch[i].d.ta > 0 && !Patch[i].d.it){
				xy = Patch[i].d.fx + ':' + Patch[i].d.fy;
				if(!OutgoingFleetsByXY[xy])
					OutgoingFleetsByXY[xy] = [];
				OutgoingFleetsByXY[xy].push(Patch[i].d);
			}
		}
	}
	if (Patch.length > ReloadWhenManyPatches){
		window.parent.frames.flets_frame.document.location.reload();
	}
}

function ReplaceFleet(Fleets,NewData){
	var FleetsByXY = window.parent.frames.flets_frame.FleetsByXY;
	var OutgoingFleetsByXY = window.parent.frames.flets_frame.OutgoingFleetsByXY;
	for (var i=0;i<Fleets.length;i++){
		if (Fleets[i].t == 0 && ReplaceFleet(Fleets[i].d,NewData) > 0){
			return 1;
		}
		if (Fleets[i].t == 2 && Fleets[i].d.i == NewData.i){
			//	Update xy index
			if(Fleets[i].d.x != NewData.x || Fleets[i].d.y != NewData.y){
				//	Fleet moved...
				var xy = NewData.x+':'+NewData.y;
				var FleetsOnPl = FleetsByXY[Fleets[i].d.x+':'+Fleets[i].d.y];
				for(var j=0; j<FleetsOnPl.length; j++){
					if (FleetsOnPl[j].i == Fleets[i].d.i){
						FleetsOnPl.splice(j, 1);
						break;
					}
				}
				if(Fleets[i].d.fx){
					var OutgoingFleetsOnPl = OutgoingFleetsByXY[Fleets[i].d.fx+':'+Fleets[i].d.fy] || [];
					for(var j=0; j<OutgoingFleetsOnPl.length; j++){
						if (OutgoingFleetsOnPl[j].i == Fleets[i].d.i){
							OutgoingFleetsOnPl.splice(j, 1);
							break;
						}
					}
					if(Fleets[i].d.x != NewData.x || Fleets[i].d.y != NewData.y){
						//	сохраним куда летел флот
						NewData.prevX = Fleets[i].d.x;
						NewData.prevY = Fleets[i].d.y;
					}
				}

				if(!FleetsByXY[xy])
					FleetsByXY[xy] = [];
				FleetsByXY[xy].push(Fleets[i].d);

				if(NewData.ta > 0 && !NewData.it){
					xy = NewData.fx + ':' + NewData.fy;
					if(!OutgoingFleetsByXY[xy])
						OutgoingFleetsByXY[xy] = [];
					OutgoingFleetsByXY[xy].push(Fleets[i].d);
				}
			}

			for(var k in Fleets[i].d)
				delete Fleets[i].d[k];
			for(var k in NewData)
				Fleets[i].d[k] = NewData[k];
//			Fleets[i].d=NewData;
			return 1;
		}
	}
	return 0;
}

function BuildFleetsCache(){
	var Fleets = window.parent.frames.flets_frame.FleetsTree;
	var FleetsByXY = window.parent.frames.flets_frame.FleetsByXY;
	var OutgoingFleetsByXY = window.parent.frames.flets_frame.OutgoingFleetsByXY;
	for (var i=0;i<Fleets.length;i++){
		if (Fleets[i].t == 2){
			var xy = Fleets[i].d.x + ':' + Fleets[i].d.y;
			if(!FleetsByXY[xy])
				FleetsByXY[xy] = [];
			FleetsByXY[xy].push(Fleets[i].d);

			if(Fleets[i].d.ta > 0 && !Fleets[i].d.it){
				xy = Fleets[i].d.fx + ':' + Fleets[i].d.fy;
				if(!OutgoingFleetsByXY[xy])
					OutgoingFleetsByXY[xy] = [];
				OutgoingFleetsByXY[xy].push(Fleets[i].d);
			}

			if(!Fleets[i].d.oi || Fleets[i].d.ta)
				continue;
			TbyID['af'+Fleets[i].d.i] = Fleets[i].d;
			//if(!TbyXY[xy])
			//	TbyXY[xy] = new Array();
			//TbyXY[xy].push(AF[i]);
		}
	}
}

function BuildForeighnFleetsByXY(){
	var Fleets = window.parent.frames.foreighn_fleets_frame.ForeighnFleets;
	var ForeighnFleetsByXY = window.parent.frames.foreighn_fleets_frame.ForeighnFleetsByXY;
	for (var i=0;i<Fleets.length;i++){
		var xy = Fleets[i].x + ':' + Fleets[i].y;
		if(!ForeighnFleetsByXY[xy])
			ForeighnFleetsByXY[xy] = [];
		ForeighnFleetsByXY[xy].push(Fleets[i]);
	}
}

function EscapeName(Name){
	if (!Name)
		return Name;
	Name=Name.replace(/</g,'&lt;');
	return Name.replace(/>/g,'&gt;');
}

function SwitchSelection(gid) {
	var list = this.document.getElementById('news_body_row_'+gid).getElementsByTagName('input');
	var is_checked = this.document.getElementById('nf_check_'+gid).checked;
	for (var i=0; i<list.length; i++)
		list[i].checked = is_checked
}

function GatherUnitsForMassAction(gid,PromptToAll) {
	var list = this.document.getElementById('news_body_row_'+gid).getElementsByTagName('input');
	var CheckedList = new Array();
	var i;
	for(i=0;i<list.length;i++) if(list[i].checked) CheckedList[CheckedList.length]=list[i].value;
	if(CheckedList.length<1 && PromptToAll && confirm(PromptToAll))
		for(i=0;i<list.length;i++) if(list[i].type=='checkbox') CheckedList[CheckedList.length]=list[i].value;
	return CheckedList;
}

function MassMove(gid, FleetTo,DoneFunc,args) {
	var ToMove = this.GatherUnitsForMassAction(gid);
	if(!ToMove.length)
		return;
	for (i = 1; i < ToMove.length; i++)
		parent.MoveUnitToFleetQuick(ToMove[i],FleetTo,FakeFunc,args);
	parent.MoveUnitToFleetQuick(ToMove[0],FleetTo,DoneFunc,args);
}

function MassUnpack(gid, FleetID, IsUn, DoneFunc,args) {
	var ToUnpack = this.GatherUnitsForMassAction(gid);
	if(!ToUnpack.length)
		return;
	var decide;
	if(ToUnpack.length == 1)
		decide = confirm(GetLangMSG(584));
	else
		decide = confirm(GetLangMSG(1129)+String(ToUnpack.length));
	if(!decide)
		return;
	for (i = 1; i < ToUnpack.length; i++)
		parent.UnpackUnitQuick(FleetID,ToUnpack[i],IsUn,FakeFunc,args,1);
	parent.UnpackUnitQuick(FleetID,ToUnpack[0],IsUn,DoneFunc,args,1);
}
function MassDisband(gid, FleetID, DoneFunc,args) {
	var ToDisband = this.GatherUnitsForMassAction(gid);
	if(!ToDisband.length)
		return;
	var decide;
	if(ToDisband.length == 1)
		decide = confirm(GetLangMSG(126));
	else
		decide = confirm(GetLangMSG(1128)+ToDisband.length);
	if(!decide)
		return;
	for (i = 1; i < ToDisband.length; i++)
		parent.DisbandUnitQuick(FleetID,ToDisband[i],FakeFunc,args,1);
	parent.DisbandUnitQuick(FleetID,ToDisband[0],DoneFunc,args,1);
}
function MassAction(gid, ActionID, DoneFunc,mc,sc,cc,Cancel,FleetID,x,y,PromptToAll) {
	var Units = this.GatherUnitsForMassAction(gid,PromptToAll);
	var ToPerform = new Array();
	for (i = 0; i < Units.length; i++)
		if (Actions['u'+Units[i]+'_'+ActionID] && Cancel)
			ToPerform[ToPerform.length] = {a: Actions['u'+Units[i]+'_'+ActionID], u:Units[i]};
		else if (!Actions['u'+Units[i]+'_'+ActionID] && !Cancel)
			ToPerform[ToPerform.length] = {a: ActionID, u:Units[i]};
	if(!ToPerform.length)
		return;
	for (i = 1; i < ToPerform.length; i++)
		parent.PerformActionQuick(ToPerform[i].u,ToPerform[i].a,FakeFunc,0,0,0,Cancel,FleetID,x,y);
	parent.PerformActionQuick(ToPerform[0].u,ToPerform[0].a,DoneFunc,mc,sc,cc,Cancel,FleetID,x,y);
}

function MassCustomize(gid, DoneFunc, args) {
	var Units = this.GatherUnitsForMassAction(gid);
	var list = new Array();
	var U = window.parent.frames.units_frame.AllUnitsBase;
	for (i = 0; i < Units.length; i++)
		if (U['i'+Units[i]].u==0)
			list.push(Units[i])
	if(!list.length)
		return;
	for (i = 1; i < list.length; i++)
		parent.CustomizeQuick(list[i], args.x+':'+args.y, FakeFunc,args);
	parent.CustomizeQuick(list[0], args.x+':'+args.y, DoneFunc, args);
}
function MassCancelLoad(gid, DoneFunc, args) {
	if (!C)
		return;
	var Units = this.GatherUnitsForMassAction(gid);
	var list = new Array();
	for (i = 0; i < Units.length; i++)
		if (C['c'+Units[i]])
			list.push(Units[i])
	if(!list.length)
		return;
	for (i = 1; i < list.length; i++)
		parent.CancelCargoLoadQuick(list[i], FakeFunc,args);
	parent.CancelCargoLoadQuick(list[0], DoneFunc, args);
}
