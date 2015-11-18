var Version=1.38;

PlanetBLinks=4;
BlinkDelay=250;
BlinkColors=['gray', '#BB9600'];

function WorldHost(PlayerId){ return PlayerId>11 && PlayerId<500000 ? 'http://old.the-game.ru' : ''; }

var TextConstants;
function GetLangMSG(ID){
    return TextConstants ? TextConstants['m'+ID] : 'unloaded';
}

function HelpWndWithReturn(WndPath){
    return window.open(WndPath, '', 'scrollbars=1,resizable=1,toolbar,width=780,height=600');
}

function HelpWnd(WndPath){
    HelpWndWithReturn(WndPath);
}
function SmlWnd(WndPath){
    window.open(WndPath, '', 'scrollbars=1,resizable=1,toolbar,width=480,height=400');
}
function BigWnd(WndPath){
    window.open(WndPath, '', 'scrollbars=1,resizable=1,toolbar,width=1020,height=760');
}

function ShowGeneralError(){
    var errctrl=document.getElementById('error_placement');
    if(errctrl){
        var newctrl=document.createElement('div');
        newctrl.innerHTML=errctrl.innerHTML
        document.body.insertBefore(newctrl,document.body.firstChild);
    }
}

function MyFleetMarks(){
    if (!window.parent.flets_frame || !window.parent.flets_frame.FleetsTree
        || !window.parent.foreighn_fleets_frame || !window.parent.foreighn_fleets_frame.ForeighnFleets){
        setTimeout ("MyFleetMarks()", 100);
        return;
    }
    for (var i=0;i<AllMyPlanets.length;i++){
        document.getElementById('flmarks_'+AllMyPlanets[i].x+'_'+AllMyPlanets[i].y).innerHTML=DrawFleetsBtn(AllMyPlanets[i].x,AllMyPlanets[i].y);
    }
}
function MarkCurPlanet(){
    var XY=window.parent.XY;
    if (XY){
        XY=XY.replace(':','_');
        var Cell=document.getElementById('planetcell_'+XY);
        if (Cell){
            Cell.className='activeplanet';
        }
    }
}
function SetInProgress(){
    if (!window.parent.build_in_pr_frame || !window.parent.build_in_pr_frame.BuildingsInProgress){
        setTimeout ("SetInProgress()", 100);
        return;
    }
    var BuildingList=window.parent.build_in_pr_frame.BuildingsInProgress;

    for (var i=0;i<AllMyPlanets.length;i++){
        var PD=BuildingList['p'+AllMyPlanets[i].x+'_'+AllMyPlanets[i].y];
        if (PD){
            var BD=PD.n+', '+PD.dl;
            if (PD.c > 1){
                BD+=' (+'+(PD.c-1)+') ';
            }
            document.getElementById('b_i_p_'+AllMyPlanets[i].x+'_'+AllMyPlanets[i].y).innerHTML = BD;
        } else {
            document.getElementById('b_i_p_'+AllMyPlanets[i].x+'_'+AllMyPlanets[i].y).innerHTML = '('+window.parent.GetLangMSG(96)+')';
        }
    }
}

function SelectPlanet(new_xy, On){
    var d			= document;
    var outline		= d.getElementById('outline_emul');
    var pl_cell		= d.getElementById('navigator_cell_'+new_xy.replace(':','_'));
    var pl_td		= pl_cell.parentNode;
    var skymap_tbl	= d.getElementById('skymap_table');

    if(window.parent.XY!=new_xy || !outline.style.display || outline.style.display=='none'){
        var link = '/'+On+'/?planetid='+new_xy+'&p='+window.parent.PlayerId+'_'+window.parent.Paid;
        outline.getElementsByTagName('a')[0].href = link;

        outline.style.left		= (pl_td.offsetLeft + skymap_tbl.offsetLeft) + 'px';
        outline.style.top		= (pl_td.offsetTop + skymap_tbl.offsetTop) + 'px';
        outline.title			= pl_td.title;
        outline.onmouseover		= pl_cell.onmouseover;
        outline.onmouseout		= pl_cell.onmouseout;
        if(BrowserDetect.browser == 'Explorer'){
            outline.style.width		= '40px';
            outline.style.height	= '40px';
        } else {
            outline.style.width		= '38px';
            outline.style.height	= '38px';
        }
        outline.style.display	= 'block';

        var xy = new_xy.split(':');
        window.parent.SetPlanetTabTo(xy[0], xy[1]);
        window.parent.XY = new_xy;
    }
}

function SetPlanetTabTo(X, Y){
    var td = document.getElementById('tab_btn_planet');
    if(!td)
        return;
    var link = '/planet/?planetid='+X+':'+Y+'&p='+PlayerId+'_'+Paid;
    td.onclick = new Function("document.location='"+link+"'");
    td.getElementsByTagName('a')[0].href = link;
}

function ExpandNewsItem(ItemID,On,copy){
    var copyID = copy ? '_c'+copy : '';
    HImage=document.getElementById('msg_expander_'+ItemID+copyID);
    HRow=document.getElementById('news_body_row_'+ItemID+copyID);
    if (!HRow){
        return;
    }
    if (HRow.style.display == "block"){
        HRow.style.display = 'none';
        if (!HImage){
            return;
        }
        HImage.src=HImage.src.replace('collapse', 'expand');
    } else {
        HRow.style.display = 'block';
        if (!HImage){
            return;
        }
        HImage.src=HImage.src.replace('expand', 'collapse');
    }

//    if (window.jQuery) $(HRow).closest('.scroll-pane').jScrollPane();
}

function collapseNewsItem(ItemID, On, copy) {
    var copyID = copy ? '_c'+copy : '';
	var HImage = document.getElementById('msg_expander_'+ItemID + copyID);
    var HRow = document.getElementById('news_body_row_'+ItemID + copyID);
    if (!HRow){
        return;
    }
    if (HRow.style.display == "block"){
        HRow.style.display = 'none';
        if (!HImage){
            return;
        }
        HImage.src=HImage.src.replace('collapse', 'expand');
    }
}

function ExpandFleetItem(ItemID,X,Y){
    HImage=document.getElementById('msg_expander_'+ItemID);
    HRow=document.getElementById('news_body_row_'+ItemID);
    if (!HRow){
        return;
    }
    if (HRow.style.display == "block"){
        HRow.style.display = 'none';
        if (!HImage){
            return;
        }
        HImage.src=StaticSiteName+"/img/expand.gif";
    } else {
        HRow.style.display = 'block';
        if (!HImage){
            return;
        }
        HImage.src=StaticSiteName+"/img/collapse.gif";
        BlinkItem(X,Y)
    }

 //   if (window.jQuery) $(HRow).closest('.scroll-pane').jScrollPane();
}

var BlinkingCell;
var BlinkCount=0;
var BlinkEnabled=true;
function BlinkItem(X,Y){
    if(!BlinkEnabled) return;
    var sky=window.parent.skymap_frame;
    if(sky!=window){
        if(sky && sky.BlinkItem) sky.BlinkItem(X,Y);
        return;
    }
    DarkCell();
    BlinkingCell = document.getElementById('navigator_cell_'+X+'_'+Y);
    if (BlinkCount < 1){
        BlinkCount = PlanetBLinks;
        DoBlink()
    } else {
        BlinkCount = PlanetBLinks;
    }
}
function DoBlink(){
    if (Math.floor(BlinkCount/2)*2 == BlinkCount){
        LightCell()
    } else {
        DarkCell()
    }
    BlinkCount--;
    if (BlinkCount > 0){
        setTimeout ("DoBlink()", BlinkDelay);
    } else {
        DarkCell()
    }
}
function LightCell(){
    if (BlinkingCell){
        BlinkingCell.style.backgroundColor=BlinkColors[Math.floor(BlinkCount/2) % BlinkColors.length];
    }
}
function DarkCell(){
    if (BlinkingCell){
        var cell_color=BlinkingCell.getAttribute('cell_color');
        BlinkingCell.style.backgroundColor=cell_color ? cell_color : 'transparent';
    }
}
function BlockBlink(disable){
    var w = window;
    if(window.parent.skymap_frame)
        w = window.parent.skymap_frame;
    w.BlinkEnabled = !disable;
    w.DarkCell();
    w.BlinkingCell = null;
}

var TurnTime,HTimer;

function InsertTimer(SecRemain){
    today = new Date();
    today.setTime(today.getTime() + SecRemain*1000);
    TurnTime = today.getTime();
    setTimeout ("MoveTime()", 1);
}

function UpComm(MesCount,DipMesCount){
    if(MesCount){
        var commblink=document.getElementById('commblink');
        if(commblink) commblink.innerHTML=' ('+MesCount+')';
    }
    if(DipMesCount){
        var commblink=document.getElementById('dipblink');
        if(commblink) commblink.innerHTML=' ('+DipMesCount+')';
    }
}

function MoveTime(){
    NowTime = new Date();
    NowTime.setTime(TurnTime-NowTime.getTime());
    HTimer = document.getElementById('timer_text');
    Hours=NowTime.getUTCHours();
    if (Hours < 10){
        Hours='0'+Hours
    }
    Minutes=NowTime.getMinutes();
    if (Minutes < 10){
        Minutes='0'+Minutes
    }
    Seconds=NowTime.getSeconds();
    if (Seconds < 10){
        Seconds='0'+Seconds
    }
    if (NowTime.getSeconds()==0 && NowTime.getMinutes==0 && NowTime.getUTCHours()==0 ||
        NowTime.getUTCHours() > 12){
        TurnTime=TurnTime + 8*60*60*1000
        HTimer.innerHTML='..!TURN!..';
//		setTimeout ("MoveTime()", 5000);
    } else {
        HTimer.innerHTML=Hours+':'+Minutes+':'+Seconds;
        setTimeout ("MoveTime()", 1000);
    }
}

function PackShowHide(){
    if (document.getElementById('item_to_pack').value == 'main' || document.getElementById('item_to_pack').value == 'second' || document.getElementById('item_to_pack').value == 'money'){
        document.getElementById('resource_count_input').style.display='block';
    } else {
        document.getElementById('resource_count_input').style.display='none';
    }
}

function EnaBu(SelectedPartID){
    document.getElementById('ppkb').disabled='';
    document.getElementById('ppkb').style.color='White';
    document.getElementById('lvl_cell').innerHTML=MakeNewLvlBox(SelectedPartID);
}

function MakeNewLvlBox(SelectedPartID){
    var prevVal=document.getElementById('parts_lvl').selectedIndex,
        maxL=PartToLVL['l' + SelectedPartID],
        BoxHT='<select name="parts_lvl" id="parts_lvl" class="halfsized"><option value="'+maxL+'">MAX</option>';
    for(var i=0;i<=maxL;i++) BoxHT+='<option value="'+i+'"'+(prevVal-1==i ? ' selected="selected"' : '')+'>'+i+'</option>';
    BoxHT+='</select>';
    return BoxHT;
}

//function ChangeDesignAccessibility(on){
//    var ie=BrowserDetect.browser=='Explorer',
//        trs=window.document.getElementsByName('design_inaccessible'),i=0,n=trs.length;
//    if(!n && ie){
//        var all=window.document.getElementsByTagName('tr'),i=0;
//        if(all.length>0) do{
//            var name=all[i].getAttribute("name");
//            if(name=='design_inaccessible') trs[n++]=all[i];
//        }while(++i<all.length);
//    }
//    if(!on) while(n--) trs[n].style.display='none';
//    else if(ie) while(n--) trs[n].style.display='block';
//    else while(n--) trs[n].removeAttribute('style');
//}
function ChangeDesignAccessibility(on){
    var ie=BrowserDetect.browser=='Explorer',
        trs=window.document.getElementsByName('design_inaccessible'),i=0,n=trs.length;
    if(!n && ie){
//       var all=window.document.getElementsByTagName('tr'),i=0;
         var i=0;
         var all;
		if (window.jQuery) all=$('.gp-blackbg-row')
		else all=window.document.getElementsByTagName('tr');
        if(all.length>0) do{
            var name=all[i].getAttribute("name");
            if(name=='design_inaccessible') trs[n++]=all[i];
        }while(++i<all.length);
    }
    if(!on) while(n--) trs[n].style.display='none';
    else if(ie) while(n--) trs[n].style.display='block';
    else while(n--) trs[n].removeAttribute('style');
//    if (window.jQuery) $(trs[0]).closest('.scroll-pane').jScrollPane({
//        addToWidth: 37
//    });
}

function PrintResources(ResData){
if (document.getElementsByClassName("pageData-body").length) // ����� �������� �� ����� ������
	{
    return '<h3 class="ih-turnends resfloat" id="turnends">' +
        TurnTimeStr1+' '+ResData.tr+' '+TurnTimeStr2+'&nbsp;' +
        '<span id="timer_text">&#160;</span>' +
        '</h3>'+
        '<table border="0" cellpadding="0" cellspacing="0" id="resfloat">' +
        '<tr>' +
        OutOneRes('m')+OutOneRes('s')+OutOneRes('c')+'' +
        '</tr>' +
        '</table>';
	}
else
	{
return '<table border="0" cellpadding="0" cellspacing="0" id="resfloat"><tr><td class="resfloat" id="turnends">'+
		TurnTimeStr1+' '+ResData.tr+' '+TurnTimeStr2+'&nbsp;<span id="timer_text">&#160;</span></td>'+
		OutOneRes('m')+OutOneRes('s')+OutOneRes('c')+'</tr></table>';

	}

}


function OutOneRes(R){
    return '<td width="0"><img src="'+StaticSiteName+
        '/img/z.gif" width="10" height="1" border="0" alt=""/></td><td class="resfloat"><img src="'+StaticSiteName+'/img/'+ResData[R+'n']+'_ico.gif" alt="'+TitleStr[R]+
        '" width="18" height="18" border="0" title="'+TitleStr[R]+'"/></td><td class="resfloat" title="'+DescrQuantStr+' ('+TitleStr[R]+')">'+ResData[R+'0']+
        '</td><td class="resfloat" title="'+DescrIncomeStr+' ('+TitleStr[R]+')"><nobr><small>+'+ResData[R+'1']+'</small></nobr></td><td class="resfloat" title="'+
        DescrExpenseStr+' ('+TitleStr[R]+')"><nobr><small>-'+ResData[R+'2']+'</small></nobr></td>';
}

function ChangePlayerMarker(Trgt,NewMark,On,OldMark){
    if (OldMark != NewMark)
        document.location='/frames/relation_list/on/1/?action=change_player_marker&relation_trgt='+Trgt+'&new_mark='+NewMark
}

function hpi(id){
    var e = document.getElementById('pl'+id);
    if(e) e.style.display='block';
}
function hpo(id){
    var e = document.getElementById('pl'+id);
    if(e) e.style.display='none';
}


var MessagesLoaded={};
function JSLoadMsg(ItemID, On, copy){
    var Postfix = '?'+(On ? 'on='+On : '') + (copy ? '&amp;copy='+copy : '');
    var copyID = copy ? '_c'+copy : '';

    var expander = document.getElementById('msg_expander_'+ItemID+copyID);
    var row = document.getElementById('news_body_row_'+ItemID+copyID);


    InsertIFrameLoader(
        MessagesLoaded,
        expander,
        row,
        row,
        'msg',
        ItemID,
        Postfix,
        copy
    );

//    if (window.jQuery) $(row).closest('.scroll-pane').jScrollPane();
}

function InsertIFrameLoader(Loaded,Image,Div,IfDiv,Name,ItemID,Postfix,copy){
    if (!Div){
        return;
    }
    if (Div.style.display == "block"){
        Div.style.display = 'none';
        Image.src=StaticSiteName+"/img/expand.gif";
    } else {
        Div.style.display = 'block';
        Image.src=StaticSiteName+"/img/collapse.gif";
        var copyID = copy ? '_c'+copy : '';
        if (Loaded['m'+ItemID+copyID]){
            return;
        }
        Loaded['m'+ItemID+copyID]=1;
        IfDiv.innerHTML='<div class="loading">'+msgLoading+'...<iframe src="/blackframes/load_'+Name+'/on/'+ItemID+'/'+Postfix+'" name="iframe_'+Name+'_'+ItemID+copyID+'" id="iframe_'+Name+'_'+ItemID+copyID+'" width="0" height="1" marginheight="0" marginwidth="0" scrolling="Auto" vspace="0" hspace="0" frameborder="0"></iframe></div>';
    }
}

function JSLoadEnd(ItemID,Name,DivName,copy){
    var copyID = copy ? '_c'+copy : '';
    setTimeout ('_JSLoadEnd('+ItemID+',\''+Name+'\',\''+DivName+'\',\''+copyID+'\')', 1);
    return true;
}

function _JSLoadEnd(ItemID,Name,DivName,copyID){

	var dest = document.getElementById(DivName+ItemID+copyID);
	var src = window['iframe_'+Name+'_'+ItemID+copyID].document.body;
	if (Name == 'allien_fleet') {
		ImproveAlienFleet(src, ItemID);
	}

    dest.innerHTML = src.innerHTML;
}

var unitCorpsRe = /(\d+)_\d\.gif$/;
var unitWeightRe = /(\d+)/;
function compareDomAlienFleetUnits(a, b){
	var a_class = parseInt(unitCorpsRe.exec($('td[class="building_img"] img', a).attr('src'))[1]);
	var a_weight = alientFleetUnitWeight(a);
	var a_name = $('td[class="building_name"]', a)[0].childNodes[0].nodeValue.trim();
	
	var b_class = parseInt(unitCorpsRe.exec($('td[class="building_img"] img', b).attr('src'))[1]);
	var b_weight = alientFleetUnitWeight(b);
	var b_name = $('td[class="building_name"]', b)[0].childNodes[0].nodeValue.trim();

	if (a_class > b_class){
		return -1;
	}
	if (a_class < b_class){
		return 1;
	}
	
	if (a_weight > b_weight){
		return -1;
	}
	if (a_weight < b_weight){
		return 1;
	}
	
	if (a_name > b_name) {
		return 1;
	}
	if (a_name < b_name) {
		return -1;
	}
	
	return 0;
}
function alientFleetUnitWeight(dom) {
	var weight = parseInt(unitWeightRe.exec($('td[class="building_name"] small', dom).text())[1]);
	return weight;
}
var unitFullCorpsRe = /\/(\d+(_\d)?)\.gif$/;
function alienFleetUnitHash(dom) {
	var fullClass = unitFullCorpsRe.exec($('td[class="building_img"] img', dom).attr('src'))[1];
	var name = $('td[class="building_name"]', dom)[0].childNodes[0].nodeValue.trim();
	var weight = alientFleetUnitWeight(dom);
	
	return fullClass + '##' + name + '##' + weight;
}
var fleetWeightRe = /\d+\D+(\d+)\)/;
function extractAlienFleetWeight(dom) {
	var fleetNumbers = $('span[class^="allien_fleet_"]', dom).text();
	return parseInt(fleetWeightRe.exec(fleetNumbers)[1]);
}
function ImproveAlienFleet(container, FleetId) {
	//	group similar units
	
	try {
		// get fleet weight
		var fleetRootNode = $('#aft_' + FleetId)[0];
		if (!fleetRootNode) {
			// most likely it's shared fleet in flight.
			var someShitInsideFleet = $('#msg_expander_' + FleetId)
			fleetRootNode = someShitInsideFleet[0].parentNode.parentNode.parentNode.parentNode.parentNode;	// don't. even. ask.
		}
		var fleetWeight = extractAlienFleetWeight(fleetRootNode);
		var flyingUnitsWeight = 0;
		
		//	sort by class and weight in descending order
		var sortedUnitsDom = $('table tr', container).sort(compareDomAlienFleetUnits);
		if (sortedUnitsDom.length > 0) {
			sortedUnitsDom.detach();
			// only unique units will stay, adding count to each
			var countPerDom = {};
			for (var i = sortedUnitsDom.length - 1; i > 0; i--) {
				var aDom = sortedUnitsDom[i];
				var bDom = sortedUnitsDom[i - 1];
				
				flyingUnitsWeight += alientFleetUnitWeight(aDom);
				
				var aHash = alienFleetUnitHash(aDom);
				var bHash = alienFleetUnitHash(bDom);
				
				if (aHash == bHash) {
					if (typeof countPerDom[aHash] == 'undefined') 
						countPerDom[aHash] = 1;
					countPerDom[aHash] += 1;
					sortedUnitsDom.splice(i - 1, 1);
				}
			}
			
			flyingUnitsWeight += alientFleetUnitWeight(sortedUnitsDom[0]);
			
			for (var i = 0; i < sortedUnitsDom.length; i++) {
				var unitDom = sortedUnitsDom[i];
				var count = countPerDom[alienFleetUnitHash(unitDom)];
				if (count) {
					$(unitDom).append($("<td style='white-space:nowrap;'>&nbsp;<small>x</small> <b>" + count + "</b></td>"));
				}
			}
			
			sortedUnitsDom.appendTo($('table', container));
			
			if (flyingUnitsWeight < fleetWeight) {
				$('table', container).append($('<tr><td class="building_img"></td>'+
												'<td class="building_name">Груз: ' + (fleetWeight - flyingUnitsWeight) + ' тонн(ы)</td></tr>'));
			}
		}
	}
	catch(oops) {
		if (console && console.log) {
			console.log("improvement failed for fleet " + FleetId);
			console.log(oops);
		}
	}

}

var AllienFleetsLoaded={};
function JSLoadAllienFleet(ItemID, X, Y, Relation, PlayerId, tta, Names){
    TextContainer=document.getElementById('afd' + ItemID);

    var HTM = StrFleetBelongsTo+' <a href="javascript:HelpWnd(\''+WorldHost(PlayerId)+'/frames/playerinfo/on/'+PlayerId+'/\')" target="_top">'+Names.owner+'</a>. ';
    if (!tta){
        HTM += FReside+' <a href="/planet/?planetid='+X+':'+Y+'" target="_top" onmouseover="BlinkItem('+X+','+Y+')">'+Names.planet+'</a>';
        if(window.parent.Paid && window.parent.LiveMap){
            HTM += ' <a href="javascript:window.parent.frames[\'skymap_frame\'].ScrollMapTo('+X+','+Y+')" onmouseover="BlinkItem('+X+','+Y+')">[»»««]</a>';
        }
        HTM += '. ';
    }
    HTM += FRel+':<br><strong>'+dips['d'+Relation]+'</strong>';
    TextContainer.innerHTML = HTM;
    InsertIFrameLoader(AllienFleetsLoaded,document.getElementById('msg_expander_'+ItemID),document.getElementById('news_body_row_'+ItemID),document.getElementById('allien_fleet_'+ItemID),'allien_fleet',ItemID,'');
    BlinkItem(X,Y)
}

function JSLoadFleet(ItemID,X,Y,hXY){
    InsertIFrameLoader(MessagesLoaded,document.getElementById('msg_expander_'+ItemID),document.getElementById('news_body_row_'+ItemID),document.getElementById('flet_loadbox_'+ItemID),'my_fleet',ItemID,'?planetid='+hXY);
    BlinkItem(X,Y)
}

function OutFleetsNode(Node, parentNodeName) {
    var NewTree = [];
    for(var i in Node){
        if(i != 'da' && (Node[i].cc || Node[i].da && Node[i].da.length > 1)){
            NewTree[NewTree.length] = {t:0, n:i.substr(2), d:OutFleetsNode(Node[i], i.substr(2))};
        }
    }
    for(var i in Node){
        if(i != 'da' && Node[i].da && Node[i].da.length == 1 && Node[i].da[0].ta == 0 && Node[i].cc == 0){
			Node[i].da[0].computedParentNodeName = parentNodeName;
            NewTree[NewTree.length] = {t:2, d:Node[i].da[0]};
        }
    }
    for(var i in Node){
        if(i != 'da' && Node[i].da && Node[i].da.length == 1 && Node[i].da[0].ta != 0 && Node[i].cc == 0){
			Node[i].da[0].computedParentNodeName = parentNodeName;
            NewTree[NewTree.length] = {t:2, d:Node[i].da[0]};
        }
    }
	
    if(Node.da){
        for(var i = 0; i < Node.da.length; i++) 
			if(Node.da[i].ta == 0) {
				Node.da[i].computedParentNodeName = parentNodeName;
				NewTree[NewTree.length] = {t:2, d:Node.da[i]};
			}
        for(var i = 0; i < Node.da.length; i++) 
			if(Node.da[i].ta != 0) {
				Node.da[i].computedParentNodeName = parentNodeName;
				NewTree[NewTree.length] = {t:2, d:Node.da[i]};
			}
    }
    return NewTree;
}

var Sortable;
function SortFleets(FL, isHarrison){
    if(Sortable){
        var NFL = new Array({cc:0}, {cc:0});
        for(var i = 0; i < FL.length; i++){
			var FLdata = FL[i].d;
            var ItmPathA = FLdata.n.split(isHarrison ? ': ' : ':');
            var RootGroup = (FLdata.ta && !MixedFleets) ? 1 : 0;
            var Node = NFL[RootGroup];
            for(var j = 0; j < ItmPathA.length; j++){
                var NNam = 'si'+ItmPathA[j];
                if(!Node[NNam])
					Node[NNam] = {cc:0};
                Node.cc++;
                Node = Node[NNam];
            }
            if(!Node.da)
				Node.da = [];
            FLdata.sn = ItmPathA[ItmPathA.length - 1];
            Node.da[Node.da.length] = FLdata;
        }
		
        var NewTrees = new Array();
        for(var i = 0; i < NFL.length; i++)
			NewTrees[i] = OutFleetsNode(NFL[i], '');
		
		if (isHarrison || MixedFleets || NewTrees[0].length == 0 || NewTrees[1].length == 0)
			return NewTrees[0].concat(NewTrees[1]);
		else
			return NewTrees[0].concat({t: 15}).concat(NewTrees[1]);	// {t: 15} - marker separating fleets in flight
    }
    return FL;
}

function RequestProcessing(start, pendingCount){
    var img = document.getElementById('RequestInfo');
    if(img) {
        img.src = start ? StaticSiteName+'/img/ajax-loader.gif' : StaticSiteName+'/img/z.gif';
	}
}

function distance(X1, Y1, X2, Y2){
    var hMapSize=MapSize/2;
    var Dx=Math.abs(X1-X2);
    if(Dx>hMapSize) Dx=MapSize-Dx;
    var Dy=Math.abs(Y1-Y2)
    if(Dy>hMapSize) Dy=MapSize-Dy;
    return Math.sqrt((Dx)*(Dx) + (Dy)*(Dy));
}

// РўСѓС‚ Сѓ РЅР°СЃ С„СѓРЅРєС†РёРё РґР»СЏ РєРѕРјРјСѓРЅРёРєР°С‚РѕСЂР° РїРѕС€Р»Рё. РћРЅРё РІРѕРѕР±С‰Рµ cР°РјРё РїРѕ СЃРµР±Рµ Р¶РёРІСѓС‚.
var AlreadyLoaded;
function OnCommunicatorLoad(resize_only){
    ts=document.getElementById('top_shit');
    document.getElementById('ComunicatorTable').style.height=(document.body.clientHeight-ts.offsetHeight-(BrowserDetect.browser=='Opera'?3:0))+'px';
    document.getElementById('ChannelsTable').style.height=(document.body.clientHeight-ts.offsetHeight-(BrowserDetect.browser=='Opera'?3:0))+'px';
    document.getElementById('ChannelsList').style.height=(document.body.clientHeight-ts.offsetHeight-(BrowserDetect.browser=='Opera'?3:0))+'px';
    if(!resize_only){
        if(!AlreadyLoaded){
            document.getElementById('MailboxView').style.display='block';
            document.getElementById('ChannelsView').style.display='none';
            AlreadyLoaded=1;
        }
    }

}
var SelectedCommTreeItm;
var InLock=1;
function CommTreeClick(Item){
    if (InLock){
        return;
    }
    if (!SelectedCommTreeItm){
        SelectedCommTreeItm=document.getElementById('box1');
    }
    SelectedCommTreeItm.className='comm_unsel';
    SelectedCommTreeItm=document.getElementById('box'+Item);
    SelectedCommTreeItm.className='comm_sel';
}

function ShowCounterBar(m_tek, m_max) {
    parent.document.getElementById('checked_counter').innerHTML = (m_tek?m_tek:'-')+'/'+m_max;
}

var NumberOfCheckedMessages = 0;

function ChangeMessageState(msgid) {
    if(msgid) {
        if(document.getElementById('msg_chk'+msgid).checked) {
            NumberOfCheckedMessages++;
        } else {
            NumberOfCheckedMessages--;
        }

        if(NumberOfCheckedMessages==1) {
            parent.CommSubjClick(msgid);
        }
    }
    if (parent.Messages){
        ShowCounterBar(NumberOfCheckedMessages, parent.Messages.length);

        parent.window.msglist.document.getElementById('msg_chk_all').checked = (NumberOfCheckedMessages == parent.Messages.length);
    }
    parent.DisableButtons(NumberOfCheckedMessages==0);
}

var BoxType=1;
function BuildMessageHeaders(){
    Out=new Array();
    var TableWidth=BrowserDetect.browser=='Opera'?98:100;
    Out[Out.length]='<table width="'+TableWidth+'%" class="com_mes" cellpadding="0" cellspacing="0" border="0"><tr><td class="table_header"><a href="javascript:window.parent.SortMessagesBy(\'r\')"><img width="18" height="18" border="0" src="'+StaticSiteName+'/img/letter1.gif"></a></td>';

    Out[Out.length]=BoxType?SortHead(FromStr,'f',' width="1%"'):'';
    Out[Out.length]=(BoxType==0 || BoxType==2)?SortHead(ToStr,'o',' width="1%"'):'';
    Out[Out.length]=SortHead(SubjStr,'s',' width="97%"');
    Out[Out.length]=SortHead('!!!','@',' width="1%" align="right"');
    Out[Out.length]=SortHead(DateStr,'t',' width="1%" align="center"');
    Out[Out.length]=SortHead(TurnStr,'t',' width="1%" align="right"');

    Out[Out.length]='<td class="table_header"><input class="checkbox" type="Checkbox" name="msg_chk_all" id="msg_chk_all" onclick="window.parent.CheckAllMessages()"></td></tr>';
    for(var i=0;i<Messages.length;i++){
        TDonClick='<td onclick="parent.CommSubjClick(\''+Messages[i].i+'\')" valign="middle"';
        isRead=Messages[i].r>0 ? '' : '1';
        CnT=Messages[i].c<2?'':' ('+Messages[i].c+')';
        IsHot=Messages[i].h==0?'':Messages[i].h==1?' class="c"':' class="hot1"'
        TRStyle=i % 2?'odd':'even';
        Out[Out.length]='<tr id="com_row_'+Messages[i].i+'" class="commbox_row_'+TRStyle+'" valign="top">'+TDonClick+' width="1%">';
        if (Messages[i].f+Messages[i].o!=''){ Out[Out.length]='<a href="javascript:HelpWnd(\'/frames/msg/on/1/?to='+(Messages[i].f==''?Messages[i].o:Messages[i].f)+'\')">'; }
        if (Messages[i].l){
            Out[Out.length]='<img id="ltr_img_'+Messages[i].i+'" width="16" height="16" border="0" src="'+StaticSiteName+'/img/logo/'+Messages[i].l+'/ico_dip_'+(isRead?'4l':'self')+'.gif" alt="" align="middle" hspace="1" vspace="1">';
        }else{
            Out[Out.length]='<img id="ltr_img_'+Messages[i].i+'" width="18" height="18" border="0" src="'+StaticSiteName+'/img/letter'+isRead+'.gif">';
        }
        if (Messages[i].f+Messages[i].o!=''){ Out[Out.length]='</a>'; }
        Out[Out.length]='</td>';
        if (!Messages[i].pid || Messages[i].f=='' && Messages[i].o==''){
            Out[Out.length]=TDonClick+(BoxType==2 ? ' colspan="2">' : '>')+(Messages[i].x==0?'<small>Game&nbsp;</small>':('<a href="/planet/?planetid='+Messages[i].x+':'+Messages[i].y+'" target="_top">&lt;'+Messages[i].x+':'+Messages[i].y+'&gt;</a>&nbsp;'))+'</td>';
        } else {
            var BTint=(BoxType!=2) ? 0 : (Messages[i].f!='' && Messages[i].o!='') ? 1 : 2;
            Out[Out.length]=TDonClick+(BTint==2 ? ' colspan="2">' : '>')+'<nobr><a href="javascript:HelpWnd(\''+WorldHost(Messages[i].pid)+'/frames/playerinfo/on/'+Messages[i].pid+'\')">'+(Messages[i].f==''?Messages[i].o:Messages[i].f)+'</a>&nbsp;</nobr></td>';
            if(BTint==1){ Out[Out.length]=TDonClick+'><nobr><a href="javascript:HelpWnd(\''+WorldHost(Messages[i].pid)+'/frames/playerinfo/on/'+Messages[i].pid+'\')">'+Messages[i].o+'</a>&nbsp;</nobr></td>'; }
        }
        var Subj=EscapeName(Messages[i].s);
        Out[Out.length]=TDonClick+' class="com_subj"><a href="javascript:void(\''+Messages[i].i+'\')" class="com_msg_subj'+isRead+'">'+Subj+CnT+'</a>&nbsp;</td>'+
            TDonClick+' colspan="2" align="right"'+IsHot+'><nobr>'+Messages[i].d+'</nobr></td>'+
            TDonClick+' align="right"'+IsHot+'>&nbsp;('+Messages[i].m+')</td>'+
            '<td width="1%"><input class="checkbox" type="Checkbox" name="msg_chk'+Messages[i].i+'" id="msg_chk'+Messages[i].i+'" onclick="return ChangeMessageState(\''+Messages[i].i+'\');"></td></tr>';
    }
    Out[Out.length]='</table>';
    return Out.join('');
}

function EscapeName(Name){
    if (!Name){
        return Name;
    }
    Name=Name.toString().replace(/</g,'&lt;');
    return Name.replace(/>/g,'&gt;');
}

function EscapeJS(str) {
	if (!str) {
		return str;
	}
	return str.toString().replace(/"/g, '&quot;');
}

function SortHead(Text,SortLetter,Align){
    var Out='';
    if(SortBy == SortLetter){
        Out+='<td class="table_header"'+Align+'>'+Text+'</td>';
    } else {
        Out+='<td class="table_header"'+Align+'><a class="table_header" href="javascript:window.parent.SortMessagesBy(\''+SortLetter+'\')">'+Text+'</a>&nbsp;</td>';
    }
    return Out;
}

var PrevcomCell;
var ActiveMsgID=0;
var ActiveBox=100;
var ActiveChannel=0;
var Sender='';
var Recipient='';
var Messages;
var SortBy;

function CommSubjClick(MsgID){
// РЎРїРµСЂРІР° СЂР°СЃРєСЂР°СЃРёРј СЃС‚СЂРѕРєСѓ
    if (PrevcomCell && ActiveMsgID && !window.msglist.document.getElementById('msg_chk'+ActiveMsgID).checked){
        PrevcomCell.className='';
    }
    Sender=0;
    ActiveMsgID=MsgID;
    PrevcomCell=window.msglist.document.getElementById('com_row_'+MsgID);
    PrevcomCell.className='com_selected_msg';
    window.msgbody.document.location='/blackframes/comm_browse_msg/on/'+MsgID+'/';
// Р•СЃР»Рё СЌС‚Рѕ РЅРµ РѕС‚РїСЂР°РІР»РµРЅРЅС‹Рµ, РїРѕРјРµС‚РёРј РєР°Рє РїСЂРѕС‡С‚РµРЅРЅРѕРµ
    if (ActiveBox != 101){
        window.msglist.document.getElementById('ltr_img_'+MsgID).src=StaticSiteName+'/img/letter.gif';
        var NeedRecalc=0;
        for(var i=0;i<Messages.length;i++){
            if (Messages[i].i == MsgID){
                Sender=Messages[i].f;
                if(Messages[i].r == 0)
                    UnreadMessagesCount['m'+ActiveBox]--;
                Messages[i].r=1;
                AllMessages['m'+ActiveBox][i].r=1;
                if (Messages[i].l){
                    window.msglist.document.getElementById('ltr_img_'+MsgID).src=StaticSiteName+'/img/logo/'+Messages[i].l+'/ico_dip_'+(isRead?'4l':'self')+'.gif';
                }
            }
        }
        ReloadBox(ActiveBox);
    }
    for(var i=0;i<Messages.length;i++){
        if (Messages[i].i == MsgID){
            Recipient=Messages[i].o;
        }
    }
    DisableButtons(0);
    if (!Sender){
        document.getElementById('com_btn1').disabled=1;
        document.getElementById('com_btn1').style.color='Gray';
    }
    if (!Recipient && !Sender){
        document.getElementById('com_btn2').disabled=1;
        document.getElementById('com_btn2').style.color='Gray';
    }
    var AlCheckedItems=GetCheckedItems();

    window.msglist.document.getElementById('msg_chk_all').checked=AlCheckedItems.length==Messages.length;
}

function ButtonDenied(NBtn){
    return NBtn==4 && ActiveBox==103 ||
        NBtn==5 && (ActiveBox == 101 || ActiveBox == 103) ||
        NBtn==6 && (ActiveBox == 101 || ActiveBox == 102);
}

function DisableButtons(Disable){
    for (var i=1;i<=8;i++){
        var btn = document.getElementById('com_btn'+i);
        if(btn && (Disable || !ButtonDenied(i))){
            btn.disabled=Disable;
            btn.style.color=Disable?'Gray':'white';
        }
    }
}

function CheckAllMessages(){
    var NewChecked=window.msglist.document.getElementById('msg_chk_all').checked;
    window.msglist.NumberOfCheckedMessages = NewChecked?Messages.length:0;
    window.msglist.ChangeMessageState(0);
    var NewStyleName=NewChecked?'com_selected_msg':'';
    for(var i=0;i<Messages.length;i++){
        window.msglist.document.getElementById('msg_chk'+Messages[i].i).checked=NewChecked;
        window.msglist.document.getElementById('com_row_'+Messages[i].i).className=NewStyleName;
    }
    DisableButtons(!NewChecked);
}

function AllChecked(){
    return window.msglist.document.getElementById('msg_chk_all').checked
}
function GetCheckedItems(){
    var Cheked=new Array();
    for(var i=0;i<Messages.length;i++){
        if (window.msglist.document.getElementById('msg_chk'+Messages[i].i).checked){
            Cheked[Cheked.length]=Messages[i].i;
        }
    }
    if (!Cheked.length){
        Cheked[0]=ActiveMsgID;
    }
    return Cheked;
}

function ReloadBox(BoxN){
    var inbox = document.getElementById('inbox_num_'+BoxN);
    if(! inbox)
        return;
    var UnreadCount=UnreadMessagesCount['m'+BoxN];
    if (UnreadCount){
        UnreadCount='&nbsp;('+UnreadCount+')';
    } else {
        UnreadCount='';
    }
    inbox.innerHTML=UnreadCount;
}

// РњРµС‚РѕРґС‹ РґР»СЏ СЃРѕСЂС‚РёСЂРѕРІРєРё Рё СЃР°РјР° СЃРѕСЂС‚РёСЂРѕРІРєР°.

function SortMessagesBy(sortType){
    SortBy=sortType;
    if (Messages){
        if (SortBy == 's' || SortBy == 'f' || SortBy == 'o'){
            Messages.sort();
        }else{
            Messages.sort(compareNum);
        }
        window.msglist.document.getElementById('msglist_div').innerHTML=BuildMessageHeaders();
    } else {
        window.msglist.document.getElementById('msglist_div').innerHTML='('+NoneStr+')';
    }
    ChangeMessageState(0);
    return;
}

function TS(){
    return (SortBy=='s') ?
        this.s.toLowerCase()+'вє'+this.t : (SortBy=='f') ?
        this.f.toLowerCase()+'вє'+this.t :
        this.o.toLowerCase()+'вє'+this.t;
}

function compareNum(a,b){if(SortBy == '@' && b.h != a.h){return b.h - a.h}if(SortBy == 't' || SortBy == '@'){return b.t - a.t}else{return a.r - b.r}}

// ===============================
function SwitchBox(Box){
    if(Box==-1) return;
    ActiveBox=Box;
    if(InLock) return;
    document.getElementById('MailboxView').style.display='block';
    document.getElementById('ChannelsView').style.display='none';
    Messages = AllMessages["m"+Box];
    BoxType = AllMessages["x"+Box];
    if(!Messages){
        AllMessages["m"+Box]=new Array();
        CommunicatorMsgsReloadHtml();
        return;
    }
    SortMessagesBy(SortBy);
    window.msgbody.document.location='/about/blank/';
    ActiveMsgID=0;
    document.getElementById('checked_counter').innerHTML='';
    window.msglist.NumberOfCheckedMessages = 0;
    window.msglist.ChangeMessageState(0);
    return;
}
function FinishCommunicatorReload(){
    var BoxList= new Array(100,101,102,103,104,0,1,2,3);
    for(var i=0;i<BoxList.length;i++){
        ReloadBox(BoxList[i]);
    }
    InLock=0;
    if(ActiveBox<0){ SwitchChannel(ActiveChannel); }
    else{ SwitchBox(ActiveBox); }

    document.getElementById('com_btn_sendreceive').disabled=0;
    document.getElementById('com_btn_sendreceive').style.color='white';
}

function CommunicatorMsgsReloadHtml(){
    InLock=1;
    CurTime = new Date();
    rand=CurTime.getTime();

    window.msgReloader_frame.document.location = '/blackframes/fetch_msgs/on/0/?box='+ActiveBox+'&rand='+rand;
    document.getElementById('com_btn_sendreceive').disabled=1;
    document.getElementById('com_btn_sendreceive').style.color='Gray';
}

function CopyMsgToBox(MsgID,BoxN){
    var Msg;
    for(var i=0;i<Messages.length;i++){
        if (Messages[i].i == MsgID){
            Msg=Messages[i];
        }
    }
    var NewBox=AllMessages["m"+BoxN];
    if (!NewBox){
        AllMessages["m"+BoxN]=[Msg];
        AllMessages["x"+BoxN]=AllMessages["x"+ActiveBox];
    } else {
        NewBox[NewBox.length]=Msg;
    }
}

var ChannelTopics;
var CurChanelN;
var RequiredReload;

function OpenSearchPage(){
    if (InLock){
        return;
    }
    document.getElementById('MailboxView').style.display='none';
    document.getElementById('ChannelsView').style.display='block';
    window.channels_frame.document.location='/blackframes/communicator_search/on/0/';
}

function SwitchChannel(NewChanelID){
    ActiveBox=-1;
    ActiveChannel=NewChanelID;
    if (InLock){
        return;
    }
    RequiredReload=0;
    if (!window.channels_frame && parent.window.channels_frame){
        parent.SwitchChannel(NewChanelID);
        return;
    }
    document.getElementById('MailboxView').style.display='none';
    document.getElementById('ChannelsView').style.display='block';
    CurChanelN=NewChanelID;
    ChannelTopics = AllChannels['c'+NewChanelID];
    var st=window.channels_frame.document.location+'';
    var Wnd=null;
    if (window.channels_frame.document){
        Wnd=window.channels_frame.document.getElementById('CreateNewTopic');
        RequiredReload=1;
    }
    if (st.indexOf('/blackframes/channel_topics/on/0/')==-1 || Wnd==null){
        window.channels_frame.document.location='/blackframes/channel_topics/on/0/';
    } else {
        window.channels_frame.document.getElementById('CreateNewTopic').style.display='none';
        if (ChannelTopics){
            DrawChannelHeaders();
        } else {
            window.channels_frame.document.getElementById('ChannelHeadersDiv').innerHTML=LoadingStr+'...';
            var span = document.getElementById('MsgReloaderContainer');
            if (!span){
                return;
            }
            InLock=1;
            CurTime = new Date();
            rand=CurTime.getTime();
            pageN=ChannelPages['p'+CurChanelN]?ChannelPages['p'+CurChanelN].p:0;
            span.style.display = 'none';
            span.innerHTML = '&nbsp;<iframe src="/blackframes/channel_headers/on/'+pageN+'_'+rand+'_'+NewChanelID+'/" marginheight="0" marginwidth="0" frameborder="0" height="0" width="0" scrolling="no"></iframe>';
        }
    }
    return;
}

var MsgPerPageInThread=15;
function DrawChannelHeaders(){
    var Out;
    if (ChannelTopics.length){
        var ChanelHeader=ChannelTopics[0].h?'<td class="table_header"><nobr>'+ChanelNameStr+'</nobr></td>':'';
        var Out='<table width="100%" class="com_mes" cellpadding="2" cellspacing="0" border="0"><tr><td class="table_header" width="1%">&nbsp;</td><td class="table_header">'+
            SubjStr+'&nbsp; &nbsp;<small>(<a href="javascript:window.parent.ReloadChannel()">'+ReloadStr+'</a>)</small></td>'+ChanelHeader+'<td class="table_header" width="3%">'+Author+'&nbsp;</td><td class="table_header" width="3%">'+LastAuthorStr+'&nbsp;</td>'+
            '<td class="table_header" width="1%">'+Coments+'&nbsp;</td>'+
            '<td class="table_header" width="1%">'+ReadsCountStr+'&nbsp;</td>'+
            '<td class="table_header" width="1%">'+DateStr+
            '</td><td class="table_header" width="1%"><img src="'+StaticSiteName+'/img/z.gif" alt="" width="1" height="1"></td></tr>';
        for(var i=0;i<ChannelTopics.length;i++){
            var TopicPages='',LastPage='',isRead=ChannelTopics[i].r>0,
                DefReadMark=isRead ? '' : ' onclick="window.parent.MarkThreadRead('+i+')"';
            if(ChannelTopics[i].c>MsgPerPageInThread){
                var ShowCont=1,PageCnt=ChannelTopics[i].c-1,DefPage=(ChannelTopics[i].lpr-ChannelTopics[i].lpr%MsgPerPageInThread)/MsgPerPageInThread;
                PageCnt=1+(PageCnt-PageCnt%MsgPerPageInThread)/MsgPerPageInThread;
                TopicPages='&nbsp;<span class="comm_pages">[';
                for(var i1=0;i1<PageCnt;i1++){
                    var SkipStep=(PageCnt-PageCnt%100)/100;
                    SkipStep=(SkipStep>0) ? SkipStep*10 : 10;
                    if(PageCnt<50 || i1<10 || i1>PageCnt-6 || ((i1+1)%SkipStep)==0){
                        if(i1>0) LastPage='?page='+i1;
                        TopicPages+=' <a class="com_msg_subj" href="/blackframes/showthread/on/'+ChannelTopics[i].i+
                            '/'+ChannelTopics[i].u+LastPage+'"'+(i1<PageCnt-1 ? '' : DefReadMark)+'>'+(i1+1)+'</a>';
                        ShowCont=1;
                    }else if(ShowCont>0){
                        TopicPages+=' ..';
                        ShowCont=0;
                    }
                }
                if(!DefPage) LastPage='';
                else if(DefPage<PageCnt){
                    LastPage='?page='+DefPage;
                    if(DefPage<PageCnt-1) DefReadMark='';
                }
                TopicPages+='&nbsp;]</span>';
            }
            isRead=isRead ? '' : '1';
            TdCl='<td';
            ChanelName=ChanelHeader==''?'':TdCl+'>'+ChannelTopics[i].h+'&nbsp;</td>';
            AdminLinks='<img src="'+StaticSiteName+'/img/z.gif" alt="" width="1" height="1"/>';
            if (ChannelsRights['r'+CurChanelN]){
                if (ChannelTopics[i].k){
                    var pagenameparam=ChannelPages['p'+CurChanelN].p>0 ? ','+ChannelPages['p'+CurChanelN].p : '';
                    AdminLinks='&nbsp;<a href="javascript:parent.KillTopic('+i+pagenameparam+')">Del</a>';
                    if (ChannelsRights['r'+CurChanelN]>1){
                        AdminLinks+='&nbsp;<a title="Move topic to another channel" href="javascript:HelpWnd(\'/frames/move_topic/on/'+ChannelTopics[i].i+'/\')">M</a>';
                        AdminLinks+='&nbsp;<a title="Lock topic, disable future comments" href="javascript:parent.LockTopic('+i+pagenameparam+')">L</a>';
                        AdminLinks+='&nbsp;<a title="Pin topic, make it always stay on top" href="javascript:parent.SetOnTopTopic('+i+pagenameparam+')">T</a>';
                    }
                }
            }
            LockedL=ChannelTopics[i].l ? 'b' : '';
            OnTop=ChannelTopics[i].t ? 'l' : '';
            var PrevPost=(isRead && ChannelTopics[i].lrp) ? '#post_'+ChannelTopics[i].lrp : '';
            Out+='<tr>'+TdCl+' width="1%"><img id="ltr_img_'+ChannelTopics[i].i+'" width="18" height="18" border="0" src="'+StaticSiteName+'/img/letter'+OnTop+LockedL+isRead+'.gif" alt="'+(isRead?'+':'-')+'"></td>'+TdCl+
                '><a class="com_msg_subj" href="/blackframes/showthread/on/'+ChannelTopics[i].i+'/'+ChannelTopics[i].u+LastPage+PrevPost+'"'+DefReadMark+'>'+ChannelTopics[i].s+'</a>'+TopicPages+'</td>'+ChanelName+
                '<td><a href="javascript:HelpWnd(\''+WorldHost(ChannelTopics[i].fi)+'/frames/playerinfo/on/'+ChannelTopics[i].fi+'/\')">'+ChannelTopics[i].f+'</a></td>'+
                '<td><a href="javascript:HelpWnd(\''+WorldHost(ChannelTopics[i].lpi)+'/frames/playerinfo/on/'+ChannelTopics[i].lpi+'/\')">'+ChannelTopics[i].lpn+'</a></td>'+
                TdCl+' align="right">'+ChannelTopics[i].c+'&nbsp;</td>'+
                TdCl+' align="right">'+ChannelTopics[i].v+'&nbsp;</td>'+
                TdCl+'><nobr><small>'+ChannelTopics[i].d+'</small></nobr></td><td><small>'+AdminLinks+'</small></td></tr>';
        }
        Out+='</table>';
        // Р•СЃР»Рё РјРЅРѕРіРѕСЃС‚СЂР°РЅРёС‡РЅРѕРµ С‚СѓС‚ РґРµР»Рѕ Сѓ РЅР°СЃ
        if (ChannelPages['p'+CurChanelN].c > 1){
            Out+='<br>';
            var Start=1;
            if (ChannelPages['p'+CurChanelN].p > 11){
                Start=ChannelPages['p'+CurChanelN].p - 10;
                Out+='&nbsp;<a href="javascript:window.parent.ReloadChannel('+(Start-2)+')">...</a>';
            }
            var End=Start+20;
            if (ChannelPages['p'+CurChanelN].c < End){
                End=ChannelPages['p'+CurChanelN].c;
            }
            for(var i=Start;i<=End;i++){
                Out+='&nbsp;';
                Out+=(ChannelPages['p'+CurChanelN].p==i-1)?'<strong>'+i+'</strong>':'<a href="javascript:window.parent.ReloadChannel('+(i-1)+')">'+i+'</a>';
            }
            if (End < ChannelPages['p'+CurChanelN].c){
                Out+='&nbsp;<a href="javascript:window.parent.ReloadChannel('+End+')">...</a>';
            }
        }
    } else {
        Out='('+NoneStr+')&nbsp;&nbsp;<small>(<a href="javascript:window.parent.ReloadChannel()">'+ReloadStr+'</a>)</small>';
    }
    window.channels_frame.document.getElementById('ChannelHeadersDiv').innerHTML=Out;
    window.channels_frame.document.getElementById('CreateNewTopic').style.display=ChannelsRights['r'+CurChanelN]>0?'block':'none';
    window.channels_frame.document.post.channel.value=ChannelsRights['r'+CurChanelN]>0?CurChanelN:0;
}

function MarkThreadRead(i,byId){
    if(byId){
        var id=i;
        i=0;
        while(i<ChannelTopics.length && ChannelTopics[i].i!=id) i++;
    }
    if(i<ChannelTopics.length){
        ChannelTopics[i].r=1;
        var ltrimg=window.channels_frame.document.getElementById('ltr_img_'+ChannelTopics[i].i);
        if(ltrimg) ltrimg.src=StaticSiteName+'/img/letter.gif';
    }
}

function PoolOnOff(){
    var PoolShowMode=document.post.has_pool.checked?'block':'none';
    document.getElementById('pool_edit').style.display=PoolShowMode;
}

function ShowEnterMsgField(){
    if (document.getElementById('RealPostBox').style.display=='block'){
        document.getElementById('RealPostBox').style.display='none'
    } else {
        document.getElementById('RealPostBox').style.display='block';
    }
    return;
}

function ReloadChannel(PageN){
    if(PageN>=0) ChannelPages['p'+CurChanelN].p=PageN;
    AllChannels['c'+CurChanelN]=0;
    SwitchChannel(CurChanelN);
}

function KillTopic(TopicN,OnPage){
    if(confirm(ConfirmKillStr)){
        ChannelPages['p'+CurChanelN].p='kill_topic_'+ChannelTopics[TopicN].i+'_'+(OnPage ? OnPage : 0);
        ReloadChannel();
    }
}

function LockTopic(TopicN,OnPage){
    ChannelPages['p'+CurChanelN].p='lock_topic_'+ChannelTopics[TopicN].i+'_'+(OnPage ? OnPage : 0);
    ReloadChannel();
}

function SetOnTopTopic(TopicN,OnPage){
    ChannelPages['p'+CurChanelN].p='on_top_topic_'+ChannelTopics[TopicN].i+'_'+(OnPage ? OnPage : 0);
    ReloadChannel();
}

function BanThisUser(UserID,TopicID,PageID){
    countDays=prompt(BanPrompt,7);
    if(countDays){
        var cdres=countDays.match(/^(\d\d?)(?:,\s*(.*))?$/);
        if(cdres && cdres[1]>0 && cdres[1]<31){
            var reason=cdres[2] ? '&reason='+cdres[2] : '';
            document.location='/blackframes/showthread/on/'+TopicID+'/?page='+PageID+'&banuser='+UserID+'&days='+cdres[1]+reason+'&rand='+Math.floor(Math.random()*100000);
        }else alert(BanLimit);
    }
}

//===================== actions ===========
function CancelBuilding(id){
    if(confirm(CancelBuildPrompt)) document.location='/frames/planet_buildings/on/planet/?planetid='+XY+'&action=drop_building_from_que&building_id='+id;
}

function MoveToQueueBegin(UnitId){
    if(!Paid) alert(StrPaidless);
    else document.location='/frames/planet_buildings/on/'+On+'/?planetid='+XY+'&action=swap_building&direct=top&unit_id='+UnitId;
}

function MoveToQueueBottom(UnitId){
    if(!Paid) alert(StrPaidless);
    else document.location="/frames/planet_buildings/on/"+On+"/?planetid="+XY+"&action=swap_building&direct=bottom&unit_id="+UnitId;
}

function MoveUpInTheQueue(UnitId){
    if(!Paid) alert(StrPaidless);
    else document.location="/frames/planet_buildings/on/"+On+"/?planetid="+XY+"&action=swap_building&direct=up&unit_id="+UnitId;
}

function MoveDownInTheQueue(UnitId){
    document.location="/frames/planet_buildings/on/"+On+"/?planetid="+XY+"&action=swap_building&direct=down&unit_id="+UnitId;
}

function ClearQueue(){
    if(!Paid) alert(StrPaidless);
    else if(confirm(ClearQueuePrompt)) document.location='/frames/planet_buildings/on/planet/?planetid='+XY+'&action=clear_queue';
}

function BuildMany(id){
    if(Paid){
        countToBuild=prompt(MassBuildPrompt,2);
        if(countToBuild){
            re=/^(\d\d?)$/;
            if(countToBuild.match(re))
                document.location='/frames/planet_buildings/on/planet/?planetid='+XY+'&action=add_building_to_que&cnt='+countToBuild+'&building_id='+id;
            else alert(NeedLimitedInteger+'100');
        }
    }else alert(StrPaidless);
}

function DemolishBuilding(id,name,confirm_text,subact){
    if(!confirm_text) confirm_text=DemolishPrompt;
    if(confirm(confirm_text+' "'+name+'"?')){
        if(subact) subact='&'+subact;
        else subact='';
        window.parent.document.location='/'+On+'/?planetid='+XY+'&action=demolish_building'+subact+'&redir_to='+On+'&unit_id='+id;
    }
}

function DemolishMany(id,cnt,name){
    if(Paid){
        var countToDem=prompt(MassDemolishPrompt1+name+MassDemolishPrompt2,1);
        if(countToDem){
            re=/^(\d\d?)$/;
            if(countToDem.match(re) && countToDem<=cnt)
                window.parent.document.location='/'+On+'/?planetid='+XY+'&action=demolish_building&redir_to='+On+'&unit_id='+id+'&cnt='+countToDem;
            else alert(NeedLimitedInteger+cnt);
        }
    }else alert(StrPaidless);
}

function MoveUnitTo(UnitId,FleetId){
    if(FleetId!='skip') document.location='/'+On+'/?planetid='+XY+'&action=move_unit_to_fleet&fleet_id='+FleetId+'&unit_id='+UnitId;
}

function CustomizeContainer(UnitId,cnt){
    cnt=cnt ? '&cnt='+cnt : '';
    window.parent.document.location='/'+On+'/?planetid='+XY+'&action=customise_container&container='+UnitId+cnt;
}

function CustomizeMany(UnitId){
    if(Paid){
        var countToWork=prompt(StrMassCustomizeGetCount,1);
        if(countToWork){
            re=/^(\d\d?)$/;
            if(countToWork.match(re)) CustomizeContainer(UnitId,countToWork);
            else alert('Incorrect number');
        }
    }else alert(StrPaidless);
}

var PrevFleetName='Fleet';
function CreateFleet(){
    NewFleetName=prompt(StrGetNameForFleet,parent ? parent.PrevFleetName : PrevFleetName);
    if(NewFleetName){
        if(NewFleetName.length<=30){
            location='/frames/planet_fleets/on/planet/?planetid='+XY+'&action=create_new_fleet&new_fleet_name='+encodeURIComponent(NewFleetName);
            if(parent) parent.PrevFleetName=NewFleetName;
        }else alert(StrTooLongFleetName);
    }
}

function CreateFleetFromChoosen(FleetID){
    var retval=false,NewFleetName=parent.prompt(StrGetNameForFleet,parent ? parent.PrevFleetName : PrevFleetName);
    if(NewFleetName) {
        if(NewFleetName.length<=30){
            document.getElementById('fleet_from_selected_form'+FleetID).new_fleet_name.value=NewFleetName;
            if(parent) parent.PrevFleetName=NewFleetName;
            retval=true;
        }else alert(StrTooLongFleetName);
    }
    return retval;
}

function JumpFleetTo(FleetID,MaxDist,FleetSpeed,IsHome,FromX,FromY){
    var Destination=prompt(StrGetFleetTarget,XY),re=/(\d+)\D(\d+)/;
    if(Destination){
        if(Destination.match(re)){
            var Coords=re.exec(Destination),len=distance(Coords[1],Coords[2],FromX,FromY);
            Destination=Coords[1]+':'+Coords[2];
            if(!len) alert(StrFleetTargetAlreadyOn+Destination);
            else if(len>MaxDist) alert(StrFleetTargetTooFar);
            else if(!IsHome && !UserPlanets['a'+Coords[1]+'_'+Coords[2]] && !UserPlanets['a'+FromX+'_'+FromY])
                alert(StrFleetTargetAlsoAlien);
            else if(confirm(StrFleetTargetTakes+Math.ceil(len/FleetSpeed)+StrFleetTargetAccept))
                parent.document.location='/'+On+'/?planetid='+XY+'&action=move_fleet&fleet_id='+FleetID+'&move_to='+Destination;
        }else alert(StrFleetTargetWrong);
    }
}

function UnpackUnit(id){
    if(confirm(StrAcceptionUnpack+'?')) parent.document.location='/'+On+'/?planetid='+XY+'&action=unpack_container&building_id='+id;
}

var SelectedSkinInFleet={};
function SelectSkin(Fleet,NewSel){
    var newunitid=NewSel.id.replace('gskin_','');
    if(SelectedSkinInFleet[Fleet]){
        var SelectedSkin=SelectedSkinInFleet[Fleet];
        SelectedSkin.src=SelectedSkin.src.replace('/selected/','/buildings/');
        var unitid=SelectedSkin.id.replace('gskin_','');
        var img_container=document.getElementById('gskin_img');
        if(img_container) img_container.innerHTML=img_container.innerHTML.replace(unitid,newunitid);
        document.getElementById('gskin_acts_'+unitid).style.display='none';
        document.getElementById('gskin_view_'+unitid).style.display='none';
        var mvb=document.getElementById('mv_select_'+unitid);
        if(mvb){
            mvb.id='mv_select_'+newunitid;
            var onch=mvb.getAttribute('onchange');
            if(onch) mvb.setAttribute('onchange',onch.replace(unitid,newunitid));
        }
        var chb=document.getElementById('nf_check_'+unitid);
        if(chb){
            chb.id='nf_check_'+newunitid;
            chb.name='nf_check_'+newunitid;
        }
    }
    document.getElementById('gskin_acts_'+newunitid).style.display='inline';
    document.getElementById('gskin_view_'+newunitid).style.display='inline';
    NewSel.src=NewSel.src.replace('/buildings/','/selected/');
    SelectedSkinInFleet[Fleet]=NewSel;
}

function CheckProcAward(frm,limit){
    var nn=frm.player_names.value,errstr;
    if(!nn) errstr=StrAwardProcNoNames;
    else if((nn=nn.split(',').length)>limit){
        nn-=limit;
        errstr=StrAwardProcTooManyNames1+nn+StrAwardProcTooManyNames2;
    }else if(frm.alloc && !frm.alloc.value) errstr=StrAwardProcNoAllocution;
    if(errstr) alert(errstr);
    else frm.submit();
}

function BuyAward(frm,psz,limit,price){
    var packCount,str=psz>1 ?
        StrBuyAwardGetPackCount1+limit+StrBuyAwardGetPackCount2+psz+StrBuyAwardGetPackCount3+price+StrBuyAwardGetPackCount4 :
        StrBuyAwardGetCount1+limit+StrBuyAwardGetCount2+price+StrBuyAwardGetCount3;
    while((packCount=prompt(str,1)) && (!packCount.match(/^\d+$/) || (packCount=1*packCount)<=0 || packCount>limit)) alert(StrBuyAwardIncorrectNumber);
    if(packCount){
        frm.pack_num.value=packCount;
        frm.submit();
    }
}

function EditAward(frm){
    if(frm.award && frm.award.value>0) frm.submit();
    else if(!frm.award_name.value.match(/[^\s]/)) alert(StrEditAwardFaultName);
    else if(!frm.file_award_img1.value.match(/[^\s]/) || !frm.file_award_img2.value.match(/[^\s]/) ||
        frm.file_award_img3 && !frm.file_award_img3.value.match(/[^\s]/) ||
        frm.file_award_img4 && !frm.file_award_img4.value.match(/[^\s]/) ||
        frm.file_award_img5 && !frm.file_award_img5.value.match(/[^\s]/) ||
        frm.file_award_img6 && !frm.file_award_img6.value.match(/[^\s]/)) alert(StrEditAwardFaultImg);
    else if(frm.award_statut && !frm.award_statut.value.match(/[^\s]/)) alert(StrEditAwardFaultStatut);
    else frm.submit();
}

//===================== misk ===========
function cvts(n) {
    if (!n)
        return '#'
    return (cvt100s(n) + cvt10s(n) + cvt1s(n))
}

function cvt100s(h) {
    // converts hundreds digit to a subtractive Roman numeral ...
    var m = '';
    h = Math.floor((h % 1000) / 100);
    if (h == 9) {m = 'CM'}
    else if (h > 4) {m = 'DCCC'.substr(0, h - 4)}
    else if (h == 4) {m = 'CD'}
    else {m = 'CCC'.substr(0, h)};
    return m;
}


function cvt10s(t) {
    // converts tens digit to a subtractive Roman numeral ...
    var m = '';
    t = Math.floor((t % 100) / 10);
    if (t == 9) {m = 'XC'}
    else if (t > 4) {m = 'LXXX'.substr(0, t - 4)}
    else if (t == 4) {m = 'XL'}
    else {m = 'XXX'.substr(0, t)};
    return m;
}
function cvt1s(u) {
    // converts units digit to a subtractive Roman numeral ...
    var m = '';
    u = u % 10;
    if (u == 9) {m = 'IX'}
    else if (u > 4) {m = 'VIII'.substr(0, u - 4)}
    else if (u == 4) {m = 'IV'}
    else {m = 'III'.substr(0, u)};
    return m;
}

//===================== Browser-detection staff ================================
var BrowserDetect = {
    init: function () {
        this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
        this.version = this.searchVersion(navigator.userAgent)
            || this.searchVersion(navigator.appVersion)
            || "an unknown version";
        this.OS = this.searchString(this.dataOS) || "an unknown OS";
    },
    isOk: function() {
        var Ok=1;
        if (this.browser == 'Explorer' && this.version < 5.5 || this.browser == 'Safari'){
            Ok=0;
        } else if (this.browser == 'Opera' && this.version < 8.5){
            Ok=0;
        } else if (this.browser == 'Explorer' || this.browser == 'Firefox' || this.browser == 'Mozilla' && this.version >= 1.7){
            Ok=2;
        } else if (this.browser == 'Opera' && this.version >= 8.5){
            Ok=2;
        }
        return Ok;
    },
    searchString: function (data) {
        for (var i=0;i<data.length;i++)	{
            var dataString = data[i].string;
            var dataProp = data[i].prop;
            this.versionSearchString = data[i].versionSearch || data[i].identity;
            if (dataString) {
                if (dataString.indexOf(data[i].subString) != -1)
                    return data[i].identity;
            }
            else if (dataProp)
                return data[i].identity;
        }
        return "";
    },
    searchVersion: function (dataString) {
        var index = dataString.indexOf(this.versionSearchString);
        return (index == -1) ? 0.0 : parseFloat(dataString.substring(index+this.versionSearchString.length+1));
    },
    dataBrowser: [
        { 	string: navigator.userAgent,
            subString: "OmniWeb",
            versionSearch: "OmniWeb/",
            identity: "OmniWeb"
        },
        {
            string: navigator.vendor,
            subString: "Apple",
            identity: "Safari"
        },
        {
            prop: window.opera,
            identity: "Opera"
        },
        {
            string: navigator.vendor,
            subString: "iCab",
            identity: "iCab"
        },
        {
            string: navigator.vendor,
            subString: "KDE",
            identity: "Konqueror"
        },
        {
            string: navigator.userAgent,
            subString: "Firefox",
            identity: "Firefox"
        },
        {
            string: navigator.vendor,
            subString: "Camino",
            identity: "Camino"
        },
        {		// for newer Netscapes (6+)
            string: navigator.userAgent,
            subString: "Netscape",
            identity: "Netscape"
        },
        {
            string: navigator.userAgent,
            subString: "MSIE",
            identity: "Explorer",
            versionSearch: "MSIE"
        },
        {
            string: navigator.userAgent,
            subString: "Gecko",
            identity: "Mozilla",
            versionSearch: "rv"
        },
        { 		// for older Netscapes (4-)
            string: navigator.userAgent,
            subString: "Mozilla",
            identity: "Netscape",
            versionSearch: "Mozilla"
        }
    ],
    dataOS : [
        {
            string: navigator.platform,
            subString: "Win",
            identity: "Windows"
        },
        {
            string: navigator.platform,
            subString: "Mac",
            identity: "Mac"
        },
        {
            string: navigator.platform,
            subString: "Linux",
            identity: "Linux"
        }
    ]

};
BrowserDetect.init();

//---------------------------------------------------------------------------------------------------------------------

/**
 * Calculate maximum mining on the planet
 *
 * @param size - planet size [1, 99]
 * @param res  - planet resources [1, 99]
 * @param bonus [optional] - race mining bonus percentage (0 - for 0% bonus, 96 for 96%)
 * @param corruption [optional] - corruption on planet, float [0, 0.95]
 */
function calcMaxResOutput(size, res, bonus, corruption) {
	var max = (size * 2000 - 1) * Math.pow(res / 900.0, 3) * (1 + 0.2 * Math.floor((size * 2000 - 1) / 5000.0));
	if (bonus)
		max *= (1 + bonus / 100.0);
	if (corruption)
		max *= (1 - corruption);
	return max;
}

//---------------------------------------------------------------------------------------------------------------------

function ImproveHintsFrame() {
	if (!document.location.pathname.match(/\/frames\/hints\//))
		return;
	
	// remove long texts
    var tags = document.getElementsByTagName('li');
	for(var i = 0; i < tags.length; i++)
	{
		var tag = tags[i];
		for(var j = 0; j < tag.childNodes.length; j++)
		{
			if(tag.childNodes[j].nodeType === 3 && tag.childNodes[j].nextSibling == null) { // text only & if it's last node
				tag.removeChild(tag.childNodes[j]);
			}
		}
	}
	
	// add economic report link
    var ul = document.getElementsByTagName('ul')[0];
	var li = document.createElement('li');
	li.innerHTML = '<li><a href="/blackframes/economic_report/on/1/" target="_blank">Экономическая сводка</a></li>';
	ul.appendChild(li);
}

function ImproveDesignerFrame() {
	if (!document.location.pathname.match(/\/designer\//))
		return;
		
	// resize list of prototypes and prototyped
	var stickers = getElementsByClassName('sticker', document, 'div');
	stickers[0].firstChild.className = 'longLAYER';
	stickers[1].firstChild.className = 'longLAYER';
}

function MapExpand2(X, Y){
	if (!document.getElementById('extended_fleets') || !window.jQuery) {
		setTimeout ('MapExpand2('+X+', '+Y+')', 100);
		return;
	}
	
    ts = document.getElementById('top_shit');
    var TH = document.body.clientHeight - ts.offsetHeight - (BrowserDetect.browser == 'Opera'? 3 : 0) - 1;

    document.getElementById('skymap_frame').style.height = (TH - 50)+'px';
	document.getElementById('extended_fleets').style.height = (TH - 54 + (isNewInterface() ? 0 : -46))+'px';	// -46 pixels in old interface for new quick categories links

	document.getElementById('extended_fleets').style.width = '360px';

	var skymapNewWidth = document.body.clientWidth - document.getElementById('extended_fleets').offsetWidth - 50;

	if (isNewInterface()) {
		// NEW DESIGN WORKAROUND
		skymapNewWidth -= 20;
		
		if (document.getElementById('tb_extended_fleets')){
			var divs = getElementsByClassName('general-panel-content', document.getElementById('tb_extended_fleets'));
			if (divs.length) {
				divs[0].style.height = 'auto';
			}
		}
	}

	document.getElementById('skymap_frame').width = skymapNewWidth;
	setTimeout ('FinishMapExpand2('+X+', '+Y+')', 10);
	
	if (!isNewInterface() && !document.getElementById('nav_cat_menu')) {
		// quick links to sections
		$('#extended_fleets', document).parent().prepend(
				"<div id='nav_cat_menu' style='background-color: inherit; width: 98%; padding: 2px; border-bottom: 1px solid #808080;'>"+
					"<table style='width:98%; border: 0px solid black;' ><tr>"+
					"<td style='text-align:center; width: 25%;'><a href='javascript:window.frames.extended_fleets.ScrollToCategory(\"637\")'>Флоты</a></td>"+
					"<td style='text-align:center; width: 35%;'><a href='javascript:window.frames.extended_fleets.ScrollToCategory(\"638\")'>Гарнизоны</a></td>"+
					"<td style='text-align:center; width: 40%;'><a href='javascript:window.frames.extended_fleets.ScrollToCategory(\"245\")'>Флоты чужих</a></td>"+
					"</tr></table>"+
					"<table style='width:98%; border: 0px solid black;'><tr>"+
					"<td style='text-align:center; width: 60%;'><a href='javascript:window.frames.extended_fleets.ScrollToCategory(\"1323\")'>Местные сообшения</a></td>"+
					"<td style='text-align:center; width: 40%;'><a href='javascript:window.frames.extended_fleets.ScrollToCategory(\"639\")'>Сообщения</a></td>"+
					"</tr></table>"+
				"</div>");
	}
	
//    if (window.jQuery) $('#extended_fleets').closest('.scroll-pane').jScrollPane();
}

function FinishMapExpand2(X, Y){
    if (frames['skymap_frame'] && frames['skymap_frame'].InitMap){
        frames['skymap_frame'].InitMap(X, Y);
    }
	else {
		setTimeout ('FinishMapExpand2('+X+', '+Y+')', 100);
	}
}

function getElementsByClassName(searchClass, domNode, tagName) {
    if (domNode == null) domNode = document;
    if (tagName == null) tagName = '*';
    var el = new Array();
    var tags = domNode.getElementsByTagName(tagName);
    var tcl = " "+searchClass+" ";
    for(i=0,j=0; i<tags.length; i++) {
        var test = " " + tags[i].className + " ";
        if (test.indexOf(tcl) != -1)
            el[j++] = tags[i];
    }
    return el;
}

function isNewInterface() {
	return document.body.className == 'pageData-body'
}

function loadScript(url, callback)
{
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}

function loadCss(url)
{
    var head = document.getElementsByTagName('head')[0];
	var fileref = document.createElement("link")
	fileref.setAttribute("rel", "stylesheet")
	fileref.setAttribute("type", "text/css")
	fileref.setAttribute("href", url)
  
	head.appendChild(fileref)
}

window.onresize = function() {
    // fixing size of live map
	if (frames['skymap_frame']){
		var xy = XY.split(':');
		MapExpand2(xy[0], xy[1]);
	}
}

window.onload = function() {
	if (document.location.pathname.match(/\/army\//)) {
		loadScript(StaticSiteName + '/scripts/jquery-1.11.1.min.js?v=1.11.1');
		// fixing size of live map
		if (frames['skymap_frame']){
			var xy = XY.split(':');
			setTimeout ('MapExpand2('+xy[0]+', '+xy[1]+')', 10);
		}
	}
	
	ImproveHintsFrame();
	ImproveDesignerFrame();
}

var standardUnitNames = {1: 'Шахта', 2: 'Биоферма', 3: 'Генератор', 4: 'Казармы', 5: 'Верфь', 12: 'Дворец', 
						14: 'Завод', 22: 'Таможня', 25: 'Конструкторское Бюро', 28: 'Фабрика комплектующих', 
						31: 'Уплотнитель стази', 32: 'Центр исследований', 37: 'Квазимолекулярный уплотнитель', 
						41: 'Правительственный бункер', 42: 'Капитолий', 43: 'Стационарный портал', 45: 'Эвакуационный центр',
						7: 'Колония', 107: 'Форпост', 13: 'Наместник', 
						23: 'Растаможивание', 29: 'Контейнер деталей', 34: 'Специалист', 33: 'Исследование',
						999: 'Контейнер'};
						
var partNames = {
	3: "Легкий строенный лазер", 4: "Средний лазер", 5: "Легкая ракета", 6: "Броневые листы", 7: "Лазер ПРО", 
	8: "Двигатель Итера", 9: "Геологоразведчик", 10: "Движок-невидимка", 12: "Малый гипердвигатель", 13: "Транспортная ячейка", 
	15: "Двигатель Раша", 16: "Спаренный двигатель Раша", 17: "Гигантский двигатель", 19: "Система управления огнем", 43: 
	"Двигатель Итера легкий", 44: "Спаренный двигатель Итера", 45: "Сверхлегкий двигатель Итера", 46: "Двигатель со вторым резонатором", 
	47: "Строенный экономичный двигатель", 48: "Двигатель Пушинка", 49: "Форсированный двигатель Раша", 50: "Резонатор удвоенной частоты", 
	51: "Облегченный двигатель Раша", 52: "Дополнительный резонатор", 53: "Бак", 54: "Плазменная пушка", 55: "Тяжелый лазер", 
	56: "Облегченный лазер", 57: "Миниатюрный лазер", 58: "Гиперлазер", 59: "Лазерная турель", 60: "Спаренный сверхлегкий лазер", 
	61: "Гигантский лазер", 62: "Спаренная транспортная ячейка", 63: "Зенитный лазер", 64: "Пульсовый лазер", 65: "Спаренный пульсовый лазер", 
	66: "Многоцелевой лазер", 67: "Гиперлазер-II", 68: "Плазменная турель", 69: "Мини-плазменная пушка", 70: "Сверхлегкий лазер", 
	71: "Пульсовый зенитный лазер", 72: "Ракета", 73: "Игла", 74: "Спаренная Игла", 75: "Тяжелая ракета", 76: "Ракетный комплекс", 
	77: "Залповая ракетная система", 78: "Игла-II", 79: "Легкая Игла", 80: "Сверхтяжелая ракета", 81: "Счетверенная легкая ракета", 
	82: "Спаренная сверхтяжелая ракета", 83: "Счетверенная тяжелая ракета", 84: "Высокоточная ракета", 85: "Зеркальная лазерная защита", 
	86: "Легкое ПРО", 87: "Газовая защита от лазеров", 88: "Керамическая броня", 89: "Комплексная система защиты", 90: "Сверхлегкое ПРО", 
	91: "Усиленная газовая защита", 92: "Усиленные лазеры ПРО", 93: "Легкая комплексная защита", 94: "Системы наведения помех", 
	95: "Броня из пластистали", 96: "Живая броня", 97: "Гиперискажение на броне", 98: "Ложный корпус", 99: "Плазменный чехол", 100: "Детектор", 
	101: "Большой детектор", 102: "Дважды невидимка", 103: "Портативный детектор", 104: "Легкая транспортная ячейка", 
	105: "Строенная транспортная ячейка", 106: "Система наведения ракет", 107: "Обозреватель", 119: "Простая система наведения", 
	120: "Пылевая пушка", 129: "Сборщик астероидов", 130: "Продвинутый сборщик астероидов", 132: "Подбор контейнеров", 133: "Подбор карго", 
	135: "Конверсионный проект", 138: "Бурение ядра", 139: "Продвинутое бурение ядра", 141: "Кибер-дайвер", 143: "Нанодвигатель", 
	144: "Спаренный резонатор", 145: "Малый Коллайдерный Двигатель", 146: "Бак с компрессором", 147: "Стационарная батарея", 
	148: "Строенный сверхлегкий лазер", 149: "Кластерная турель", 150: "Тахионная гаубица", 151: "Стационарная турель", 
	152: "Нейронная система наведения", 153: "Протонная ракета", 154: "Гигантская ракета", 155: "Стационарный ракетный комплекс", 
	156: "Легкая протонная ракета", 157: "Стационарная защита", 158: "Термогель", 159: "Голографическая защита", 
	160: "Самоуправляемая защитная система", 161: "Стационарный оборонный комплекс", 162: "Параболическое зеркало", 
	163: "Трижды невидимка", 164: "Генератор прозрачности", 165: "Бронированный транспортный модуль", 
	166: "Десантный транспортный модуль", 167: "Комплект мародера", 168: "Лазер зачистки", 169: "",
	
	1: "Шаттл", 2: "Коммерческий шаттл", 11: "Зонд", 14: "Зенитный крейсер", 18: "Легкий крейсер", 20: "Катер", 21: "Транспорт", 
	22: "Штурмовик", 23: "Лаборатория", 24: "Пират", 25: "Корвет", 26: "Микрозонд", 27: "Орбитальная крепость", 28: "Ниндзя", 
	29: "Военный транспорт", 30: "Москит", 31: "Сторожевик", 32: "Рейсовый транспорт", 33: "Ракетный крейсер", 34: "Минилаборатория", 
	35: "Летучий Голландец", 36: "Большая орбитальная крепость", 37: "Планетарный штурмовик", 38: "Крейсер", 39: "Звезда смерти", 
	40: "Ракетный бот", 41: "Крейсер разведки", 42: "Орбитальная платформа", 108: "Силы самообороны", 109: "Пехота", 110: "Боевые роботы", 
	111: "Танк", 112: "Бункер", 113: "Боевые дройды", 114: "Батарея ПВО", 115: "Ракетная батарея", 116: "Большой бункер", 118: "Тяжелый робот", 
	121: "Бакен", 122: "Орбитальное поселение", 123: "Большое орбитальное поселение", 124: "Абордажная команда", 125: "Тяжелая абордажная команда", 
	126: "Абордажные дройды", 127: "Сборщик лома", 128: "Большой сборщик лома", 131: "Мобильная станция слежения", 134: "Тяжелая пехота", 
	137: "Батарея ПКО", 140: "Управляющий добычей", 142: "Орбитальный док"
};

/*
extraction tool:
function printAll(xml) {
	var self = this;
	var res = '';
	// component
	$("chassis", xml).each(function () {
		
		$("id", this).each(function () {
			res += $(this).text() + ': ';
		});
		
		$("name", this).each(function () {
			res += '"' + $(this).text() + '"';
		});
		
		res += ', ';
	});
	
	alert(res);
}

$.ajax({
	type: "POST",
	url: "/static/export/wxdcdesigner/chassiss.xml",	// components
	dataType: "xml",
	success: printAll
});
*/