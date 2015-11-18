my $WorkMode = 1;

my $demolish_farms='%demolish_farms%';
my $min_planet_size='%min_planet_size%';
my $min_population='%min_population%';
my $ignore_customs='%ignore_customs%';
my $ignore_plants='%ignore_plants%';

my $DebugMode = $Empire->readVariable('DebugScripts');
$WorkMode = ( ($Empire->readVariable('TestScripts')) || ($DebugMode) || $WorkMode);

if ($DebugMode)
{
  $Empire->log(1, 'Params...');
  $Empire->log(1, '$demolish_farms='.$demolish_farms."\n");
  $Empire->log(1, '$min_planet_size='.$min_planet_size."\n");
  $Empire->log(1, '$min_population='.$min_population."\n");
  $Empire->log(1, '$ignore_customs='.$ignore_customs."\n");
  $Empire->log(1, '$ignore_plants='.$ignore_plants."\n");
}

if (!$WorkMode)
{
  $Empire->log(3, 'Скрипт находится в стадии тестирования и временно недоступен игрокам. Пожалуйста, подождите несколько дней.'."\n");
  last;
}

$Empire->fake(0);

my $res_main = $Empire->getProp('industry_nature');
my $mine_building = -1;
if ($res_main =~ /o/) { $mine_building = 2; }
if ($res_main =~ /e/) { $mine_building = 3; }
if ($res_main =~ /m/) { $mine_building = 1; }

my $res_sec = $Empire->getProp('unused_resource');
my $sec_building = -1;
if ($res_sec =~ /o/) { $sec_building = 2; }
if ($res_sec =~ /e/) { $sec_building = 3; }
if ($res_sec =~ /m/) { $sec_building = 1; }

my $res_grow= $Empire->getProp('race_nature');
my $growth_building = -1;
if ($res_grow=~ /o/) { $growth_building = 2; }
if ($res_grow=~ /e/) { $growth_building = 3; }
if ($res_grow=~ /m/) { $growth_building = 1; }


for $pl ($Empire->planets->getAllMy)
{
  my $s = $pl->getProp('s');
  next if ($s < $min_planet_size);
  next if $pl->getProp('population') < $min_population;
  my $x = $pl->getProp('x');
  my $y = $pl->getProp('y');

  my $har = $Empire->harrison($x, $y);
  if ($ignore_plants)
  {
    next if scalar($har->getUnitsByClass(14));
  }
  if ($ignore_customs)
  {
    next if scalar($har->getUnitsByClass(22));
  }
  if ($har->getUnitsByClass(12))  { $s--; }
  if ($har->getUnitsByClass(43))  { $s--; }

  my $pl_main = $pl->getProp($res_main);
  my $pl_sec = $pl->getProp($res_sec);
  my $income_main = ($s*2000-1) * ($pl_main/900)*($pl_main/900)*($pl_main/900) * (1+ ( int(($s*2000-1)/5000) / 5 ) );
  my $income_sec = (1/2) * ($s*2000-1) * ($pl_sec/900)*($pl_sec/900)*($pl_sec/900) * (1+ ( int(($s*2000-1)/5000) / 5 ) );

  my $bld0 = scalar($har->getUnitsByClass($mine_building)) +
                   scalar($har->getUnitsByClass($sec_building));

  my $max_pop = $s * 2000-5;
  my $bld1 = int(($max_pop)/5000);
  if ($har->getUnitsByClass(4))  { $bld1--; }
  if ($har->getUnitsByClass(5))  { $bld1--; $bld1--; }
  if ($har->getUnitsByClass(32))  { $bld1--; $bld1--; }
  if ($har->getUnitsByClass(25))  { $bld1-=4; }
  if ($har->getUnitsByClass(28))  { $bld1-=8; }
  if ($har->getUnitsByClass(22))  { $bld1-=10; }
  for $plant($har->getUnitsByClass(14)) { $bld1-=6; }
  for $plant($har->getUnitsByClass(31)) { $bld1-=5; }
  for $plant($har->getUnitsByClass(37)) { $bld1-=10; }

  my $que = $Empire->queue($x, $y);
  for (my $i = 0; $i < $que->itemsCount; $i++)
  {
    my $q_item = $que->itemData($i);
    my $c = $q_item->{'class'};
    if ($c == $mine_building) { $bld0++; }
    if ($c == $sec_building) { $bld0++; }
    if ($c == $growth_building) { $bld1--; }
    if ($c == 4)  { $bld1--; }
    if ($c == 5)  { $bld1--; $bld1--; }
    if ($c == 32)  { $bld1--; $bld1--; }
    if ($c == 25)  { $bld1-=4; }
    if ($c == 28)  { $bld1-=8; }
    if ($c == 22)
    {
      $bld1-=10;
      if ($ignore_customs) { $bld1-=100; }
    }
    if ($c == 14)
    {
      $bld1-=6;
      if ($ignore_plants) { $bld1-=100; }
    }
    if ($c == 31) { $bld1-=5; }
    if ($c == 37) { $bld1-=10; }
  }

  my $bld2 = int(($pl->getProp('population'))/5000);

  $Empire->log(1, $pl->getProp('name').' - '.$bld1.'/'.$bld2.' bld0='.$bld0.' $income_main='.$income_main.' $income_sec='.$income_sec);

  my $s = '';
  my $stat_demolished = 0;
  my $free_pepl = $pl->getProp('free_pepl');
  if ($demolish_farms)
  {
    if ($bld2 == $bld1)
    {
      for $un($har->getUnitsByClass($growth_building))
      {
        $Empire->log(1, $pl->getProp('name').' - взрываю природу');
        $un->disband;
        $free_pepl += 5000;
        $stat_demolished++;
      }
    }
  }

  next if $bld0 >= $bld1;


  if ($demolish_farms)
  {
    if ( $free_pepl < 5000 )
    {
      for $un($har->getUnitsByClass($growth_building))
      {
        $Empire->log(1, $pl->getProp('name').' - взрываю лишнее здание (прирост) чтобы ставить в очередь');
        $un->disband;
        $free_pepl += 5000;
        $bld0--;
        $stat_demolished++;
        last;
      }
    }
    if ( $free_pepl < 5000 )
    {
      for $un($har->getUnitsByClass($sec_building))
      {
        $Empire->log(1, $pl->getProp('name').' - взрываю лишнее здание (вторичка) чтобы ставить в очередь');
        $un->disband;
        $free_pepl += 5000;
        $bld0--;
        $stat_demolished++;
        last;
      }
    }
    if ( $free_pepl < 5000 )
    {
      for $un($har->getUnitsByClass($mine_building))
      {
        $Empire->log(1, $pl->getProp('name').' - взрываю лишнее здание (первичка) чтобы ставить в очередь');
        $un->disband;
        $free_pepl += 5000;
        $bld0--;
        $stat_demolished++;
        last;
      }
    }
  }

  my $stat_build = 0;

  if ($free_pepl >= 5000)
  {
    while ($bld0 < $bld1)
    {
      if ($income_main > $income_sec)
      {
         $Empire->log(1, $pl->getProp('name').' - строю добывалку первички');
         $que->addJob($mine_building);
      }
      else
      {
         $Empire->log(1, $pl->getProp('name').' - строю добывалку вторички');
         $que->addJob($sec_building);

      }
      $stat_build++;
      $bld0++;
    }
  }
  if ($stat_demolished)
  {
    $s = $s.' взорвано зданий: '.$stat_demolished;
  }
  if ($stat_build)
  {
    if ($s) { $s = $s.';'; }
    if ($income_main > $income_sec)
    {
      $s = $s.' добываем основной ресурс';
    }
    else
    {
      $s = $s.' добываем вторичный ресурс';
    }
    $s = $s.', поставлено в очередь постройки зданий: '.$stat_build;
  }
  if ($s)
  {
    push @log, $x.':'.$y.' ('.$pl->getProp('name').'): '.$s;
  }
}

if (!$DebugMode)
{
  $Empire->clearLog;
}
foreach $log(@log)
{
  $Empire->log(0, $log."\n");
}
