# !!! По окончании тестирования раскомментировать строчку ниже
my $WorkMode = 1; 

my $PlanetAddr='%planet%';
my $fleet_name='%fleet_name%';
my $fleet_ext_name='%fleet_ext_name%';
my $fleet_prototype='%fleet_prototype%';
my $units_by_fleet='%units_by_fleet%';
my $load_protorype='%load_protorype%';
my $hide_fleets='%hide_fleets%'; 

#$Empire->writeVariable('DebugScripts', 0);
#$Empire->writeVariable('TestScripts', 1);

my @log;

$Empire->fake(0);

my $DebugMode = $Empire->readVariable('DebugScripts');
$WorkMode = ( ($Empire->readVariable('TestScripts')) || ($DebugMode) || $WorkMode);

if (!$WorkMode)
{
  $Empire->log(3, 'Скрипт находится в стадии тестирования и временно недоступен игрокам. Пожалуйста, подождите несколько дней\n');
  last;
}

if ($DebugMode)
{
  $Empire->log(1, "Переданы параметры...\n");
  $Empire->log(1, '$PlanetAddr='.$PlanetAddr."\n");
  $Empire->log(1, '$fleet_name='.$fleet_name."\n");
  $Empire->log(1, '$fleet_ext_name='.$fleet_ext_name."\n");
  $Empire->log(1, '$fleet_prototype='.$fleet_prototype."\n");
  $Empire->log(1, '$units_by_fleet='.$units_by_fleet."\n");
  $Empire->log(1, '$hide_fleets='.$hide_fleets."\n");
}
my $params_ok = 1;

if (!$fleet_name)
{
  push @log, 'Не указано имя для создаваемых флотов.';
  $params_ok = 0;
}
elsif (!$fleet_prototype)
{
  push @log, 'Не указано название или id прототипа юнитов, которые будут использованы для создания новых флотов.';
  $params_ok = 0;
}
elsif (!$units_by_fleet)
{
  push @log, 'Не указано максимальное количество юнитов во флоте.';
  $params_ok = 0;
}
elsif ($units_by_fleet =~ /(\D)/) 
{
  push @log, 'Количество юнитов во флоте должно быть натуральным числом.';
  $params_ok = 0;
}

my $total_fleets = 0;

if ( ($WorkMode) && ($params_ok) )
{
  my $last_fleet = undef;
  my @ChoosenPlanets;

  if ($PlanetAddr eq 'all'){
    @ChoosenPlanets=$Empire->planets()->getAllMy();
  } else {
    $PlanetAddr=~/^(\d+):(\d+)$/;
    $ChoosenPlanets[0]=$Empire->planets()->get($1,$2);
  }

  sub CreateFleets
  {
    my ($probeid) = @_;
    for $pl (@ChoosenPlanets)
    {
      my $log_str = undef;
      my $units_counter = 999999;
      my $fl = undef;

      my $har = $Empire->harrison($pl->getProp('x'), $pl->getProp('y'));
      for $un ($har->getUnitsByClass($probeid))
      {
        $Empire->log(1, '$units_counter='.$units_counter.' / $units_by_fleet='.$units_by_fleet);
        if (($units_counter >= $units_by_fleet) || ($units_counter >= 999999))
        {
          if ($log_str)
          {
            $log_str = $log_str.', кол-во юнитов: '.$units_counter;
            if (($hide_fleets) && ($fl))
            {
              my $fl_hid = $Empire->fleets->getFleetByID($fl->getProp('id'));
              if ($fl_hid->getProp('stealth_lvl') > 0)
              {
                $fl_hid->show(0);
                $log_str = $log_str.', включаю невидимость';
              }
            }
            push @log, $log_str;

          }
          $fl = undef;
          $log_str = 'В '.$pl->getProp('x').':'.$pl->getProp('y').' ('.$pl->getProp('name').') создан флот "'.$fleet_name.'"';
          $fl = $har->createFleetNear("temp");
          $total_fleets++;
          $units_counter = 0;
        }
        $un->transferToAnotherFleet( $fl->getProp('id') );
        $units_counter++;

        $fl->Rename($fleet_name, $fleet_ext_name);
      }
      if ($log_str)
      {
        $log_str = $log_str.', кол-во юнитов: '.$units_counter;
        if (($hide_fleets) && ($fl))
        {
          my $fl_hid = $Empire->fleets->getFleetByID($fl->getProp('id'));
          if ($fl_hid->getProp('stealth_lvl') > 0)
          {
            $fl_hid->show(0);
            $log_str = $log_str.', включаю невидимость';
          }
        }
        push @log, $log_str;
      }
    }
  }

  if($fleet_prototype !~ /(\D)/) 
  {
    $Empire->log(1, 'Указан конкретный ID прототипа');
    CreateFleets($fleet_prototype);
  }
  else
  {
    $Empire->log(1, 'Ищу прототип по имени');
    my $found = 0;
    for $proto ($Empire->designHouse()->getPrototypes())
    {
      my $proto_name = $proto->getProp('s_name');
      next if ($proto_name !~ /$fleet_prototype/);
      next if ($fleet_prototype !~ /$proto_name/);
      $Empire->log(1, 'id прототипа = '.$proto->getProp('building_id'));
  
      CreateFleets($proto->getProp('building_id'));
      $found++;
    }
    if (!$found)
    {
      push @log, 'Прототип "'.$fleet_prototype.'" не найден. Проверьте, правильно ли Вы указали имя прототипа.';
      $params_ok = 0;
    }
  }
}

if (!$DebugMode)
{
  $Empire->clearLog;
}

if (!$params_ok)
{
  $Empire->log(3, 'Скрипт не может быть выполнен. ');
}
else
{
  if ($total_fleets)
  {
    $Empire->log(1, 'Создано флотов: '.$total_fleets."\n"); 
  }
  else
  {
    if ($PlanetAddr eq 'all')
    {
      $Empire->log(2, 'Ни одного юнита "'.$fleet_prototype.'" не найдено.'." Проверьте, правильно ли Вы указали имя прототипа.\n"); 
    }
    else
    {
      $Empire->log(2, 'На планете '.$PlanetAddr.' ни одного юнита "'.$fleet_prototype.'" не найдено.'." Проверьте, правильно ли Вы указали планету и имя прототипа.\n"); 
    }
  }
}

foreach $log(@log)
{
  $Empire->log(0, $log."\n");
}
