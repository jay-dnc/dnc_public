my $FleetPrefix="Explorer";
my $left=000;
my $right=000;
my $top=000;
my $bottom=000;
my $PreventExploreEnemy = 1;
my $ManageStuckFleets = 1; # Отправлять ли "застрявшие" флоты на планеты, откуда можно будет прыгнуть?


my $ScanCost = int(80*(1+$Empire->getProp('bonus_price')/100)+0.5);

my @ProbeClassID;
my @distcache;
my ($TotalDist, $CachedDist) = (1, 0);	# statistics for GetDist


{# Time block
	my $totTimeout = 140;	# Timeout
	sub m_time;
	my $starttime = m_time;
	sub m_time {
		my ($s, $m, $h) = localtime;
		return $s + 60*($m + ($h * 60)) - $starttime;
	}
	sub Timeout { m_time > $totTimeout }
}
{
#	my $id = $Empire->this_fleet->getProp('id');
	my $id = 0;
	$Empire->message($Empire->readVariable("Message$id"));
	my (@Log, @ExtLog);
	sub Tag {
		$Empire->writeVariable("Tag$id", $_) and $Empire->tag($_) if $_ = shift;
		$Empire->tag
	}
	sub Msg {
		$_ = shift;
		$Empire->writeVariable("Message$id", $_) and $Empire->message($_)
	}
	sub Quit {
		if (@ExtLog) {
			my $logstring = join "\n", map {join "\t", @$_} @ExtLog;
			$Empire->writeVariable("LogFrom$id", $logstring);
			LogINFO("Журнал разведки сохранен.");
		} else {
			$Empire->writeVariable("LogFrom$id", undef);
		}
		$Empire->clearLog;
		$Empire->log(@$_) for @Log;
		$Empire->ok;
	}
	sub Log { push @Log, [@_] }
	sub LogOK { push @Log, [ 0, shift ] }
	sub LogINFO { push @Log, [ 1, shift ] }
	sub LogWARN { push @Log, [ 2, shift ] }
	sub LogEXT { push @ExtLog, [ @_ ] }
}


$Empire->fake(0);
for ($Empire->designHouse->getPrototypes) {
	next unless map {$_ == 1 or next} $_->getProp('buildingactions');
	push @ProbeClassID, $_->getProp('building_id');
}


my @Jumpable = map {[$_->getProp('x'), $_->getProp('y')]} $Empire->planets->getAllJumpable;


my %ReadyFleets;
my $numFleet = 0;
my %rt;
my $ScanRequestCount;
LogOK('Searching fleets to perform explore...');
for my $Fleet ($Empire->fleets->getFleetsByName($FleetPrefix.'%')) {
	$numFleet++;
	my ($FleetName, $FleetID) = map {$Fleet->getProp($_)} qw(name id);
	my ($x, $y) = map {$Fleet->getProp($_)} qw(x y);
	my $dest = $Empire->readVariable("RouteFor$FleetID") || "$x:$y";
	$rt{$dest} = 1;
	next if $Fleet->getProp('turns_till_arrival');
	my $Probe = GetProbe($Fleet) or next;
	my $Planet = $Empire->planets->get($x, $y);
	my ($owner, $my, $s, $jmp, $sizeType) = map {$Planet->getProp($_)}
			 qw(owner_id my s jumpable img_surface);
	if ($Fleet->getProp('name')=~/stopped/i) {
		next unless $owner;
		LogEXT(
		$my	? (0, "Planet $x:$y is colonized. Fleet '$FleetName' [$FleetID] ".
				"is sent back to work.")
			: (2, "Planet $x:$y is overtaken by someone else! Fleet ".
				"'$FleetName' [$FleetID] is sent back to work.")
		);
		$FleetName=~s/ \(stopped\)//;
		$Fleet->Rename($FleetName, $Fleet->getProp("ext_name"));
		$ReadyFleets{$FleetID} = $Fleet->getProp('fly_range');
		next;
	}
	if ($dest ne "$x:$y") {
		if ($ManageStuckFleets && $s && !$jmp) {
			$Fleet->jump(($nx, $ny) = GetNearestJumpable($x, $y));
			LogWARN("Fleet '$FleetName' [$FleetID] is stuck on $x:$y.".
				" Redirecting to $nx:$ny.");
		}
		next;
	}
	unless ($s) {
		if ($Probe->performAction(1)) {
			LogINFO("Fleet '$FleetName' [$FleetID] explores $x:$y");
			$Planet = $Empire->planets->get($x, $y);
			$s = $Planet->getProp('s');
			$ScanRequestCount++;
		} else {
			my $SR; # Scan Requested
			for (@{$Probe->getActions}) {
				$SR = ($$_{action}==1 && $$_{request_id}) and last;
			}
			$SR	? LogINFO("Fleet '$FleetName' [$FleetID] is researching $x:$y already ".
					"(size=".	SizeDesc($sizeType).")")
				: LogWARN("Error researching $x:$y with '$FleetName' ".
					"[$FleetID] (not enough credits?)")
		}
	}
	if ($s) {
		unless ($jmp) {
			LogINFO("Fleet '$FleetName' [$FleetID] has finished exploring $x:$y");
			my $data = join("#",
					$x, $y, map {$Planet->getProp($_)}
					qw(name owner_name o e m t s)
				);
			LogINFO($data);
			LogEXT(1, $data);
		}
		if (GoodPlanet($x, $y)) {
			$Fleet->Rename("$FleetName (stopped)", $Fleet->getProp('ext_name'));
			LogINFO("Planet $x:$y is suitable for colony. Fleet ".
			"'$FleetName' [$FleetID] is stopped.");
			LogEXT(1, "Планета $x:$y подходит для колонизации.\t1");
		} else {
			$ReadyFleets{$FleetID} = $Fleet->getProp('fly_range');
		}
	}
}
$Empire->writeVariable("SurveyExpenses", $Empire->readVariable("SurveyExpenses") +
				$ScanRequestCount*$ScanCost);
LogINFO(m_time.": Fleets processed. ".($ScanRequestCount*$ScanCost)." credits spent.");


unless (scalar keys %ReadyFleets) {
	Msg("Все подчиненные флоты находятся в полете");
	return Quit;
}


# Составление списков планет для исследования и патрулирования
my @JumpablePlanets;
my %PlanetsForResearch;


my @toResearch;
for my $Planet ($Empire->planets->getRectangle($left, $top, $right, $bottom)) {
	my ($x, $y, $s, $jmp, $sizeType, $owner) = map {$Planet->getProp($_)}
			 qw(x y s jumpable img_surface owner_id);
	my $CoordPair = "$x:$y";
	push @JumpablePlanets, $CoordPair and next if $jmp;
	next if $s || $rt{$CoordPair};
	if ($PreventExploreEnemy && $owner) {
		next if $Empire->dipRelation($owner) eq '0'
	}
	$PlanetsForResearch{$CoordPair} = $sizeType;
	push @{$toResearch[$sizeType]}, $CoordPair;
}
LogINFO(m_time.": Planets: finished step 1");


my ($planetsToLeave, $minSize);
my @PlanetsForResearch;
for (reverse 0..9) {
	push @PlanetsForResearch, @{$toResearch[$_]};
	last if scalar @PlanetsForResearch > keys %ReadyFleets;
}


LogINFO(m_time.": Planets: finished step 2");
LogINFO((scalar @PlanetsForResearch)." planets. ".(scalar keys %ReadyFleets)." fleets.");


# Оптимальная рассылка зондов на исследование и патрулирование
my $SentFleet = 0;
my %nearest;
LogOK('Sending fleets to explore new worlds...');
PlanetCycle:
for my $FleetID (sort{$ReadyFleets{$a}<=>$ReadyFleets{$b}} keys %ReadyFleets) {
	my $Fleet = $Empire->fleets->getFleetByID($FleetID);
	my $range = $ReadyFleets{$FleetID};
	my ($FleetName, $x, $y) = map {$Fleet->getProp($_)} qw(name x y);
	my $bestDist = 10000;
	my ($bestX, $bestY, $priority);
	my $plnum;
	for (@PlanetsForResearch) {
		$plnum++;
		LogEXT(2, "Timeout") and last PlanetCycle if Timeout;
		next unless defined $PlanetsForResearch{$_};
		my ($dx, $dy) = split /:/;
		next if ($x == $dx)&&($y == $dy);
		my $dist = GetDist($x - $dx, $y - $dy);
		next if $dist >= $bestDist;
		my $newrange;
		unless ($nearest{$_}) {
			(my $x, my $y, $newrange) = GetNearestJumpable($dx, $dy);
			$nearest{$_} = [$x, $y];
		} else {
			$newrange = GetDist($x - $nearest{$_}->[0], $y - $nearest{$_}->[1])
		}
		next if $range < $newrange;
		$priority||=$PlanetsForResearch{$_};
		last if $priority!=$PlanetsForResearch{$_};
		($bestDist, $bestX, $bestY) = ($dist, $dx, $dy);
	}
	if ($bestDist < 10000) {
		my $sizeType = $PlanetsForResearch{"$bestX:$bestY"};
		delete($PlanetsForResearch{"$bestX:$bestY"});
		splice(@PlanetsForResearch, $plnum - 1, 1);
		$Empire->writeVariable("RouteFor$FleetID", "$bestX:$bestY");
		LogINFO("Fleet '$FleetName' [$FleetID] from $x:$y".
			" is being sent to unexplored planet $bestX:$bestY, size=".
			SizeDesc($sizeType).", direct distance=".sprintf("%.2f",$bestDist));
		$SentFleet++;
	} else {
		LogWARN("Error sending fleet!");
	}
	LogINFO(m_time.": fleet $FleetName processed");
}


for my $i (@distcache) {
	$CachedDist+=defined for (@$i);
}


LogINFO("Всего расстояний $TotalDist.".
	" Вычислено расстояний $CachedDist.".
	" Эффективность кэширования: ".(int 100*(1 - $CachedDist/$TotalDist))."%.");
LogINFO("Вычислено ".(scalar keys %nearest)." ближайших планет.");


LogINFO("Process took ~".m_time()." seconds.");
Msg("Флотов отправлено: $SentFleet из ".(scalar keys %ReadyFleets));
return Quit;
sub SizeDesc { (10*$_[0]).'..'.(10*$_[0]+9) }
sub GoodPlanet {
	my $planet = $Empire->planets->get(@_);
	return if $planet->getProp('owner_id');
	return if $planet->getProp('popgrowth') < 1.2;
	return $planet->getProp('s') > 85;
}
sub GetDist {
	$TotalDist++;
	my ($x, $y) = sort map {$_>1000 ? 2000-$_ : $_} map abs, @_;
	return $distcache[$x][$y] ||= sqrt($x*$x + $y*$y);
}
sub GetProbe {
	my $Fleet = shift;
	($probe) = $Fleet->getUnitsByClass($_) and return $probe for (@ProbeClassID);
	return undef;
}
sub GetNearestJumpable {
	my ($x, $y) = @_;
	my ($bestDist, $nx, $ny) = (10000, 0, 0);
	for (@Jumpable) {
		my ($tx, $ty) = @$_;
		my $dist = GetDist($x - $tx, $y - $ty);
		($bestDist, $nx, $ny) = ($dist, $tx, $ty) if $dist < $bestDist
	}
	return ($nx, $ny, $bestDist);
}
