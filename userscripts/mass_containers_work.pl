my $s = '%res%';
my $PlanetAddr='%planet%';
my $UnloadFleets=0;

# Based on Resource Unpacker v1.0
# ©GPLv2 Author: Trest (27049)

$Empire->fake(0); #не обязательно

my @Out; # список сообшений скрипта

# ищем планеты с таможней
my @ChoosenPlanets;

if ($PlanetAddr eq 'all'){
  @ChoosenPlanets=$Empire->planets()->getAllMy();
} else {
  $PlanetAddr=~/^(\d+):(\d+)$/;
  $ChoosenPlanets[0]=$Empire->planets()->get($1,$2);
}

my %Colors=(
    'o' => 'Green',
    'c' => 'Yellow',
    'e' => 'Aqua',
    'm' => 'Red'
  );
my @ContainerClasses=(23,24);# =оприходованный контейнер,неоприходованный контейнер
my $PlanetsFound=0;
my $Cistomized=0;
my $Unpacked=0;
my $Unloaded=0;
for my $Planet (@ChoosenPlanets) {
  my ($x,$y) = map {$Planet->getProp($_)} qw( x y );
  my $Harrison=$Empire->harrison($x,$y);
  # 22=таможня
  next unless $Harrison->getUnitsByClass(22);
  $PlanetsFound++;

  if ($UnloadFleets){
    my @Fleets=$Empire->fleets()->getFleetsByLocation($x,$y);
    for my $Fleet (@Fleets){
      my @Containers=$Fleet->getUnitsByClass(@ContainerClasses);
      for my $Container (@Containers){
        if ($Container->getProp('tag')=~/<res-in-pack /){
          $Container->transferToAnotherFleet(0);
          $Unloaded++;
        }
      }
    }
  }

  for my $Unit (($Harrison->getUnitsByClass(@ContainerClasses))){
   # проверяем что в контейнере (tag)
    my ($uid,$tag,$class) = map {$Unit->getProp($_)} qw( id tag building_id);

    if ($tag=~/<res-in-pack res="(.)" amount="(\d+)"\/>/) { #контейнер с ресурсами
      my $r=$1; #какой ресурс?(oemc)
      my $Summ=$2;
      next unless $r=~/[$s]/i;

    # для любых ресурсов надо сначала растаможить (оприходовать):
      if($class==24) { #24=контейнер пока не оприходован
        my $q=$Empire->queue($x,$y);
        $Cistomized++;
        my $ok=$q->addCustomizeTask($uid); #растаможка - в очередь!
        push @Out,"$x:$y - Customized [style=color:$Colors{$r}]$Summ$r\[/style] ($ok)\n";
      } else { #проверить тот ли ресурс который нужен
        $Unpacked++;
        my $ok=$Unit->unpack(); #распаковка!
        push @Out,"$x:$y - Unpzcked [style=color:$Colors{$r}]$Summ$r\[/style] ($ok)\n";
      }
    }
  }
}

#пишем сообшения в лог скрипта
$Empire->clearLog();
$Empire->log(0,"Planets with customs: $PlanetsFound\n");
$Empire->log(0,"Unloaded: $Unloaded\n") if $Unloaded;
$Empire->log(0,"Customized: $Cistomized\n");
$Empire->log(0,"Unpacked: $Unpacked\n");
if ($Cistomized || $Unpacked){
  $Empire->log(0,"[spoiler=Details]\n");
  $Empire->log(0,join('',@Out).'[/spoiler]');
}
