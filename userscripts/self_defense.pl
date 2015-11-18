my $WorkMode = 1;

my $prototype_name='%prototype_name%';
my $units_amount='%units_amount%';
my $min_planet_size='%min_planet_size%';
my $min_population='%min_population%';
my $ignore_customs='%ignore_customs%';
my $ignore_plants='%ignore_plants%';
my $ignore_queue='%ignore_queue%';

$Empire->fake(0);

my $DebugMode = $Empire->readVariable('DebugScripts');
$WorkMode = ( ($Empire->readVariable('TestScripts')) || ($DebugMode) || $WorkMode);

if (!$WorkMode)
{
  $Empire->log(3, 'Скрипт находится в стадии тестирования и временно недоступен игрокам. Пожалуйста, подождите несколько дней.'."\n");
  last;
}

if ($DebugMode)
{
  $Empire->log(1, 'Params...');
  $Empire->log(1, '$prototype_name='.$prototype_name."\n");
  $Empire->log(1, '$units_amount='.$units_amount."\n");
  $Empire->log(1, '$min_planet_size='.$min_planet_size."\n");
  $Empire->log(1, '$min_population='.$min_population."\n");
  $Empire->log(1, '$ignore_customs='.$ignore_customs."\n");
  $Empire->log(1, '$ignore_plants='.$ignore_plants."\n");
  $Empire->log(1, '$ignore_queue='.$ignore_queue."\n");
}

my @log;

my $params_ok = 1;

if (!$prototype_name)
{
  push @log, 'Не указано название или id прототипа юнитов, которые будут использованы для создания новых флотов.';
  $params_ok = 0;
}
elsif (!$units_amount)
{
  push @log, 'Не указано максимальное количество юнитов в гарнизоне.';
  $params_ok = 0;
}
elsif ($units_amount > 999)
{
  push @log, 'Вы пытаетесь построить слишком много юнитов.';
  $params_ok = 0;
}

my $proto_id = 0;
if($prototype_name !~ /(\D)/)
{
  $Empire->log(1, 'Указан конкретный ID прототипа');
  $proto_id = $prototype_name;
}
else
{
  $Empire->log(1, 'Ищу прототип по имени');
  if ($prototype_name eq 'Форпост')
  {
    $proto_id = 107;
  }
  elsif ($prototype_name eq 'Колония')
  {
    $proto_id = 7;
  }
  else
  {
    for $proto ($Empire->designHouse()->getPrototypes())
    {
      my $proto_name = $proto->getProp('s_name');
      next unless $proto_name eq $prototype_name;
      next if $proto_id > $proto->getProp('building_id');
      $Empire->log(1, 'id прототипа = '.$proto->getProp('building_id'));
      $proto_id = $proto->getProp('building_id');
    }
    if (!$proto_id)
    {
      my $def_shassis = 0;
      my $def_weight = 0;
      if ($prototype_name eq 'Шаттл')
      {
        $def_shassis = 1;
      }
      elsif ($prototype_name eq 'Зонд')
      {
        $def_shassis = 11;
      }
      elsif ($prototype_name eq 'Силы самообороны')
      {
        $def_shassis = 108;
      }
      elsif ($prototype_name eq 'Пехота')
      {
        $def_shassis = 109;
      }
      elsif ($prototype_name eq 'Боевые роботы')
      {
        $def_shassis = 110;
      }
      elsif ($prototype_name eq 'Танк')
      {
        $def_shassis = 111;
      }
      elsif ($prototype_name eq 'Бункер')
      {
        $def_shassis = 112;
      }
      elsif ($prototype_name eq 'Орбитальная крепость')
      {
        $def_shassis = 27;
      }

      if ($def_shassis)
      {
        for $proto ($Empire->designHouse()->getPrototypes())
        {
          next if $proto->getProp('s_name');
          next unless $proto->getProp('weight');
          next unless $proto->getProp('carapace') == $def_shassis;
          $proto_id = $proto->getProp('building_id');
          last;
        }
      }
    }
  }
  if (!$proto_id)
  {
    push @log, 'Прототип "'.$prototype_name.'" не найден. Проверьте, правильно ли Вы указали имя прототипа.';
    $params_ok = 0;
  }
}

if (!$params_ok)
{
  if (!$DebugMode)
  {
    $Empire->clearLog;
  }
  $Empire->log(3, 'Скрипт не может быть выполнен. ');
  foreach $log(@log)
  {
    $Empire->log(3, $log."\n");
  }
  last;
}

for $pl ($Empire->planets->getAllMy)
{
#  next if $pl->getProp('x') == 877;

  next if ($pl->getProp('s') < $min_planet_size);
  next if ($pl->getProp('population') < $min_population);
  my $x = $pl->getProp('x');
  my $y = $pl->getProp('y');
  my $q = $Empire->queue($x, $y);
  my $ic1 = $q->itemsCount;
  if ($ignore_queue)
  {
    next if $ic1;
  }
  my $har = $Empire->harrison($x, $y);
  if ($ignore_plants)
  {
    next if scalar($har->getUnitsByClass(14));
  }
  if ($ignore_customs)
  {
    next if scalar($har->getUnitsByClass(22));
  }

  my $amount_ready = 0;
  my $amount_build = 0;
  for $un($har->getUnitsByClass($proto_id))
  {
    $amount_ready++;
  }
  for (my $i = 0; $i < $ic1; $i++)
  {
    my $q_item = $q->itemData($i);
    next unless $q_item->{'class'} == $proto_id;
    $amount_build++;
  }
  next if ($amount_ready+$amount_build >= $units_amount);
  my $amount_added = 0;
  while ($amount_ready+$amount_build+$amount_added < $units_amount)
  {
    $q->addJob($proto_id);
    $amount_added++;
  }
  my $q2 = $Empire->queue($x, $y);
  my $ic2 = $q2->itemsCount;
  if (!$ic2)
  {
    $amount_added = 0;
  }
  else
  {
    $amount_added = $ic2 - $ic1;
  }

  my $str = $x.':'.$y.' ('.$pl->getProp('name').') - ';
  if (!$amount_added)
  {
    $str = $str.'постройка юнитов "'.$prototype_name.'" невозможна.'
  }
  else
  {
    $str = $str.'заказано новых юнитов "'.$prototype_name.'": '.$amount_added.'.';
    if (($amount_ready)||($amount_build))
    {
      $str = $str.' В гарнизоне: '.$amount_ready.'. Было в очереди ранее: '.$amount_build;
    }
  }
  push @log, $str;
}

if (!$DebugMode)
{
  $Empire->clearLog;
}
foreach $log(@log)
{
  if ($log =~ /невозможна/)
  {
    $Empire->log(2, $log."\n");
  }
  else
  {
    $Empire->log(1, $log."\n");
  }
}
