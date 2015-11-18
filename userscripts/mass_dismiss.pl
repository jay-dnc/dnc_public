my $HarrisonsToCleanup='%planet%';
my $FleetToCleanup='%fleetname%';
my $UnitToClean = '%unit%';

$Empire->fake(0);
$Empire->clearLog();

if($UnitToClean==-1){
	$Empire->log(3,"[style=color:red]Ошибка: нечего удалять! Проверьте настройки[/style]");
	return;
}

my $Deads=0;

my %OutPlanets;
my @Planets;
if ($HarrisonsToCleanup eq 'all'){
	@Planets=$Empire->planets()->getAllMy();
} elsif ($HarrisonsToCleanup=~/^(\d+):(\d+)$/){
	push @Planets,$Empire->planets()->get($1,$2);
}
for(@Planets){
	my $x=$_->getProp('x');
	my $y=$_->getProp('y');
	my @UnitsToDie;
	if ($UnitToClean eq 'all'){
		@UnitsToDie=$Empire->harrison($x,$y)->getAllUnits();
	}else{
		@UnitsToDie=$Empire->harrison($x,$y)->getUnitsByClass($UnitToClean);
	}
	for(@UnitsToDie){
		$_->disband();
		$OutPlanets{"$x:$y"}++;
		$Deads++;
	}
}

my %OutFleets;
my @Fleets=grep($_->getProp('turns_till_arrival')==0 && $_->getProp('hidden')==0,
	$Empire->fleets()->getFleetsByName($FleetToCleanup)) if $FleetToCleanup ne '';
$Empire->log(0,"\n");
for my $Fleet (@Fleets){
	my @UnitsToDie;
	if ($UnitToClean eq 'all'){
	# Kill transportables first
		@UnitsToDie=sort {$b->getProp('is_transportable') <=> $a->getProp('is_transportable')} $Fleet->getAllUnits();
	}else{
		@UnitsToDie=$Fleet->getUnitsByClass($UnitToClean);
	}
	
	for(@UnitsToDie){
		$_->disband();
		$OutFleets{$Fleet->getProp('name')}++;
		$Deads++;
	}
	$Empire->log(0,"\n");
}

$Empire->log(1,"Всего распущено юнитов: $Deads\n");

if (keys %OutPlanets){
	$Empire->log(0,"[spoiler=Было распущено в гарнизонах][table]\n| [b]Планета[/b]\n| [b]Распущено юнитов[/b]");
	for (keys(%OutPlanets)){
		$Empire->log(0,"\n|-\n| [planet=$_]\n| $OutPlanets{$_}");
	}
	$Empire->log(0,"\n[/table][/spoiler]");
}
if (keys %OutFleets){
	$Empire->log(0,"[spoiler=Было распущено во флотах][table]\n| [b]Имя флота[/b]\n| [b]Распущено юнитов[/b]");
	for (keys(%OutFleets)){
		$Empire->log(0,"\n|-\n| $_\n| $OutFleets{$_}");
	}
	$Empire->log(0,"\n[/table][/spoiler]");
}
