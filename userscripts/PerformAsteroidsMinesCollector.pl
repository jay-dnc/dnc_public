$Empire->fake(0);
my $WorkerPrefix = "Worker:Asteroid";	#These are labourers
my $GatherPrefix = "Static:Public";		#These are gatherers

%ResNames = (m => 'Minerals', o => 'Organics', e => 'Energy');
my $food = $Empire->getProp('race_nature');
my $Size = 2000;

my %Unpacked;
{
	my $ClearLog = 1;
	my @Log;
	sub Log { push @Log, $#_ ? [@_[0,1]] : [1, $_[0]] }
	sub Quit {
		$Empire->clearLog if $ClearLog && $Empire->ok;
		$Empire->log(@$_) for @Log;
		my $unp = join ', ', map "$Unpacked{$_} $ResNames{$_}", keys %Unpacked;
		$Empire->log(0, "Unpacked: ".($unp || "nothing"));
		return $Empire->ok;
	}
	my %DistCache;
	sub min { $_[$_[0]>$_[1]] }
	sub GetDist {
		my ($x1,$y1,$x2,$y2) = map {split /:/} @_;
		my ($dx,$dy) = sort map min(abs, $Size - abs), $x1-$x2, $y1-$y2;
		$DistCache{$dx}{$dy} ||= sqrt($dx*$dx + $dy*$dy);
	}
}

local $SIG{__DIE__} = sub {$Empire->log(3, "Died!"); $Empire->ok(0); Quit};
sub Unpack {
	my $res = shift;
	$res->transferToAnotherFleet(0);
	$res->getProp('tag')=~/res="(.)" amount="(\d+)"/;
	$Unpacked{$1}+=$2;
	$res->unpack unless $1 eq $food;
}


# Search for stasis to gather.
my %ToCollect;
my %StasisHere;
for my $collector ($Empire->fleets->getFleetsByName("$GatherPrefix%")) {
	my @cont = $collector->getUnitsByClass(23) or next;
	my ($x, $y) = map $collector->getProp($_), qw(x y);
	my $xy = "$x:$y";
	$ToCollect{$xy} ||= [];
	for (@cont) {
		$_->getProp('tag')=~/res="(.)".*?amount="(\d+)"/;
		push @{$ToCollect{$xy}}, {
			id => $_->getProp('id'),
			res => $ResNames{$1},
			amt => $2,
			me => $_,
			xy => $xy
		};
		Log(1, "$2 $ResNames{$1} at $xy");
	}
	$StasisHere{$xy}++
}

my %IsMyPlanet;
$IsMyPlanet{$_->getProp('x').":".$_->getProp('y')} = 1 for $Empire->planets->getAllMy;


# Now search for workers
my %IsProcessed;
my @FreeWorkers;
for my $fl ($Empire->fleets->getFleetsByName("$WorkerPrefix%")) {
	my ($x, $y, $id, $tta) = map $fl->getProp($_), qw(x y id turns_till_arrival);
	my $xy = "$x:$y";
	$IsProcessed{$xy} = 1;
	next if $tta; #This one is flying
	if (my @un = $fl->getUnitsByClass(23)) {
		if ($IsMyPlanet{$xy}) {
			Unpack($_) for @un;
			$Empire->writeVariable("RouteFor$id", undef);
			$Empire->writeVariable("PathFor$id", undef);
		} else {
			my $pl = $Empire->planets->getNearestMy($x,$y);
			$Empire->writeVariable("RouteFor$id", join ':', map $pl->getProp($_), qw(x y));
			$Empire->writeVariable("PathFor$id", undef);
			next;
		}
	} elsif ($StasisHere{$xy} && @{$ToCollect{$xy}}) {
		# Log(1, "Going to collect stasi at $xy");
		my ($handle) = sort {$b->{amt} <=> $a->{amt}} @{$ToCollect{$xy}};
		$Empire->log(1, "Stasi is chosen..");
		for (0..$#{$ToCollect{$xy}}) {
			if ($ToCollect{$xy}->[$_]->{id} == $handle->{id}) {
				$Empire->log(1, "Stasi is found at position $_");
				splice @{$ToCollect{$xy}}, $_, 1;
				last;
			}
		}
		$handle->{me}->transferToAnotherFleet($id);
		my $pl = $Empire->planets->getNearestMy($x,$y);
		Log(1, "Sending $handle->{amt} $handle->{res} to ".$pl->getProp('name'));
		$Empire->writeVariable("RouteFor$id", join ':', map $pl->getProp($_), qw(x y));
		$Empire->writeVariable("PathFor$id", undef);
		next;
	}
	if (my $Route = $Empire->readVariable("RouteFor$id")) { # Is it already routed somewhere?
		$IsProcessed{$Route} = 1;
		next;
	}
	push @FreeWorkers, $fl;
}

# Now we have only free workers in @FreeWorkers.

@FreeWorkers or (Log(1, "No workers") and return Quit);
Log(1, scalar(@FreeWorkers)." free workers.");
Log(1, join '>', keys %ToCollect);
my @SortedTargets = map $_->{xy},
		sort {$b->{amt} <=> $a->{amt}}
		map @{$ToCollect{$_}},
			keys %ToCollect;
Log(1, join '>', @SortedTargets);
for my $target (@SortedTargets) {
	my ($x, $y) = split /:/, $target;
	my ($time, $closest, $num) = (20);
	for (0..$#FreeWorkers) {
		my ($spd,$wx,$wy) = map $FreeWorkers[$_]->getProp($_), qw(fly_speed x y);
		my $time2 = GetDist($wx,$wy,$x,$y)/$spd;
		($time, $closest, $num) = ($time2, $FreeWorkers[$_], $_) if $time > $time2;
	}
	next unless $closest;
	Log(1, "Sending worker to $x:$y");
	$Empire->writeVariable("RouteFor".$closest->getProp('id'), $target);
	$Empire->writeVariable("PathFor".$closest->getProp('id'), undef);
	splice @FreeWorkers, $num, 1
}
return Quit;
