var CellList= new Array('laser_number','bomb_number','build_speed','cost_pepl','spec_ability','transport_capacity','carrier');
var RowList= new Array('cost_main','cost_second','cost_money','support_main','support_second','laser_ar','laser_damage','bomb_ar','bomb_damage','detect_range','hit_points','laser_dr','bomb_dr','scan_strength','stealth_lvl','motivator','fuel','weight','max_weight');

function EnaBut(id,creator){
	document.getElementById('shassi_submit_'+id+'_'+creator).disabled=0;
	document.getElementById('shassi_submit_'+id+'_'+creator).style.color='white'
}

var MaxLVLAvail=16;
var HLColor='#66CCFF';
var HLBackColor='#333333';
var StringValuesSeparator=', ';

try {
	for (var i=0; i<document.styleSheets.length; i++) {
		var styleSheet=document.styleSheets[i];
		var ruleset = styleSheet.cssRules || styleSheet.rules;
		for (var j=0; j< ruleset.length; j++) {
			var cssRule = ruleset[j];
			if (cssRule.selectorText!="#HighLight")
				continue;
			HLColor=cssRule.style.color;
			HLBackColor=cssRule.style.backgroundColor;
			break;
		}
	}
} catch (e) {
//	alert("Your browser doesn't allow access to external stylesheet")
}

var PrevActiveA;
var PrevActiveD;
var RowN=0;
var PrevN=-1;
var Unit;
var ActiveSection=0;
var ActiveCell=0;

function ParamOnLVL(STDValue,ReqTL,LVL,LLVDelta,Exp){
	return LLVDelta>0 ? (Exp ? STDValue*Math.pow(1+LLVDelta,LVL) : STDValue*(1+(ReqTL+LVL)*LLVDelta)/(1+ReqTL*LLVDelta)) : STDValue;
}

function InitialFill(){
	var WarnShown=new Array(),ReplaceAlways=0;
	for(var i=1;i<=6;i++) if(window.parent.FilledCells['sc'+i]){
		for(var i1=1;i1<=window.parent.FilledCells['sc'+i].length;i1++){
			var cell_content=window.parent.FilledCells['sc'+i][i1-1],
				builder_nm=cell_content.nm.replace(/(\d+_)\d+/,'$1'+window.parent.BuilderRace.id);
			if(ItemDescrs['p'+cell_content.nm]){
				window.parent.document.getElementById('secbut_'+i+'_'+i1).value=ItemDescrs['p'+cell_content.nm].name+((cell_content.nm==builder_nm)?'':'*')+' '+cvts(cell_content.lvl);
				window.parent.document.getElementById('secin_'+i+'_'+i1).value=cell_content.nm+'_'+cell_content.lvl;
			}else{
				var itm=ItemDescrs['p'+builder_nm];
				if(itm && (ReplaceAlways==2 || confirm('Import part "'+itm.name+'" '+cell_content.nm+' is missing. Use part from builder`s race?',"YesToAll"))){
					if(ReplaceAlways<1) ReplaceAlways=confirm('Replace so for all missing parts?') ? 2 : 1;
					cell_content.nm=builder_nm;
					window.parent.document.getElementById('secbut_'+i+'_'+i1).value=ItemDescrs['p'+builder_nm].name+' '+cvts(cell_content.lvl);
					window.parent.document.getElementById('secin_'+i+'_'+i1).value=builder_nm+'_'+cell_content.lvl;
				}else WarnShown.push(cell_content.nm);
			}
		}
	}
	window.parent.document.getElementById('carapace_lvl').value=window.parent.FilledCells.sc0[0].lvl;
	if(WarnShown.length>0) alert('Parts ('+WarnShown.join(',')+') are missing! Perhaps downgrade happened!');
}

function FillChassisBonuses(Show, initImageTitleOnly){
   var BonusTable=window.parent.peaceinfo.document.getElementById('BonusTable');
   if(BonusTable){
		var nrid=Show ? BonusTable.rows[0].id : 'hidden';
		if(nrid=='source'){
			var itm=ItemDescrs['p'+window.parent.FilledCells.sc0[0].nm];
			var BTNames=BonusTable.rows[0],BTVals=BonusTable.rows[1];
			for(var i=1;i<BTNames.cells.length;i++){
				var CurCell=BTNames.cells.item(i);
				if(itm[CurCell.id] && itm[CurCell.id]!=0){
					var NewValue=BTVals.insertCell(-1);
					NewValue.align='center';
					var val=itm[CurCell.id];
					var newValueText=(val>0 ? '+' : '')+val;
					if(!CurCell.id.match('_abs_')) newValueText+='%';
					NewValue.innerHTML = newValueText;
				}else BTNames.deleteCell(i--);
			}
			nrid=BTVals.cells.length>1 ? '' : 'hidden';
			BonusTable.rows[0].id=nrid;
		}
      BonusTable.style.display=(nrid!='hidden') ? 'block' : 'none';
   }
}

function initImageTitle() {
	if (!window.parent.peaceinfo || !window.parent.peaceinfo.document || !window.parent.peaceinfo.document.getElementById('BonusTable')) {
		setTimeout("initImageTitle()", 200);
		return;
	}
	  
	var BonusTable = window.parent.peaceinfo.document.getElementById('BonusTable');
	var textDescription = '';
	if(BonusTable) {
		var itm = ItemDescrs['p'+window.parent.FilledCells.sc0[0].nm];
		var BTNames=BonusTable.rows[0], BTVals=BonusTable.rows[1];
		for(var i=1 ; i < BTNames.cells.length; i++){
			var CurCell=BTNames.cells.item(i);
			if(itm[CurCell.id] && itm[CurCell.id] != 0) {
				var val = itm[CurCell.id];
				var newValueText = (val > 0 ? '+' : '') + val;
				if (!CurCell.id.match('_abs_')) newValueText += '%';
				textDescription += CurCell.innerHTML + ": " + newValueText + "\n";
			}
		}
	}

	var imgs = window.parent.document.getElementsByTagName('img');
	for (var i = 0; i < imgs.length; i++) {
		var img = imgs[i];
		if (img.src.indexOf('buildings/carps') > -1) {
			if (textDescription) {
				img.title = textDescription;
			}
			img.onclick = function () { SwitchUnit(-1) };
			img.style.cursor = 'pointer';
		}
	}
	window.parent.document.onkeydown = 
		window.parent.peaceinfo.document.onkeydown = 
		window.parent.unitsummary.document.onkeydown = 
		document.onkeydown = processKeyDown;
}

function processKeyDown(e) {
	if (!e) e = window.event;
	if (e.shiftKey || e.altKey || e.ctrlKey)
		return;		// don't react on Ctrl+C like combinations
		
	if (e.keyCode  == 67) {		// 'c'
		EmptyCell();
	}
	else if (e.keyCode == 76) {	// 'l'
		if (LastSwitchedPart) {
			realPrevN = PrevN;
			SwitchUnit(LastSwitchedPart);
			SwitchCol(realPrevN);
		}
	}
	if (e.keyCode == 77) {		// 'm'
		SwitchCol(getUnit(LastSwitchedPart).maxlvl);
	}
}

function getUnit(UnitID) {
	var Unit = null;
	if(UnitID==-1) 
		Unit=ItemDescrs['p'+window.parent.FilledCells.sc0[0].nm];
	else if(UnitID)
		Unit=ItemDescrs['p'+UnitID];
	
	return Unit;
}

var LastSwitchedPart = 0;
var UnitSwitched=0;
function SwitchUnit(UnitID){
	if(!UnitSwitched){
		UnitSwitched=1;
		var Aborted=0;
		if(UnitID==-1) Unit=ItemDescrs['p'+window.parent.FilledCells.sc0[0].nm];
		else if(UnitID){
			Unit=ItemDescrs['p'+UnitID];
			if(!Unit || !Unit['s'+ActiveSection]){
				alert(msgWrongCell);
				Aborted=1;
			}
		}
		if(!Aborted){
			var NextActiveA=document.getElementById('piece_'+UnitID);
			var SamePart=PrevActiveA && PrevActiveA==NextActiveA;
			if(PrevActiveA && !SamePart){
				PrevActiveA.style.color='white';
				PrevActiveD.style.backgroundColor='Transparent';
			}
			if(!UnitID){
				window.parent.peaceinfo.document.getElementById('CellForBigTable').innerHTML='&nbsp;';
				for(var i=0;i<CellList.length;i++){
					window.parent.peaceinfo.document.getElementById(CellList[i]).innerHTML='-';
				}
				Unit='';
				PrevActiveA=0;
				Aborted=1;
			}
		}
		if(!Aborted){
			PrevActiveA=NextActiveA;
			PrevActiveD=document.getElementById('piecediv_'+UnitID);
		
			if(SamePart && ActiveCell && window.parent.document.getElementById('secbut_'+ActiveSection+'_'+(ActiveCell+1))) SwitchCell(ActiveSection,ActiveCell+1);
		
			var TableText='<table border="0" cellpadding="2" cellspacing="1" class="carapacedescr" width="60%"><tr><td aligh="right" rowspan="2" colspan="2">&nbsp;</td>';
			var LocalMaxLvl=MaxLVLAvail>Unit.maxlvl ? MaxLVLAvail : Unit.maxlvl;
			for (var i=0;i<=LocalMaxLvl;i++){
				TableText+='<td align="center" valign="bottom" width="3%"'+((i>Unit.maxlvl)?' class="piece_disabled"':'')+'><b>'+cvts(i)+'</b></td>';
			}
			TableText+='</tr><tr>';
			for (var i=0;i<=LocalMaxLvl;i++){
				TableText+='<td align="center" class="bc" id="cell_0_'+i+'">'+
				((i<=Unit.maxlvl)?('<input id="radio_'+i+'" type="radio" name="lvl" value="'+i+'" class="checkbox" style="width:12px;height:12px;" onclick="window.parent.window.peacelist.SwitchCol('+i+
					')"'+(Unit.maxlvl==i?' checked':'')+'>'):'&nbsp;')+
				'</td>';
			}
			TableText+='</tr>';
			PrevN=-1;
			RowN=1;
			var Calc_Import=window.parent.unitsummary.document.getElementById('calc_import') && window.parent.unitsummary.document.getElementById('calc_import').checked,
				bldr_race=window.parent.BuilderRace.id;
			for (var i=0;i<RowList.length;i++){
				var RowIsExp=0,exp_grow=0;
				for(var i0=0;i0<ExpCalcTags.length;i0++) if(ExpCalcTags[i0]==RowList[i]){
					RowIsExp=1;
					exp_grow=Unit.exp_pricegrow;
					i0=ExpCalcTags.length;
				}
				if (Unit[RowList[i]] && Unit[RowList[i]]*1!=0 && (!RowIsExp || Unit.creator_race==bldr_race || Calc_Import)){
					TableText+='<tr><td align="right" width="1%"><nobr>'+Hints[RowList[i]]+'</nobr></td><td width="1%">&nbsp;</td>';
					for (var i1=0;i1<=LocalMaxLvl;i1++){
						val=Math.round(ParamOnLVL(Unit[RowList[i]],Unit.req_tehn_level,i1,exp_grow>0 ? exp_grow : RowGrowers[RowList[i]],exp_grow>0));
						TableText+='<td id="cell_'+RowN+'_'+i1+'" align="right"'+((i1>Unit.maxlvl)?' class="bc piece_disabled" ':' class="bc"')+'><label for="radio_'+i1+'"><nobr>'+
							val+'<nobr></td>';
					}
					TableText+='</label></tr>';
					RowN++;
				}
			}
			TableText+='</table>';
			window.parent.peaceinfo.document.getElementById('CellForBigTable').innerHTML=TableText;
			for(var i=0;i<CellList.length;i++){
				window.parent.peaceinfo.document.getElementById(CellList[i]).innerHTML=Unit[CellList[i]];
			}
			FillChassisBonuses(UnitID<=0);
			if(UnitID==-1){
				if(ActiveCell){
					var ActiveCellStyle=window.parent.document.getElementById('secbut_'+ActiveSection+'_'+ActiveCell);
					if(ActiveCellStyle){
						ActiveCellStyle=ActiveCellStyle.style;
						ActiveCellStyle.color='white';
						ActiveCellStyle.borderColor='#9D9D9D';
						ActiveCellStyle.fontWeight='Normal';
						ActiveCellStyle.backgroundColor='Black';
					}
				}
				ActiveSection=0;
				ActiveCell=1;
				SwitchCol(window.parent.FilledCells.sc0[0].lvl);
				document.getElementById('clean_cell_link').style.display='none';
			}else{
				if(!window.parent.FilledCells['sc'+ActiveSection]) 
					window.parent.FilledCells['sc'+ActiveSection]=new Array();
				if(!window.parent.FilledCells['sc'+ActiveSection][ActiveCell-1]){
					window.parent.FilledCells['sc'+ActiveSection][ActiveCell-1]={nm:UnitID,lvl: Unit.transport_capacity ? 0 : Unit.maxlvl, maxlvl: Unit.maxlvl}
				}else{
					window.parent.FilledCells['sc'+ActiveSection][ActiveCell-1].nm=UnitID;
//					window.parent.FilledCells['sc'+ActiveSection][ActiveCell-1].lvl=Unit.maxlvl;
					var newLevel = 0;
					// if prev part had maximum level then set max level for new one
					if (window.parent.FilledCells['sc'+ActiveSection][ActiveCell-1].lvl == window.parent.FilledCells['sc'+ActiveSection][ActiveCell-1].maxlvl) {
						newLevel = Unit.maxlvl;
					}
					else {
						newLevel = Unit.maxlvl < window.parent.FilledCells['sc'+ActiveSection][ActiveCell-1].lvl ? 
										Unit.maxlvl 
										: window.parent.FilledCells['sc'+ActiveSection][ActiveCell-1].lvl;
					}
					window.parent.FilledCells['sc'+ActiveSection][ActiveCell-1].lvl = newLevel;
					window.parent.FilledCells['sc'+ActiveSection][ActiveCell-1].maxlvl = Unit.maxlvl;
				}
				SwitchCol(window.parent.FilledCells['sc'+ActiveSection][ActiveCell-1].lvl)
				InitialFill();
				document.getElementById('clean_cell_link').style.display='block';
			}
			PrevActiveA.style.color=HLColor;
			PrevActiveD.style.backgroundColor=HLBackColor;
			
			LastSwitchedPart = UnitID;
		}
		UnitSwitched=0;
	}
}

function SwitchCol(colN){
	if(PrevN!=-1){
		for(var i=0;i<RowN;i++){
			var ctrl=window.parent.peaceinfo.document.getElementById('cell_'+i+'_'+PrevN);
			if(ctrl){
				ctrl.style.backgroundColor='Black';
				ctrl.style.color='white';
			}
		}
	}
	for(var i=0;i<RowN;i++){
		var ctrl=window.parent.peaceinfo.document.getElementById('cell_'+i+'_'+colN);
		if(ctrl){
			ctrl.style.backgroundColor=HLBackColor;
			ctrl.style.color=HLColor;
		}
	}
	PrevN=colN;
	var ColRadio=window.parent.peaceinfo.document.getElementById('radio_'+colN);
	if(ColRadio && !ColRadio.checked) ColRadio.checked='checked';
	window.parent.FilledCells['sc'+ActiveSection][ActiveCell-1].lvl=colN;
	InitialFill();
	CalculateShip();
}

function CreateCellButton(Sect,Cell){
	var retval=window.parent.document.createElement('div');
	retval.className='sectioncell';
	retval.id='secbutdiv_'+Sect+'_'+Cell;
/*	var data=window.parent.document.createElement('input');
	data.type='hidden';
	data.name='sec'+Sect+'_'+Cell;
	data.id='secin_'+Sect+'_'+Cell;
	retval.appendChild(data);
	var btn=window.parent.document.createElement('input');
	btn.type='button';
	btn.className='designer_section';
	btn.id='secbut_'+Sect+'_'+Cell;
	btn.value='-';
	btn.setAttribute('onclick','peacelist.SwitchCell('+Sect+','+Cell+')');
	retval.appendChild(btn);*/
	retval.innerHTML='<input type="hidden" id="secin_'+Sect+'_'+Cell+'" name="sec'+Sect+'_'+Cell+'"/>'+
		'<input type="button" class="designer_section" id="secbut_'+Sect+'_'+Cell+'" value="-" onclick="javascript:window.frames.peacelist.SwitchCell('+Sect+','+Cell+')"/>';
	return retval;
}

function ShowCells(){
	var slots={},need=document.getElementById('clean_cell_link') ? 1 : 0,i=0;
	while(need && i<6){
		i++;
		slots['s'+i]=window.parent.document.getElementById('slot'+i);
		if(!slots['s'+i] || slots['s'+i].innerHTML!='') need=0;
	}
	if(need){
		for(var i=1;i<7;i++){
			var cnt=ItemDescrs['p'+window.parent.FilledCells.sc0[0].nm]['s'+i];
			if(!cnt){
				slots['s'+i].innerHTML='('+EmptySlot+')';
			}else if(cnt>4){
				var tbl=window.parent.document.createElement('table');
				tbl.width='100%';
				tbl.border=0;
				tbl.cellpadding=0;
				tbl.cellspacing=0;
				var r,odd=(cnt%2)>0 ? 1 : 0;
				for(var cell_id=0;cell_id<cnt;cell_id++){
					if(!cell_id || !((cell_id+odd)%2)) r=tbl.insertRow(-1);
					var c=r.insertCell(-1);
					if(!cell_id && odd>0) c.colSpan=2;
					c.width='50%';
					c.appendChild(CreateCellButton(i,cell_id+1));
				}
				slots['s'+i].appendChild(tbl);
			}else for(var cell_id=0;cell_id<cnt;cell_id++) slots['s'+i].appendChild(CreateCellButton(i,cell_id+1));
		}
		InitialFill();
		SwitchCell(1,1);
		CalculateShip();
	}
}

var CellSwitched=0;
function SwitchCell(Section,Cell){
	if(!CellSwitched){
		CellSwitched=1;
		if(ActiveCell && window.parent.document.getElementById('secbut_'+ActiveSection+'_'+ActiveCell)){
			window.parent.document.getElementById('secbut_'+ActiveSection+'_'+ActiveCell).style.color='white';
			window.parent.document.getElementById('secbut_'+ActiveSection+'_'+ActiveCell).style.borderColor='#9D9D9D';
			window.parent.document.getElementById('secbut_'+ActiveSection+'_'+ActiveCell).style.fontWeight='Normal';
			window.parent.document.getElementById('secbut_'+ActiveSection+'_'+ActiveCell).style.backgroundColor='Black';
		}
	
		if(!window.parent.FilledCells['sc'+Section]) Cell=1
		while(Cell > 1 && !window.parent.FilledCells['sc'+Section][Cell-2]) Cell--;
		if(window.parent.document.getElementById('secbut_'+Section+'_'+Cell)){
			window.parent.document.getElementById('secbut_'+Section+'_'+Cell).style.color=HLColor;
			window.parent.document.getElementById('secbut_'+Section+'_'+Cell).style.borderColor=HLColor;
			window.parent.document.getElementById('secbut_'+Section+'_'+Cell).style.fontWeight='Bold';
			window.parent.document.getElementById('secbut_'+Section+'_'+Cell).style.backgroundColor=HLBackColor;
			ActiveCell=Cell;
			ActiveSection=Section;
			if(window.parent.FilledCells['sc'+Section] && window.parent.FilledCells['sc'+Section][Cell-1]){
				ShowItemInTree(window.parent.FilledCells['sc'+Section][Cell-1].nm);
				SwitchCol(window.parent.FilledCells['sc'+Section][Cell-1].lvl);
				document.getElementById('clean_cell_link').style.display='block';
			}else{
				SwitchUnit(0);
				document.getElementById('clean_cell_link').style.display='none';
			}
			if(PrevActiveA){
				PrevActiveA.style.color=HLColor;
				PrevActiveD.style.backgroundColor=HLBackColor;
			}
		}
		re = /p(\d+_\d+)$/;
		for(var i in ItemDescrs) if(ItemDescrs[i].type!=1){
			var itm = document.getElementById('piece_'+re.exec(i)[1]);
			if(itm){
				if(ItemDescrs[i]['s'+ActiveSection]){
					itm.style.color='white';
					itm.style.textDecoration='none';
				}else{
					itm.style.color='Gray';
					itm.style.textDecoration='line-through';
				}
			}
		}
		CellSwitched=0;
	}
}

function EmptyCell(){
	document.getElementById('clean_cell_link').style.display='none';
	if(ActiveSection>0 && window.parent.FilledCells['sc'+ActiveSection].length){
		window.parent.document.getElementById('secbut_'+ActiveSection+'_'+window.parent.FilledCells['sc'+ActiveSection].length).value='-'
		window.parent.document.getElementById('secin_'+ActiveSection+'_'+window.parent.FilledCells['sc'+ActiveSection].length).value='0'
		window.parent.FilledCells['sc'+ActiveSection].splice(ActiveCell-1,1)
		InitialFill();
		SwitchCell(ActiveSection,ActiveCell);
		CalculateShip();
	}
}

var ItemShowed=0;
function ShowItemInTree(ItemID){
	if(!ItemShowed){
		ItemShowed=1;
		SwitchUnit(ItemID);
		if(document.getElementById('piecediv_'+ItemID).parentNode.style.display!='block'){
			var idS=document.getElementById('piecediv_'+ItemID).parentNode.getAttribute('id');
			re=/news_body_row_(.+)/;
			var row_id=re.exec(idS)[1];
			ExpandNewsItem(row_id);
			re=/(.+)_(.+)/;
			var row_id=re.exec(row_id)[1];
			ExpandNewsItem(row_id);
		}
		s=/_(\d+)$/.exec(ItemID)[1]==window.parent.BuilderRace.id?'-1':'-2';
		if(document.getElementById('news_body_row_'+s).style.display!='block') ExpandNewsItem(s);
		ItemShowed=0;
	}
}

var ExpCalcTags=new Array('cost_main', 'cost_second', 'cost_money');
var DirectCalcTags=new Array('weight', 'max_weight', 'build_speed', 'hit_points', 'cost_pepl',
	'support_main', 'support_second', 'transport_capacity', 'carrier_capacity', 'fuel',
	'motivator', 'scan_strength', 'detect_range', 'stealth_lvl', 'bomb_dr', 'laser_dr',
	'laser_number', 'laser_damage', 'laser_ar', 'bomb_number', 'bomb_damage', 'bomb_ar');// order is important in last string!!!
var MultypleTags={
   laser_damage:'laser_number',
   bomb_damage:'bomb_number',
   laser_ar:'laser_damage',
   bomb_ar:'bomb_damage',
	bomb_dr:'self',
	laser_dr:'self',
	motivator:'self',
	fuel:'self',
	scan_strength:'self',
	detect_range:'self',
	stealth_lvl:'self'};
var BonusEffects={
   hit_points:'bonus_hp',
   laser_dr:'bonus_ldr',
   bomb_dr:'bonus_rdr',
   laser_damage:'bonus_ldmg',
   laser_ar:'bonus_lar',
   bomb_damage:'bonus_rdmg',
   bomb_ar:'bonus_rar',
   motivator:'bonus_mot',
   fuel:'bonus_fuel',
   stealth_lvl:'bonus_stl',
   scan_strength:'bonus_scan',
   detect_range:'bonus_det',
   support_main:'bonus_supp',
   support_second:'bonus_supp'};
var AbsBonusEffects={
   support_main:'bonus_abs_main_supp',
   support_second:'bonus_abs_second_supp'};
var ValRounder={
	motivator:1000,
	fuel:100
}

var Validate=new Array('weight','hit_points','fuel','motivator');

function CalculateShipData(Items,BldrRace,CalcImportPrices,CalcImportNeeds){
	var unit={support_main:0,support_second:0,weight:0,max_weight:0,req_tehn_level:1, bomb_number:0, laser_number: 0, carrier_capacity: 0, transport_capacity: 0, cost_pepl: 0};

	var FinalBonus={},FinalAbsBonus={};
	var Foreigns={},SpecAbils={},ReqBs={};
	var CarrWeight=0;

	for (var i=0;i<Items.length;i++){
		var itm=Items[i],l=itm.lvl,rl=itm.req_tehn_level,exp_grow=itm.exp_pricegrow;

		for(var i0=0;i0<ExpCalcTags.length;i0++) if(itm[ExpCalcTags[i0]]){
			var tag=ExpCalcTags[i0];
			if(itm.race==BldrRace || CalcImportPrices){
				itm[tag]=ParamOnLVL(itm[tag],rl,l,(exp_grow>0) ? exp_grow : RowGrowers[tag],exp_grow>0);
				unit[tag]=unit[tag] ? unit[tag]+itm[tag] : itm[tag];
			}else itm[tag]=0;
		}
		
		if(itm.race!=BldrRace){
//			push (@{$Retval{'foreign_parts'}},{'part'=>$itm->{'id'},'creator_race'=>$itm->{'creator_race'},'lvl'=>$l});
			if(!Foreigns[itm.name]) Foreigns[itm.name]={};
			Foreigns[itm.name][itm.race] ? Foreigns[itm.name][itm.race]++ : Foreigns[itm.name][itm.race]=1;
			if(CalcImportPrices) unit.cost_pepl+=itm.cost_pepl;
			itm.cost_pepl=0;
			itm.build_speed=itm.build_speed*RowGrowers.mount_imp_speed/100;
		}
			
		for(var i0=0;i0<DirectCalcTags.length;i0++) if(itm[DirectCalcTags[i0]]){
			var tag=DirectCalcTags[i0];
			itm[tag]=ParamOnLVL(itm[tag],rl,l,RowGrowers[tag]);
			if(MultypleTags[tag]=='self') itm[tag]*=itm[tag];
			else if(MultypleTags[tag]) itm[tag]*=itm[MultypleTags[tag]];
			unit[tag]=unit[tag] ? unit[tag]+itm[tag] : itm[tag];
		}
		if(itm.type!=2) CarrWeight+=itm.weight;
		
		var BonusUsed={};
		for(var bonus_targets in BonusEffects){
			var bn=BonusEffects[bonus_targets];
			if(itm[bn] && !BonusUsed[bn]){
				var lvlup=itm[bn+'_lvl'] ? itm[bn+'_lvl']*l : 0;
				FinalBonus[bn]=(FinalBonus[bn] ? FinalBonus[bn] : 1)*(100+itm[bn]+lvlup)/100;
				BonusUsed[bn]=1;
			}
		}
		BonusUsed={};
		for(var bonus_targets in AbsBonusEffects){
			var bn=AbsBonusEffects[bonus_targets];
			if(itm[bn] && !BonusUsed[bn]){
				var lvlup=itm[bn+'_lvl'] ? itm[bn+'_lvl']*l : 0;
				FinalAbsBonus[bn]=FinalAbsBonus[bn] ? FinalAbsBonus[bn]+itm[bn] : itm[bn];
				BonusUsed[bn]=1;
			}
		}

		if(itm.race==BldrRace || CalcImportNeeds){
			if(unit.req_tehn_level<rl+l) unit.req_tehn_level=rl+l;
			if(itm.req_building && itm.req_building!='') ReqBs[itm.req_building]=1;
		}
		if(itm.spec_ability && itm.spec_ability!='') SpecAbils[itm.spec_ability]=1;
	}

	unit.laser_ar=unit.laser_damage ? unit.laser_ar/unit.laser_damage : 0;
	unit.laser_damage=unit.laser_number ? unit.laser_damage/unit.laser_number : 0;
	unit.bomb_ar=unit.bomb_damage ? unit.bomb_ar/unit.bomb_damage : 0;
	unit.bomb_damage=unit.bomb_number ? unit.bomb_damage/unit.bomb_number : 0;

	unit.laser_dr=unit.laser_dr?Math.sqrt(unit.laser_dr):0;
	unit.bomb_dr=unit.bomb_dr?Math.sqrt(unit.bomb_dr):0;
	unit.scan_strength=unit.scan_strength?Math.sqrt(unit.scan_strength):0;
	unit.detect_range=unit.detect_range?Math.sqrt(unit.detect_range):0;

	unit.motivator=Math.pow(unit.motivator,RowGrowers.motivator_power)/Math.pow(CarrWeight,RowGrowers.motivator_weight);
	unit.fuel=Math.pow(unit.fuel,RowGrowers.fuel_power)/Math.pow(CarrWeight,RowGrowers.fuel_weight);
	unit.stealth_lvl=Math.pow(unit.stealth_lvl,RowGrowers.stealth_power)/Math.pow(unit.weight,RowGrowers.stealth_weight);

	for(var bt in BonusEffects) if(FinalBonus[BonusEffects[bt]] && unit[bt]>0) unit[bt]*=FinalBonus[BonusEffects[bt]];
	for(var bt in AbsBonusEffects) if(FinalAbsBonus[AbsBonusEffects[bt]] && unit[bt]>0){
		var newval=unit[bt]*100/(100+parent.RaceBonuses.bonus_price)+FinalAbsBonus[AbsBonusEffects[bt]];
		unit[bt]=(newval>0) ? newval*(100+parent.RaceBonuses.bonus_price)/100 : 0;
	}
	unit.imp_parts=Foreigns;
	unit.spec_ab=SpecAbils;
	unit.req_blds=ReqBs;
	
	return unit;
}

function CalculateShip(){
   var AllTDs=window.parent.unitsummary.document.getElementsByTagName('TD');
	for(var i=0;i<AllTDs.length;i++) if(AllTDs[i].id) AllTDs[i].innerHTML='-';

	var CalcImportPrices=window.parent.unitsummary.document.getElementById('calc_import') && window.parent.unitsummary.document.getElementById('calc_import').checked;
	var CalcImportNeeds=window.parent.unitsummary.document.getElementById('calc_import_needs') && window.parent.unitsummary.document.getElementById('calc_import_needs').checked;
	
	var AllItems=new Array();
	var newitempos;
	for(var i=0;i<=6;i++) if(window.parent.FilledCells['sc'+i]){
		for(var i1=1;i1<=window.parent.FilledCells['sc'+i].length;i1++){
			newitempos=AllItems.length,srcitem=ItemDescrs['p'+window.parent.FilledCells['sc'+i][i1-1].nm];
			AllItems[newitempos]={};
			for(var ip in srcitem) AllItems[newitempos][ip]=srcitem[ip];
			AllItems[newitempos].lvl=window.parent.FilledCells['sc'+i][i1-1].lvl;
		}
	}
	
	var unit=CalculateShipData(AllItems,window.parent.BuilderRace.id,CalcImportPrices,CalcImportNeeds);

	var Foreigns=unit.imp_parts,SpecAbils=unit.spec_ab,ReqBs=unit.req_blds;
	
	var ctrl=window.parent.unitsummary.document.getElementById('req_building');
	if(ctrl){
		var str='',delimiter='';
		for(var r in ReqBs){
			str+=delimiter+r;
			delimiter=StringValuesSeparator;
		}
		ctrl.innerHTML=str || '-';
	}
	var ctrl=window.parent.unitsummary.document.getElementById('spec_ability');
	if(ctrl){
		var str='',delimiter='';
		for(var sp in SpecAbils){
			str+=delimiter+sp;
			delimiter=StringValuesSeparator;
		}
		ctrl.innerHTML=str || '-';
	}
	ctrl=window.parent.unitsummary.document.getElementById('imported_details');
	if(ctrl){
		var str='',delimiter='';
		for(var p in Foreigns) for(var r in Foreigns[p]){
			str+=delimiter+p;
			delimiter=StringValuesSeparator;
			if(Foreigns[p][r]>1) str+=' (x'+Foreigns[p][r]+')';
		}
		ctrl.innerHTML=str || '-';
	}

	for(var i in unit){
		var ctrl=window.parent.unitsummary.document.getElementById(i);
		if(ctrl){
			var rval=ValRounder[i]>0 ? ValRounder[i] : 10;
			ctrl.innerHTML=unit[i]?(Math.floor(unit[i]*rval)/rval).toLocaleString():'-';
			if (!unit[i]) {
				// hide row
				ctrl.parentNode.style.display = 'none';
			}
			else {
				ctrl.parentNode.style.display = '';
			}
		}
	}

	for(var i0=0;i0<Validate.length;i0++){
		ctrl=window.parent.unitsummary.document.getElementById(Validate[i0]);
		if(ctrl){
			var IsValid=1;
			if(Validate[i0]=='weight'){
				var RealWeight=Math.round(unit.weight),RealMaxWeight=Math.round(unit.max_weight);
				IsValid=RealWeight<=RealMaxWeight;
				ctrl.innerHTML=RealWeight.toLocaleString()+'/'+RealMaxWeight.toLocaleString();
			}else if(Validate[i0]=='hit_points') IsValid=unit.hit_points>=1;
			else IsValid=unit[Validate[i0]]>0;
			ctrl.style.color=IsValid ? 'white' : 'Red';
			ctrl.style.fontWeight=IsValid ? 'Normal' : 'Bold';
		}
	}
}

function DoChooseCarapace(CarapaceID, RaceID){
	var ProjectName=prompt(StrNewDesignName,'Unit'),retval=false;
	if(ProjectName){
		document.getElementById('name_input_'+CarapaceID+'_'+RaceID).value=ProjectName;
		retval=true;
	}
	return retval;
}

window.onload = initImageTitle;