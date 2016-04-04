var Prefix = "channels_root";
var PrefixLength = Prefix.length;
function drawtree() {
	var Itms=[];
	for(var i in ChannelTree){
		Itms[Itms.length]=i;
	}
	for (var i = 0; i < Itms.length; i++) {
		DrawBranch(Itms[i]);
	}
}
function DrawBranch(name) {
	var trunk = LocateSubTrunk(name);
	var linklist = name.slice(trunk.id.length-PrefixLength).split(/:/);
	var mark = '';
	if(ChannelTree[name] && ChannelTree[name].hasnew) {
		mark = '!';
		Mark(trunk);
	}
	for (var i = 0; i < linklist.length; i++) {
		var link = linklist[i];
		var fulllink = trunk.id+':'+link;
		var linkname = fulllink.slice(PrefixLength+1);

		var d = document.createElement('div');
		d.className  = 'comm_box';

		if (i < linklist.length - 1) { // Not a leaf
			var t = document.createElement('div');
			t.id = 't_'+fulllink;
			t.className  = 'comm_box';
			trunk.appendChild(t);
			ChannelTree[linkname] = {id:0,hasnew:ChannelTree[name].hasnew};
			t.innerHTML='<table cellpadding="0" cellspacing="0" border="0"><tr><td valign="center"><span id="channel_marker_'+linkname+'">'+mark+'</span></td><td valign="center"><a><img alt="" width="15" height="18" border="0"></a></td><td valign="center"><a>'+link+'</a></td></tr></table>';
			t.getElementsByTagName('a')[0].href = "javascript:ExpandNewsItem('"+linkname+"')";
			t.getElementsByTagName('a')[1].href = "javascript:ExpandNewsItem('"+linkname+"')";
			var im = t.getElementsByTagName('img')[0];
			im.src = StaticSiteName+"/img/expand.gif";
			im.id = 'msg_expander_'+linkname;

			d.id = 'news_body_row_'+linkname;
			d.style.display='none';
			d.style.paddingLeft='5px';
			trunk.appendChild(d);
			trunk = document.createElement('div');
			trunk.className  = 'comm_trunc';
			trunk.id = fulllink;
			d.appendChild(trunk);
		} else {
			d.id = linkname;
			trunk.appendChild(d);
			d.setAttribute((document.all ? 'className' : 'class'), "comm_chanell");
			d.style.overflow="visible";
			if(ChannelTree[linkname]){
				d.innerHTML='<span id="channel_marker_'+linkname+'">'+mark+'</span><a id="box_'+ChannelTree[linkname].id+'" href="javascript:parent.SwitchChannel('+ChannelTree[linkname].id+')" onclick="CommTreeClick('+"'_"+ChannelTree[linkname].id+"'"+')" class="comm_unsel">'+link+'</a>';
			}
		}
	}
}
function LocateSubTrunk(name) {
	var sub = document.getElementById(Prefix+':'+name);
	if (sub)
		return sub;
	var colon = name.lastIndexOf(':');
	return colon == -1
		? document.getElementById(Prefix)
		: LocateSubTrunk(name.substring(0,colon))
}

function Mark (trunk) {
	var name = trunk.id.slice(PrefixLength+1);
	if (name=='' || (ChannelTree[name] && ChannelTree[name].hasnew))
		return;
	ChannelTree[name].hasnew = 1;
	document.getElementById('t_'+trunk.id).getElementsByTagName('span').innerHTML='!';
	Mark(LocateSubTrunk(name))
}

