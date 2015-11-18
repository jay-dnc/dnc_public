my $FleetName='%fleetname%';
my $ShareMode='%access_mode%';
my $Players='%players%';

$Empire->fake(0);
$Empire->clearLog();

my $Fleets=$Empire->fleets;
if($Fleets){
	my $FleetsN=0;
	my @Out;
	for my $Fleet ($Fleets->getFleetsByName($FleetName)){
		my ($Name, $X, $Y) = map {$Fleet->getProp($_)} qw(name x y);
		$Fleet->Share($Players,$ShareMode);
		push @Out,qq{| $Name\n| [planet=$X:$Y]\n| }.($ShareMode == -1?'Unshared':'Shared');
		$FleetsN++;
	}
	$Empire->log(0,"$FleetsN флотов расшарено для: [player]".join('[/player], [player]',split(/\s*[,;]\s*/,$Players))."[/player]\n");
	$Empire->log(0,"[spoiler=Details][table]\n| [b]Флот[/b]\n| [b]Планета[/b]\n| [b]Статус[/b]\n|-\n".join("\n|-\n",@Out)."\n[/table][/spoiler]");
}else{ $Empire->ok(0); }
