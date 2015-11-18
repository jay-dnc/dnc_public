my $WorkMode = 1;

my $DebugMode = $Empire->readVariable('DebugScripts');
$WorkMode = ( ($Empire->readVariable('TestScripts')) || ($DebugMode) || $WorkMode);

if (!$WorkMode)
{
  $Empire->log(3, 'Скрипт находится в стадии тестирования и временно недоступен игрокам. Пожалуйста, подождите несколько дней'."\n");
  last;
}

my $lt = '%lt%';
my $rb = '%rb%';
my $adv_gatherer = '%adv_gatherer%';
my $res_type = '%res_type%';
my $part_level = '%part_level%';
my $part_bonus = '%part_bonus%';
my $limit = '%limit%';
my $hide_working = '%hide_working%';

my $left=0;
my $top=0;
my $right=0;
my $bottom=0;
($left,$top) = split(/:/, $lt, 2);
($right,$bottom) = split(/:/, $rb, 2);

my $total_bonus = (1+$part_bonus/100)/2;
if ($adv_gatherer)
{
  $total_bonus*= (1+$part_level*0.04);
}
else
{
  $total_bonus*= (1+$part_level*0.03);
}
my $radius = 4;
if ($adv_gatherer)
{
  $radius = 7;
}

sub m_time;
my $starttime = (m_time);
sub m_time
{
  my ($s, $m, $h) = localtime;
  return $s + 60*($m + ($h * 60)) - $starttime;
}
sub Timeout { m_time > 60 }
sub Timeout2 { m_time > 110 }

my @asteroids;

my $max_income = 0;

my $stat_total = 0;
my $stat_done = 0;
for $my_pl($Empire->planets->getAllMy)
{
  $stat_total++;
  next if Timeout;
  $stat_done++;

#  next unless $my_pl->getProp('x') == 793;

  my $corruption = $my_pl->getProp('corruption');
#  my $corruption = $my_pl->getProp('s');
  if (!$corruption) { $corruption = 0; }
  next if $corruption > 70;

  my $my_x = $my_pl->getProp('x');
  next if $my_x < $left - $radius;
  next if $my_x > $right + $radius;
  my $my_y = $my_pl->getProp('y');
  next if $my_y < $top - $radius;
  next if $my_y > $bottom + $radius;

#  for $pl($Empire->planets->getReacheble($my_x, $my_y, $radius))
  my $x1 = $my_x-$radius; if ($x1 <=0) { $x1 = 1; }
  my $y1 = $my_y-$radius; if ($y1 <=0) { $y1 = 1; }
  my $x2 = $my_x+$radius; if ($x2 > 1000) { $x2 = 1000; }
  my $y2 = $my_y+$radius; if ($y2 > 1000) { $y2 = 1000; }
  for $pl($Empire->planets->getRectangle($x1, $y1, $x2, $y2))
  {
    next if $pl->getProp('owner_id');
    next if $pl->getProp('jumpable');
    my $x = $pl->getProp('x');
    next if $x < $left;
    next if $x > $right;
    my $y = $pl->getProp('y');
    next if $y < $top;
    next if $y > $bottom;

    my $dist1 = ($x-$my_x )*($x-$my_x ) + ($y-$my_y )*($y-$my_y );
    next if $dist1 > $radius*$radius;

    my $s = $pl->getProp('s');
    next unless $s > 0;
    my $m = $pl->getProp($res_type);
    if ($adv_gatherer)
    {
      $s = 130-$s*2;
      $m = 105-$m;
    }
    else
    {
      $s = 95-$s*3/2;
      $m = 100-$m;
    }
    my $income = int($s*$m*$total_bonus*(1-$corruption/100));
    if ($income > $max_income)
      { $max_income = $income; }
    next if $income < $limit;

    $Empire->log(1, $x.':'.$y.'  income='.$income.' ($s='.$s.', $m='.$m.')');
    push @asteroids, $x.':'.$y.':'.$income.':'.$corruption.':'.$my_x.':'.$my_y;
  }
}
if (!$DebugMode)
{
  $Empire->clearLog;
}

my @log;

my $next_income = 0;
while($max_income)
{
  last if Timeout2;
  last unless $max_income;

  $next_income = 0;
  for $a(@asteroids)
  {
    my $x = 0;
    my $y = 0;
    my $income = 0;
    my $corruption = 0;
    my $my_x = 0;
    my $my_y = 0;
    ($x, $y, $income, $corruption, $my_x, $my_y) = split(/:/, $a, 6);
#    $Empire->log(1, $a.'->'.$x.'+'.$y.'+'.$income.'...');
    next unless $income;
    next if ($income > $max_income);
    if ($income < $max_income)
    {
      if ($income > $next_income)
      {
        $next_income = $income;
      }
      next;
    }
    my $skip = 0;
    for $a2(@asteroids)
    {
      my $x2 = 0;
      my $y2 = 0;
      my $income2 = 0;
      my $corruption2 = 0;
      my $my_x2 = 0;
      my $my_y2 = 0;
      ($x2, $y2, $income2, $corruption2, $my_x2, $my_y2) = split(/:/, $a2, 6);
      next unless (($x == $x2) && ($y == $y2));
      next if (($my_x == $my_x2) && ($my_y == $my_y2));
      my $dist1 = ($x-$my_x )*($x-$my_x ) + ($y-$my_y )*($y-$my_y );
      my $dist2 = ($x-$my_x2)*($x-$my_x2) + ($y-$my_y2)*($y-$my_y2);
      if ($dist2 < $dist1)
      {
        $skip = 1;
        next;
      }
      if (($dist2 == $dist1) && ($income2 > $income))
      {
        $skip = 1;
      }
    }
    next if $skip;
    my $str = '';
    my $found = 0;
    my $working = 0;
    for $fl ($Empire->fleets->getFleetsByLocation($x, $y))
    {
      for $un($fl->getAllUnits)
      {
        for my $act (@{ $un->getActions } )
        {
          if (
              ( ($adv_gatherer)&&($act->{'action'}==104)) ||
              ((!$adv_gatherer)&&($act->{'action'}==103))
             )
          {
            if ($fl->getProp('turns_till_arrival'))
            {
              $str = 'летит';
            }
            elsif ($act->{'request_id'})
            {
              $str = 'работает';
              $working = 1;
            }
            else
            {
              $str = 'висит, но не работает';
            }
            $str = $str.' флот "'.$fl->getProp('name');
            if ($adv_gatherer)
            {
              $str = $str.'" с продвинутым сборщиком астероидов';
            }
            else
            {
              $str = $str.'" со сборщиком астероидов';
            }

            $found = 1;
            last;
          }
        }
        last if $found;
      }
    }
    if (!found)
    {
      my $coordstr = $x.':'.$y;
      foreach $variable ($Empire->getVariablesNames)
      {
        next unless ($variable =~ /^RouteFor(.*)/);
        my $fleetID=$1;
        my $val =  $Empire->readVariable($variable);
        next unless $val =~ /$coordstr/;
        next unless $coordstr =~ /$val/;
        my $fl = $Empire->fleets->getFleetByID($fleetID);
        if ($fl)
        {
          for $un($fl->getAllUnits)
          {
            for my $act (@{ $un->getActions } )
            {
              if (
                  ( ($adv_gatherer)&&($act->{'action'}==104)) ||
                  ((!$adv_gatherer)&&($act->{'action'}==103))
                 )
              {
                $str = 'летит маршрутизатором флот "'.$fl->getProp('name');
                if ($adv_gatherer)
                {
                  $str = $str.'" с продвинутым сборщиком астероидов';
                }
                else
                {
                  $str = $str.'" со сборщиком астероидов';
                }

                $found = 1;
                last;
              }
            }
            last if $found;
          }
        }
      }
    }
    if ((!$working) || (!$hide_working))
    {
      if ($str)
      {
        $str = '; '.$str;
      }
      push @log, $x.':'.$y.' - добыча '.$income.' '.$res_type.' (коррупция '.$corruption.'% от '.$my_x.':'.$my_y.')'.$str."\n";
    }
  }
  $max_income = $next_income;
}

$Empire->log(1, 'Рассчитано планет '.$stat_done.' из '.$stat_total);
if (!$DebugMode)
{
  $Empire->clearLog;
}

if ($stat_done < $stat_total)
{
  $Empire->log(3, 'Расчет не выполнен в полном объеме, обработано только '.int(100*$stat_done/$stat_total).'% планет.'."\n");
}
my $output_count = 0;
foreach $log(@log)
{
  $Empire->log(0, $log);
  $output_count++;
}
if ((!$output_count) && ($stat_done == $stat_total))
{
  $Empire->log(2, 'В квадрате '.$left.':'.$top.'-'.$right.':'.$bottom.' не найдено ни одной свободной планеты, с которой собрать более '.$limit.$res_type."\n");
  if ($adv_gatherer)
  {
    $Empire->log(2, 'Для расчета задан тип сборщика астероидов: продвинутый, уровень детали: '.$part_level.', бонус добычи производителя детали: '.$part_bonus."\n");
  }
  else
  {
    $Empire->log(2, 'Для расчета задан тип сборщика астероидов: простой, уровень детали: '.$part_level.', бонус добычи производителя детали: '.$part_bonus."\n");
  }
}
