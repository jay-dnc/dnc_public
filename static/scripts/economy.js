var HiddenUnits={};

function ExpandCompoundSpoiler(ItemId){
    var Tbl=document.getElementById('economy_list');
    if(Tbl){
        var HImage=document.getElementById('msg_expander_'+ItemId),show=HImage.src.match(/expand.gif/);
        if(show){
            HImage.src=HImage.src.replace('expand', 'collapse');
            var Splace=document.getElementById('spoiler_place_'+ItemId),spplace=Splace.rowIndex,units=HiddenUnits[ItemId],i=0;
            Tbl.deleteRow(spplace);
            while(i<units.length){
                var unit=units[i++],newr=Tbl.insertRow(spplace++);
//				newr.setAttribute('name','expand_part_'+ItemId);
                newr.id='expand_part_'+ItemId;
                var c=newr.insertCell(-1);
                if(i>1){
                    if(i+1==units.length){
                        c.align='right';
                        c.innerHTML='<a href="javascript:ExpandCompoundSpoiler('+ItemId+')">'+
                            '<img src="'+StaticSiteName+'/img/collupse.gif" alt="" width="15" height="18" border="0" hspace="0" vspace="0"/>'+
                            '</a>';
                        c.valign='bottom';
                    }
                    c=newr.insertCell(-1);
                }
                if(unit.box){
                    c.align='center';
                    c.innerHTML='<img src="'+StaticSiteName+
                        '/img/buildings/23_u.gif" alt="'+FIsPacked+'" title="'+FIsPacked+'" width="20" height="20" border="0"/>';
                }else c.innerHTML='&#160;';
//				c=newr.insertCell(-1);//<!--td width="1"><input name="cb{../@class-id}_unit" type="checkbox" value="{@id}{$instasis}" class="checkbox"/></td-->
                c=newr.insertCell(-1);
                if(unit.res){
                    c.width='20%';
                    newr.insertCell(-1).innerHTML='<small>&#160;'+unit.res.n+'<span class="'+unit.res.style+'">'+unit.res.un+'</span></small>';
                }else{
                    c.width='60%';
                    c.colSpan='2';
                }
                c.innerHTML=unit.x ? '<a title="'+FPlanetHint+'" href="/planet/?planetid='+unit.x+':'+unit.y+'">'+unit.planet+'</a>' : unit.planet;
                c=newr.insertCell(-1);
                if(unit.fleet){
                    c.align='left';
                    c.innerHTML='<a onclick="javascript:SetFleetInfoHint('+unit.fleet_id+',this)" title="'+FFleetInitDescr+'" alt="'+FFleetInitDescr+'">'+unit.fleet+'</a>';
                }else c.innerHTML='&#160;';
            }
        }else{
            HImage.src=HImage.src.replace('collapse', 'expand');
            var spplace=0,unit;
            while((unit=document.getElementById('expand_part_'+ItemId))){
                var ri=unit.rowIndex;
                if(spplace==0 || spplace>ri) spplace=ri;
                Tbl.deleteRow(ri);
            }
            if(spplace){
                /*			var units=document.getElementsByName('expand_part_'+ItemId),spplace=0;
                 if(units){
                 var i=units.length;
                 while(i>0){
                 var ri=units[--i].rowIndex;
                 if(spplace==0 || spplace>ri) spplace=ri;
                 Tbl.deleteRow(ri);
                 }*/
                var newr=Tbl.insertRow(spplace);
                newr.id='spoiler_place_'+ItemId;
                newr.insertCell(-1);
                var c=newr.insertCell(-1);
                c.innerHTML='<a href="javascript:ExpandCompoundSpoiler('+ItemId+')">...</a>';
            }
        }
    }
    if (window.jQuery) $(Tbl).closest('.scroll-pane-large').jScrollPane({
        addToWidth: 59
    });
}

var FleetInfo={};

function SetFleetInfoHint(FleetId,Ctrl){
    if(Ctrl){
        var TdCtrl=Ctrl.parentNode;
        TdCtrl.innerHTML=Ctrl.innerHTML;
        Ctrl=TdCtrl;
    }
    var fil_name='fleet_info_loader_'+FleetId,fiw_name='fleet_info_waiter_'+FleetId,
        loader=document.getElementById(fil_name);
    if(FleetInfo[FleetId]){
        if(loader) window.document.body.removeChild(loader);
        if(Ctrl) Ctrl.title=FleetInfo[FleetId];
        var recs=document.getElementsByName(fiw_name);
        for(var i=0;i<recs.length;i++){
            recs[i].title=FleetInfo[FleetId];
            recs[i].removeAttribute('name');
        }
    }else{
        if(Ctrl){
            Ctrl.setAttribute('name',fiw_name);
            Ctrl.title='loading...';
        }
        if(!loader){
            var loader=document.createElement('iframe');
            loader.id=fil_name;
            loader.frameBorder=0;
            loader.width=0;
            loader.height=0;
            loader.src='/frames/economyunits/on/235169/?fleet='+FleetId;
            window.document.body.appendChild(loader);
        }
    }
}

