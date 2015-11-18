my $DX = '%x%';
my $DY = '%y%';
my $fleet_name = '%fleetname%';


my $Destination="$DX:$DY";

$Empire->fake(0);
my @Log;
for my $Fleet ($Empire->fleets->getFleetsByName($fleet_name)) {
  my ($id,$x,$y,$Name,$Range)=map {$Fleet->getProp($_)} qw(id x y name fly_range);
  next unless $Range;
	$Empire->writeVariable("RouteFor$id", $Destination);
  my $Distance=sqrt(($x-$DX)*($x-$DX)+($y-$DY)*($y-$DY));
  push @Log,"$Name ($Range): [planet=$x:$y]->[planet=$Destination] (distance ".(sprintf('%.1f',$Distance)).($Range?'/ ~'.sprintf('%.0f',$Distance/$Range+1)." hups":'').")".($Range>20?"[style=color:red]Дальность флота $Range, возможны ошибки[/style]":'');
}

$Empire->clearLog();
for (@Log){
  $Empire->log(0,"$_\n");
}
