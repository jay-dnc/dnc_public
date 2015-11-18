var StaticSiteName='http://www.l-game.ru/static';

function DrawPolitMapCell(id,coord){
	var color='#0000FF',hint='';
	if(id && Kingdoms[id]){
		color=Kingdoms[id].color;
		hint=' title="'+coord+' - '+Kingdoms[id].name+'"';
	}else hint=' title="'+coord+'"';
	return '<td bgColor="'+color+'"><img width="1" height="1" src="'+StaticSiteName+'/img/z.gif" border="0"'+hint+'/></td>';
}

function ClickPolitMap(obj,evt){
	if(!evt) evt=event;
	var x=evt.pageX ? evt.pageX : evt.clientX ? evt.clientX+document.documentElement.scrollLeft-1 : evt.layerX,
		y=evt.pageY ? evt.pageY : evt.clientY ? evt.clientY+document.documentElement.scrollTop-1 : evt.layerY;
	var poselem=obj;
	while(poselem){
		x-=poselem.offsetLeft;
      y-=poselem.offsetTop;
      poselem=poselem.offsetParent;
   }
	var n=PolitMap.length,id=0;
	if(n>1){
		var i=0,width=PolitMap[i++],cury=1,curx=0;
		do{
			var ix=PolitMap[i++];
			if(ix<=0){
				curx=0;
				do if(cury++>=y) n=ix=0; while(ix++<0);
			}else if(ix-->curx && ix<((cury<y) ? width : x)){
				curx=ix;
				id=PolitMap[i++];
			}else n=0;
		}while(i<n);
	}
	var place=document.getElementById('kplace');
	if(place) place.innerHTML=StrFoundOnPolitMap1+x+':'+y+'<br/>'+(Kingdoms[id] ? StrFoundOnPolitMap2 : StrFoundOnPolitMap3);
	var link=document.getElementById('klink');
	if(link) link.innerHTML=Kingdoms[id] ?
//		'<img id="kcolor" width="16" height="16" src="'+EmptyImage+'" style="background-color:'+
//		(Kingdoms[id] ? Kingdoms[id].color : '#000000')+';position:relative;top:3;border:1px outset white"/>&#160;'+
		'<a href="javascript:HelpWnd(\'/frames/playerinfo/on/'+id+'\')">'+Kingdoms[id].name+'</a>' : '';
	var cap=document.getElementById('kcapital');
	if(cap) cap.innerHTML=Kingdoms[id] ? Kingdoms[id].x+':'+Kingdoms[id].y : '';
	var info=document.getElementById('kinfo');
	if(info){
		info.style.display=Kingdoms[id] ? 'inline' : 'none';
		if(Kingdoms[id]){
			info.style.left=Kingdoms[id].x;
			info.style.top=Kingdoms[id].y;
		}
	}
}