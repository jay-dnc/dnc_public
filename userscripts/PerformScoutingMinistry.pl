# PerformScoutingMinistry v 1.14 script, by GribUser & Aragaer
# 25.06.2006
# Based on Наукоград/IQ script "Штаб разведки NG02.02.17 (c) Наукоград"
# + патч для звезд и пустот от JlblC
# можно в ручном режиме выпрыгнуть при зависании там см. строку 223

# ========== RUS ===============================================================
# Умный скрипт, позволяющий автоматизировать разведку ресурсов в секторе.
# Умеет все, начиная от постройки зондов и заканчивая избеганием вражеских
# планет. Наврят вы сами сможете провести разведку лучше, чем этот скрипт.
# Подробно узнать о возможностях можно прочитав описание настроек ниже

# ========== ENG ===============================================================
# Dedicated script to automate planets exploration. Smart beyond all reason.
# Can build probes, choose optimal probe-planet pairs, avoids enemy worlds and
# so on. See description for settings to understand it's features better.



#===============================================================================
# Вот это нужно менять, здесь все настройки. Тут же и описание возможностей
# Here is what you are going to read and edit - script settings and description.



# Строить ли новые зонды на планетах? Если $AutoProduceProbes=1 и на планете
# очередь построек закончится через один ход, в очередь добавляется зонд
my $AutoProduceProbes=1;
# To build or not to build probes? With $AutoProduceProbes=1 script will
# search for a planets with one-turn-ending building queue and build
# probes there.



# Можно строить зонды не на всех планетах, а только на планетах с определенным
# именем. Например, $ProduceProbesOnlyWhereNameIs='Zon' ограничит строительство
# зондов планетами, чье имя начинается на 'Zon' - 'Zona', 'Zond factory' и т.п.
my $ProduceProbesOnlyWhereNameIs="";
# New probes will only be ordered on the planets with cpecific names. If you set
# $ProduceProbesOnlyWhereNameIs='Zon' probes will be ordered on 'Zona' and
# 'Zond factory', but not on 'My lovely home' planet.



# Если $AutoProbesToFleet=1, то все зонды из гарнизонов будут перенесены во
# флоты с именем $FleetPrefix (см. ниже) и приступят к разведке.
my $AutoProbesToFleet=1;
# If $AutoProbesToFleet=1 garrisons are searched for probes and all the
# probes found are transferred to new fleets and start exploring



# Можно ограничить изъятие зондов из флотов только планетами с определенными
# именами.
my $ProbesToFleetOnlyWhereNameIs="";
# Only take probes from garrisons on the planets with specified names



# Отбирать для разведки этим скрипом флоты с определенным именем. Полезно, если
# у вас несколько независимых разведывательных скриптов этого типа, если часть
# зондов несут караульную службу или если часть разведопераций вы хотите проводить
# вручную. $FleetPrefix='Explorer' отберет флоты 'Explorer' и 'Explorer-01', но
# не 'GoExplore'. Если $FleetPrefix='', то к разведке привлекаются все флоты,
# в которых обнаружены зонды
my $FleetPrefix="Explorer";
# This script can use ALL your fleets with probes or choose only those, which
# name starts with $FleetPrefix. This is useful if you run several scripts like
# this, or have some probes in a patrol or want to make some exploration
# manually. $FleetPrefix='' means script will send all your probes to work.



# Минимальный размер планет, которые вы хотите исследовать. 0 - исследовать все.
# Независимо от этого значения, в первую очередь исследуются самые крупные планеты.
my $MinSizeExplore=10;
# Minimal size of the planets to explore. 0 means explore all. In any case
# bigger planets are researched first



# Не летать на известные вражеские планеты. Позволяет избегать только закрытых
# для вас планет, на открытые зонды могут залететь как на базу для прыжка (баг)
my $PreventExploreEnemy=1;
# Do not try to explore enemy planets. In fact a probe can still visit an enemy
# planet if the planet is open for you and a probe decides to use it as a
# jump base (bug)



# Если указан радиус, то флот, которому назначен скрипт, принимается за центр
# круга и зонды исследуют все планеты в указанном радиусе. Чем-то похоже на
# пчелиный рой вокруг матки :), можно неторопясь двигать матку и тем перемещать
# весь рой. Если радиус равен нулю, то исследуется заданный сектор (см. ниже)
my $radius=0;
# If $radius > 0 the fleet with this script attached is used as a center of
# circle. All the planets in the circle with radius $radius will be explored.
# Moving the fleet you will move the whole system. If $radius=0 script will
# explore area described above.



# Если $radius=0, приведенные ниже параметры описывают четырехугольник,
# в котором ведется исследование. Верхний-левый угол $left:$top, нижний-правый
# угол $right:$bottom. Если $radius>0 эти параметры игнорируются.
my $left=000;
my $right=000;
my $top=000;
my $bottom=000;
# If $radius=0 this variables describe the area the script will explore. If
# $radius > 0, this variables are ignored


# Если $ProbeClassID задан, именно этот тип юнитов министерство будет
# производить на простаивающих планетах (см. $AutoProduceProbes выше)
my $ProbeClassID=000;
# Units of the type $ProbeClassID (if set) will be build on idle planets
# (see $AutoProduceProbes above)

# Все, больше менять ничего не нужно
# That's it, you do not have to change anything below
#===============================================================================
#===============================================================================

my @AvailableUnitTypes=$Empire->designHouse()->getPrototypes();
my @ProbsClasses;
for (@AvailableUnitTypes){
  push(@ProbsClasses,$_->getProp('building_id')) if $_->getProp('buildingactions')=~/(\A1\Z|\A1,|,1,|,1\Z)/;
}

my $ShipyardClassID=5;
my @Log;

$Empire->fake(0);
my ($xCenter,$yCenter);
my $Fleet=$Empire->this_fleet();
if ($Fleet){
  my $xCenter=$Fleet->getProp('x');
  my $yCenter=$Fleet->getProp('y');
  undef $Fleet;
} else {
  $radius=0;
}

if ($radius){
  $left=$xCenter-$radius;
  $right=$xCenter+$radius;
  $top=$yCenter-$radius;
  $bottom=$yCenter+$radius
}



my $ProbesQueued=0;
my $NewFleets=0;
if ($AutoProduceProbes){
  LogOK('Queuing new probes...');
  foreach ($Empire->planets()->getAllMy()){
    my $x=$_->getProp('x');
    my $y=$_->getProp('y');
    next unless $Empire->harrison($x,$y)->getUnitsByClass($ShipyardClassID);
    if ($AutoProduceProbes && (!$ProduceProbesOnlyWhereNameIs || $_->getProp('name')=~/^$ProduceProbesOnlyWhereNameIs/)){
      my $Queue=$Empire->queue($x,$y);
      if (!$Queue->itemsCount() || $Queue->itemsCount()==1 && $Queue->itemData(0)->{'take_turns'} <= 1){
        if ($Queue->addJob($ProbeClassID)){
          LogINFO('New probe queued at '.$_->getProp('name'));
          $ProbesQueued++;
        } else {
           LogWARN('New probe queue failed at '.$_->getProp('name').' (not enough resources)');
        }
      }
    }
  }
  LogOK("Queued $ProbesQueued new probes.");
}

if ($AutoProbesToFleet){
  LogOK('Transfering probes from harrisons to new fleets...');
  foreach ($Empire->planets()->getAllMy()){
    my $PlanetName=$_->getProp('name');
    next if $ProbesToFleetOnlyWhereNameIs && $PlanetName!~/$ProbesToFleetOnlyWhereNameIs/;
    my $Harrison=$Empire->harrison($_->getProp('x'),$_->getProp('y'));
    for (@ProbsClasses){
      foreach ($Harrison->getUnitsByClass($_)){
        my $NewFleet=$Harrison->createFleetNear($FleetPrefix eq ''?'Explorer':$FleetPrefix);
        $_->transferToAnotherFleet($NewFleet->getProp('id'));
        LogINFO('New fleet '.$NewFleet->getProp('name')." with probe created at $PlanetName");
        $NewFleets++;
      }
    }
  }
  LogOK("$NewFleets new fleets created.");
}

my %ReadyFleets;
my $numFleet=0;
LogOK('Searching fleets to perform explore...');
foreach my $Fleet($Empire->fleets()->getFleetsByName($FleetPrefix.'%')){
   next if $Fleet->getProp('turns_till_arrival');
   my $Probe;
   for (@ProbsClasses){
      last if ($Probe)=$Fleet->getUnitsByClass($_);
   }
   next unless $Probe;
   my $x=$Fleet->getProp('x');
   my $y=$Fleet->getProp('y');
   $numFleet++;
   my $Planet=$Empire->planets()->get($x,$y);
   my $Explored=$Planet->getProp('s');
   unless($Explored){
      if($Probe->performAction(1)){
         LogINFO('Fleet '.$Fleet->getProp('name').' '.
            $Fleet->getProp('id').' had explored '.$x.':'.$y);
         $Explored=1;
      }elsif(grep { $_->{'action'}==1 && $_->{'request_id'} } @{$Probe->getActions()}){
         my $sizeType=$Planet->getProp('img_surface');
         LogINFO('Fleet '.$Fleet->getProp('name').' '.$Fleet->getProp('id')
            ." is researching $x:$y already (size=".(10*$sizeType).'-'
            .(10*$sizeType+9).")");
      }else{
         LogWARN("Error researching $x:$y with ".$Fleet->getProp('name').' '.
            $Fleet->getProp('id').' (not enough resources?)');
           # $Explored=1; # раскомментируем эту строчку и производим один тестовый запуск для выпрыгивания с пустот
      }
   }
   if($Explored){
      unless($Planet->getProp('jumpable')){
         my $Dest=$Empire->planets()->getNearestJumpable($x,$y);
         my $dx=$Dest->getProp('x');
         my $dy=$Dest->getProp('y');
         $Fleet->jump($dx,$dy);
         LogINFO('Fleet '.$Fleet->getProp('name').' '.$Fleet->getProp('id')
            .' from '.$x.':'.$y.' returns to the base '.$dx.':'.$dy);
      }else{
         $ReadyFleets{$Fleet->getProp('id')}=$Fleet->getProp('fly_range');
      }
   }
}


# Составление списков планет для исследования и патрулирования
my @JumpablePlanets;
my %PlanetsForResearch;
my @toReasearch;
my $minSizeType=$MinSizeExplore/10;
planet:
for my $Planet ($Empire->planets->getRectangle($left, $top, $right, $bottom)) {
	my ($x, $y,$image) = map $Planet->getProp($_), qw(x y image);
	next if $radius && sqrt(($xCenter-$x)*($xCenter-$x)+($yCenter-$y)*($yCenter-$y))>$radius;
        next if (($image>=81 and $image<=86) or ($image>=91 and $image<=96));
	if ($Planet->getProp('jumpable')){
		push @JumpablePlanets, "$x:$y";
		next
	}
	next if $Planet->getProp('s');
	my $sizeType=$Planet->getProp('img_surface');
	next if $sizeType<$minSizeType;
	if ($PreventExploreEnemy){
		my $ownerID=$Planet->getProp('owner_id');
		next if $ownerID && $Empire->dipRelation($ownerID) eq '0';
	}
	for my $fl ($Empire->fleets()->getFleetsByLocation($x,$y)){
		for (@ProbsClasses){
			next planet if scalar($fl->getUnitsByClass($_));
		}
	}
	push @{$toResearch[$sizeType]}, "$x:$y";
	$PlanetsForResearch{$x.':'.$y}=$sizeType
}

my @PlanetsForResearch;
push @PlanetsForResearch, @{$toResearch[$_]} for (reverse 0..9);

# Оптимальная рассылка зондов на исследование и патрулирование
LogOK('Sending fleets to explore new worlds...');
foreach my $fleetID(sort{$ReadyFleets{$a}<=>$ReadyFleets{$b}} keys %ReadyFleets){
  my $Fleet=$Empire->fleets()->getFleetByID($fleetID);
  my $range=$ReadyFleets{$fleetID};
  my $x=$Fleet->getProp('x');
  my $y=$Fleet->getProp('y');
  my $bestDist=10000;
  my $bestX;
  my $bestY;
  my $priority;
  foreach(@PlanetsForResearch){
    next unless defined $PlanetsForResearch{$_};
    /^(.+):(.+)\Z/;
    my $dx=$1;
    my $dy=$2;
    next if ($x==$dx)&&($y==$dy);
    my $dist=sqrt(($x-$dx)*($x-$dx)+($y-$dy)*($y-$dy));
    next if $dist>$range;
    if ($dist<$bestDist){
      unless($priority){
       $priority=$PlanetsForResearch{$_}
      } elsif ($priority!=$PlanetsForResearch{$_}){
       last
      }
      $bestDist=$dist;
      $bestX=$dx;
      $bestY=$dy;
    }
  }
  if ($bestDist<10000){
    my $sizeType=$PlanetsForResearch{$bestX.':'.$bestY};
    delete($PlanetsForResearch{$bestX.':'.$bestY});
    $Fleet->jump($bestX,$bestY);
    LogINFO('Fleet '.$Fleet->getProp('name')." $fleetID $x:$y jumps to unexplored planet $bestX:$bestY, size=".
      (10*$sizeType).'..'.(10*$sizeType+9).', distance='.sprintf("%.2f",$bestDist));
  } else {
    my @PlanetsForPatrol;
    foreach(@JumpablePlanets){
      /^(.+):(.+)/;
      my $dx=$1;
      my $dy=$2;
      next if ($x==$dx)&&($y==$dy);
      my $dist=sqrt(($x-$dx)*($x-$dx)+($y-$dy)*($y-$dy));
      next if $dist>=$range;
      push @PlanetsForPatrol, "$dx:$dy";
    }
    my $ind=scalar(@PlanetsForPatrol);
    if($ind){
      $_=$PlanetsForPatrol[rand() * $ind];
      /^(.+):(.+)/;
      my $dx=$1;
      my $dy=$2;
      $Fleet->jump($dx,$dy);
        LogWARN('Fleet '.$Fleet->getProp('name')." $fleetID $x:$y patrols $dx:$dy".
        ' distance='.sprintf("%.2f",sqrt(($x-$dx)*($x-$dx)+($y-$dy)*($y-$dy))));
    } else {
      LogWARN('Fleets '.$Fleet->getProp('name')." $fleetID remains on $x:$y as a patrol");
    }
  }
}


$Empire->clearLog();
for (@Log){
  $Empire->log($_->[0],$_->[1]);
}
$Empire->ok(1);

sub LogOK{push(@Log,[0,shift])}
sub LogINFO{push(@Log,[1,shift])}
sub LogWARN{push(@Log,[2,shift])}
