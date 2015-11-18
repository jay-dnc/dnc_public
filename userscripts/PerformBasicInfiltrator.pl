# Taken from http://dc.omskreg.ru/doku.php?id=dc:scripts:clean, author unknown

my $fleet_name = "Infiltrator%";

$Empire->fake(0);
for $fl ($Empire->fleets()->getFleetsByName($fleet_name)){
	my $pl = $Empire->planets()->get($fl->getProp('x'),$fl->getProp('y'));
	my $owner_id = $pl->getProp('owner_id');

	next if($owner_id==$Empire->getProp('player_id'));
	next if($owner_id==0 || !defined($Empire->dipRelation($owner_id)) || $Empire->dipRelation($owner_id));

	for $un ($fl->getAllUnits()) {
		$un->performAction(101);
		$un->performAction(105);
	}
}
$Empire->clearLog();
