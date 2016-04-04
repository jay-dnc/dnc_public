var last_col = 'name';
var last_sort = 'asc';

function onEconomReportLoad() {
	//	default sort (from cookies?)
	for(var index in Planets) {
		var planet_inf = Planets[index];
		var id = 'row_' + planet_inf.x + ':' + planet_inf.y;
		planet_inf.planet_html = document.getElementById(id);
	}
	
	ecReportSort('name');
}

function buildEconomicTable() {
	var canvas = document.getElementById('canvas');
	while (canvas.firstChild) {
		canvas.removeChild(canvas.firstChild);
	}

	for(var index in Planets) {
		var planet_inf = Planets[index];
		canvas.appendChild(planet_inf.planet_html);
	}
}

function ecReportSort(col) {
	if(col == last_col && last_sort == 'desc')
		last_sort = 'asc';
	else
		last_sort = 'desc';
	
	last_col = col;
	
	Planets = Planets.sort(
		function(a, b) {
			if(last_sort == 'desc') {
				var t = a;
				a = b;
				b = t;
			}
			
			//	actions (special buildings)
			var arr = col.match(/action_(\d+)/)
			if(arr) {
				var search_id = arr[1];
				var found_a = false;
				var found_b = false;
				for(var index in a.actions)
				{
					var act = a.actions[index];
					if(act.id == search_id) {
						found_a = true;
						break;
					}
				}
				for(var index in b.actions) {
					var act = b.actions[index];
					if(act.id == search_id) {
						found_b = true;
						break;
					}
				}
				return (found_a == found_b) ? 0 : (found_a ? 1 : -1);
			}
			
			switch(col)
			{
				case 'x':
					return a.x - b.x ? a.x - b.x : a.y - b.y;
			
				case 'y':
					return a.y - b.y ? a.y - b.y : a.x - b.x;
								
				case 'sharing':
					return b.hidden - a.hidden ? b.hidden - a.hidden : a.shared.length - b.shared.length;
			
				case 'name':
					return b.name.localeCompare(a.name);
			
				case 'owner_name':
					if(! b.owner_name)
						return bool(a.owner_name);
					if(! a.owner_name)
						return -1 * bool(b.owner_name);
					return b.owner_name.localeCompare(a.owner_name);

				case 'building_in_progress':
					if(bool(a.queue.total_count) - bool(b.queue.total_count))
						return bool(a.queue.total_count) - bool(b.queue.total_count);

					if(bool(a.queue.requre_spec) - bool(b.queue.requre_spec))
						return bool(a.queue.requre_spec) - bool(b.queue.requre_spec);

					if(b.queue.total_count && a.queue.total_count)
						return b.queue.first_building.turns_left - a.queue.first_building.turns_left;
					
					return 0;
				
				case 'mh':
					if(bool(a.queue.total_count) - bool(b.queue.total_count))
						return bool(a.queue.total_count) - bool(b.queue.total_count);

					if(a.queue.requre_spec - b.queue.requre_spec)
						return a.queue.requre_spec - b.queue.requre_spec;

					if(b.queue.total_count && a.queue.total_count)
						return a.queue.first_building.building_points_done - b.queue.first_building.building_points_done;
					
					return 0;
			
				case 'spec':
					return a.specialist.length - b.specialist.length;
				
				default:
					return a[col] - b[col];		//	numerical comparation
			}
		}
	);
	
	buildEconomicTable();
}

function ExpandPlanetShares(type, id) {
	if(document.getElementById('pl_' + type + id).style.display == 'none') {
		//	hide other list
		if(document.getElementById('pl_' + (type == 'fl' ? 'dr' : 'fl') + id)) {
			document.getElementById('pl_' + (type == 'fl' ? 'dr' : 'fl') + id).style.display = 'none';
			document.getElementById('shares_expander_' + (type == 'fl' ? 'dr' : 'fl') + id).src = StaticSiteName + "/img/expand.gif";
		}

		document.getElementById('pl_' + type + id).style.display = "block";
		document.getElementById('shares_expander_' + type + id).src = StaticSiteName + "/img/collapse.gif";
	}
	else {
		document.getElementById('pl_' + type + id).style.display = 'none';
		document.getElementById('shares_expander_' + type + id).src = StaticSiteName + "/img/expand.gif";
	}
}

function bool(val) {
	return val ? 1 : 0;
}
